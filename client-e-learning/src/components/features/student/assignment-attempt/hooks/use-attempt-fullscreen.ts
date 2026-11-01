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
 *
 * Counting rules (prevent double-count):
 * - Only one leave count per "away episode" (away -> back -> away).
 * - Debounced confirmation before counting.
 * - Cooldown window after a count so FS+visibility dual events cannot double-fire.
 * - Server leaveEventCount always wins via setServerLeaveCount.
 */
export function useAttemptFullscreen({
  enabled = true,
  leaveDebounceMs = 500,
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
  /** Prevents a second count while still in the same away episode / dual-event burst. */
  const countLockRef = useRef(false);
  const lastCountedAtRef = useRef(0);
  const leaveCountRef = useRef(0);
  const onLeaveSignalRef = useRef(onLeaveSignal);
  onLeaveSignalRef.current = onLeaveSignal;

  const LEAVE_COOLDOWN_MS = 1000;

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
      countLockRef.current = false;
      return;
    }

    const isCurrentlyAway = () =>
      (isFullscreenSupported() && !document.fullscreenElement) || document.hidden;

    const evaluate = () => {
      if (!armedRef.current) {
        setAway(false);
        prevAwayRef.current = false;
        countLockRef.current = false;
        return;
      }

      const isAwayNow = isCurrentlyAway();

      // No state change → ignore (covers dual FS+visibility events).
      if (isAwayNow === prevAwayRef.current) return;

      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }

      leaveTimerRef.current = setTimeout(() => {
        leaveTimerRef.current = null;
        if (!armedRef.current) return;

        const stillAway = isCurrentlyAway();

        // Returning from away → reset episode lock so next leave can count once.
        if (!stillAway && prevAwayRef.current) {
          prevAwayRef.current = false;
          countLockRef.current = false;
          setAway(false);
          return;
        }

        // Confirmed leave: count at most once per episode + cooldown.
        if (stillAway && !prevAwayRef.current) {
          const now = Date.now();
          const inCooldown = now - lastCountedAtRef.current < LEAVE_COOLDOWN_MS;

          if (countLockRef.current || inCooldown) {
            // Still treat as away UI-wise, but do not increment again.
            prevAwayRef.current = true;
            setAway(true);
            return;
          }

          prevAwayRef.current = true;
          countLockRef.current = true;
          lastCountedAtRef.current = now;
          setAway(true);

          const eventType = resolveLeaveEventType();
          const next = leaveCountRef.current + 1;
          leaveCountRef.current = next;
          setLeaveCount(next);
          onLeaveSignalRef.current?.({ eventType, localLeaveCount: next });
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
    countLockRef.current = false;
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
      leaveCountRef.current = count;
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
