"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function isFullscreenSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.documentElement.requestFullscreen === "function"
  );
}

interface UseAttemptGuardOptions {
  /** Only while the attempt is ACTIVE. */
  enabled?: boolean;
  /** Debounce leave detection to absorb F5 / short visibility blips (ms). */
  leaveDebounceMs?: number;
  onAwayChange?: (away: boolean, count: number) => void;
}

/**
 * Fullscreen UX + soft leave monitoring for formal attempts.
 *
 * Browser rule: requestFullscreen must run from a user gesture — it cannot
 * auto-fire on mount. Until the student successfully enters fullscreen once
 * in this page lifetime (`armed`), we do NOT increment leaveCount.
 *
 * F5 / reload resets in-memory leaveCount and armed (expected).
 * System dialogs that briefly hide the tab are absorbed by debounce when armed.
 */
export function useAttemptFullscreen({
  enabled = true,
  leaveDebounceMs = 400,
  onAwayChange,
}: UseAttemptGuardOptions = {}) {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && document.fullscreenElement !== null,
  );
  const [isSupported] = useState(isFullscreenSupported);

  /** True only after enterFullscreen succeeds at least once this mount. */
  const [armed, setArmed] = useState(false);
  /** Student is outside the allowed surface (only meaningful when armed). */
  const [away, setAway] = useState(false);
  /** In-memory only — never persisted. Resets on F5. */
  const [leaveCount, setLeaveCount] = useState(0);

  const armedRef = useRef(false);
  const prevAwayRef = useRef(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAwayChangeRef = useRef(onAwayChange);
  onAwayChangeRef.current = onAwayChange;

  useEffect(() => {
    const syncFullscreen = () => {
      const on = document.fullscreenElement !== null;
      setIsFullscreen(on);
      // Returning via browser chrome after reload while still fullscreen is rare;
      // do not auto-arm without an explicit enterFullscreen success in this mount.
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    syncFullscreen();
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      setAway(false);
      prevAwayRef.current = false;
      return;
    }

    const evaluate = () => {
      // Not armed yet: never count as a leave violation.
      if (!armedRef.current) {
        setAway(false);
        prevAwayRef.current = false;
        return;
      }

      const fsMissing = isFullscreenSupported() && !document.fullscreenElement;
      const isHidden = document.hidden;
      const isAwayNow = fsMissing || isHidden;

      if (isAwayNow === prevAwayRef.current) return;

      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }

      // Debounce: F5 / brief system UI should not immediately count.
      leaveTimerRef.current = setTimeout(() => {
        leaveTimerRef.current = null;
        if (!armedRef.current) return;

        const stillMissing =
          (isFullscreenSupported() && !document.fullscreenElement) || document.hidden;

        if (stillMissing && !prevAwayRef.current) {
          prevAwayRef.current = true;
          setAway(true);
          setLeaveCount((prev) => {
            const next = prev + 1;
            onAwayChangeRef.current?.(true, next);
            return next;
          });
          return;
        }

        if (!stillMissing && prevAwayRef.current) {
          prevAwayRef.current = false;
          setAway(false);
          onAwayChangeRef.current?.(false, leaveCount);
        }
      }, leaveDebounceMs);
    };

    const events = ["fullscreenchange", "visibilitychange"] as const;
    events.forEach((evt) => document.addEventListener(evt, evaluate));

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);

    // Initial evaluation only after arming happens via enterFullscreen.
    evaluate();

    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      events.forEach((evt) => document.removeEventListener(evt, evaluate));
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [enabled, leaveDebounceMs, leaveCount]);

  const markArmed = useCallback(() => {
    armedRef.current = true;
    setArmed(true);
    setAway(false);
    prevAwayRef.current = false;
  }, []);

  /**
   * Must be called from a user gesture (Start / Resume / Continue).
   * Success arms the leave guard for this page lifetime.
   */
  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    if (!isFullscreenSupported()) {
      // Unsupported browser: treat as armed so the student is not stuck on a gate,
      // but leave monitoring for fsMissing will not apply (isFullscreenSupported false).
      markArmed();
      return false;
    }

    if (document.fullscreenElement) {
      window.focus();
      markArmed();
      return true;
    }

    try {
      await document.documentElement.requestFullscreen();
      window.focus();
      const ok = document.fullscreenElement !== null;
      if (ok) markArmed();
      return ok;
    } catch {
      return false;
    }
  }, [markArmed]);

  const exitFullscreen = useCallback(async (): Promise<void> => {
    if (typeof document === "undefined" || !document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
      // Do not block navigation if the browser refuses to exit.
    }
  }, []);

  /** Show a non-punitive "enter fullscreen" gate — not a leave warning. */
  const needsEnterFullscreen = enabled && isSupported && !armed;

  return {
    isFullscreen,
    isSupported,
    armed,
    needsEnterFullscreen,
    /** Only true after armed and a confirmed leave (debounced). */
    away: armed && away,
    leaveCount,
    enterFullscreen,
    exitFullscreen,
  };
}
