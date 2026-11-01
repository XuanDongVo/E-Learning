"use client";

import { useEffect, useState } from "react";

export type AttemptBrowserLockState = "CHECKING" | "OWNED" | "CONFLICT";

/** Best-effort tab guard. The backend remains the authority for Attempt access. */
export function useAttemptBrowserLock(lockName: string | null): AttemptBrowserLockState {
  const [state, setState] = useState<AttemptBrowserLockState>("CHECKING");

  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | undefined;

    if (!lockName) {
      setState("CHECKING");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.locks?.request) {
      // Web Locks is only a browser-level guard; do not turn lack of support into
      // an application error because the server still validates the Attempt.
      setState("OWNED");
      return;
    }

    setState("CHECKING");

    void navigator.locks
      .request(lockName, { mode: "exclusive", ifAvailable: true }, async (lock) => {
        if (cancelled) return;
        if (!lock) {
          setState("CONFLICT");
          return;
        }

        setState("OWNED");
        await new Promise<void>((resolve) => {
          release = resolve;
          if (cancelled) resolve();
        });
      })
      .catch(() => {
        // A browser API failure must not replace the backend's authorization/session checks.
        if (!cancelled) setState("OWNED");
      });

    return () => {
      cancelled = true;
      release?.();
    };
  }, [lockName]);

  return state;
}
