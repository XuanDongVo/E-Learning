"use client";

import { useEffect, useState } from "react";

export type AttemptBrowserLockState =
  | "CHECKING"
  | "OWNED"
  | "CONFLICT"
  | "UNSUPPORTED"
  | "ERROR";

/**
 * Holds an exclusive same-origin lock for the mounted Attempt page.
 * The callback waits until the page unmounts, so the lock is not released
 * after the start/resume HTTP request finishes.
 */
export function useAttemptBrowserLock(lockName: string | null): AttemptBrowserLockState {
  const [state, setState] = useState<AttemptBrowserLockState>("CHECKING");

  useEffect(() => {
    let cancelled = false;
    let releaseLock: (() => void) | undefined;

    if (!lockName) {
      setState("CHECKING");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.locks?.request) {
      setState("UNSUPPORTED");
      return;
    }

    setState("CHECKING");

    void navigator.locks.request(
      lockName,
      { mode: "exclusive", ifAvailable: true },
      async (lock) => {
        if (cancelled) return;
        if (!lock) {
          setState("CONFLICT");
          return;
        }

        setState("OWNED");
        await new Promise<void>((resolve) => {
          releaseLock = resolve;
          if (cancelled) resolve();
        });
      },
    ).catch(() => {
      if (!cancelled) setState("ERROR");
    });

    return () => {
      cancelled = true;
      releaseLock?.();
    };
  }, [lockName]);

  return state;
}
