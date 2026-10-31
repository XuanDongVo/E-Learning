"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AssessmentAttemptEventType } from "@/types/student/assignment-attempt";

function isFullscreenSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.documentElement.requestFullscreen === "function"
  );
}

function resolveLeaveEventType(): AssessmentAttemptEventType {
  const fsMissing = isFullscreenSupported() && !document.fullscreenElement;
  if (fsMissing) return "FULLSCREEN_EXIT";
  return "TAB_HIDDEN";
}

interface UseAttemptGuardOptions {
  enabled?: boolean;
  leaveDebounceMs?: number;
  /** Fired once per confirmed leave after debounce (armed only). */
  onLeaveSignal?: (payload: {
    eventType: AssessmentAttemptEventType;
    localLeaveCount: number;
  }) => void;
}

/**
 * Fullscreen UX + soft leave monitoring for formal attempts.
 * Leave signals are client-reported; server events are the durable source of truth.
 */
export function useAttemptFullscreen({
  enabled = true,
  leaveDebounceMs = 400,
  onLeaveSignal,
}: UseAttemptGuardOptions = {}) {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && document.fullscreenElement !== null,
  );
  const [isSupported] = useState(isFullscreenSupported);
  const [armed, setArmed] = useState(false);
  const [away, setAway] = useState(false);
  const [leaveCount, setLeaveCount] = useState(0);

  const armedRef = useRef(false);
  const prevAwayRef = useRef(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLeaveSignalRef = useRef(onLeaveSignal);
  onLeaveSignalRef.current = onLeaveSignal;

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(document.fullscreenElement !== null);
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

      leaveTimerRef.current = setTimeout(() => {
        leaveTimerRef.current = null;
        if (!armedRef.current) return;

        const stillMissing =
          (isFullscreenSupported() && !document.fullscreenElement) || document.hidden;

        if (stillMissing && !prevAwayRef.current) {
          prevAwayRef.current = true;
          setAway(true);
          const eventType = resolveLeaveEventType();
          setLeaveCount((prev) => {
            const next = prev + 1;
            onLeaveSignalRef.current?.({ eventType, localLeaveCount: next });
            return next;
          });
          return;
        }

        if (!stillMissing && prevAwayRef.current) {
          prevAwayRef.current = false;
          setAway(false);
        }
      }, leaveDebounceMs);
    };

    const events = ["fullscreenchange", "visibilitychange"] as const;
    events.forEach((evt) => document.addEventListener(evt, evaluate));

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);

    evaluate();

    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      events.forEach((evt) => document.removeEventListener(evt, evaluate));
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [enabled, leaveDebounceMs]);

  const markArmed = useCallback(() => {
    armedRef.current = true;
    setArmed(true);
    setAway(false);
    prevAwayRef.current = false;
  }, []);

  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    if (!isFullscreenSupported()) {
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
      // ignore
    }
  }, []);

  /** Prefer server count when available (after event API). */
  const setServerLeaveCount = useCallback((count: number) => {
    if (Number.isFinite(count) && count >= 0) {
      setLeaveCount(count);
    }
  }, []);

  const needsEnterFullscreen = enabled && isSupported && !armed;

  return {
    isFullscreen,
    isSupported,
    armed,
    needsEnterFullscreen,
    away: armed && away,
    leaveCount,
    setServerLeaveCount,
    enterFullscreen,
    exitFullscreen,
  };
}
