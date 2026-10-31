"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function isFullscreenSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.documentElement.requestFullscreen === "function"
  );
}

interface UseAttemptGuardOptions {
  enabled?: boolean; // Chỉ bật khi học sinh đang ở trạng thái ACTIVE làm bài
  onAwayChange?: (away: boolean, count: number) => void;
}

export function useAttemptFullscreen({
  enabled = true,
  onAwayChange,
}: UseAttemptGuardOptions = {}) {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && document.fullscreenElement !== null,
  );
  const [isSupported] = useState(isFullscreenSupported);

  // Trạng thái học sinh đang rời khỏi màn hình (thoát fullscreen hoặc chuyển tab/cửa sổ)
  const [away, setAway] = useState(false);
  // Đếm số lần rời màn hình: hoàn toàn CỤC BỘ trong bộ nhớ React, không ghi localStorage/sessionStorage
  const [leaveCount, setLeaveCount] = useState(0);

  const prevAwayRef = useRef(false);

  // Cập nhật trạng thái fullscreen thuần túy
  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    syncFullscreen();
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  // Giám sát rời màn hình (Leave Guard)
  useEffect(() => {
    if (!enabled) {
      setAway(false);
      prevAwayRef.current = false;
      return;
    }

    const checkGuard = () => {
      // Coi là rời đi nếu:
      // 1. Máy hỗ trợ fullscreen nhưng lại không ở chế độ fullscreen
      // 2. Tab bị ẩn (học sinh chuyển tab khác)
      // 3. Cửa sổ mất focus (học sinh mở cửa sổ/ứng dụng khác đè lên)
      const fsMissing = isFullscreenSupported() && !document.fullscreenElement;
      const isHidden = document.hidden;
      // const lostFocus = !document.hasFocus();

      // const isAwayNow = fsMissing || isHidden || lostFocus;
      const isAwayNow = fsMissing || isHidden ;

      if (isAwayNow && !prevAwayRef.current) {
        setLeaveCount((prev) => {
          const next = prev + 1;
          onAwayChange?.(true, next);
          return next;
        });
      } else if (!isAwayNow && prevAwayRef.current) {
        onAwayChange?.(false, leaveCount);
      }

      prevAwayRef.current = isAwayNow;
      setAway(isAwayNow);
    };

    // Cho trình duyệt 600ms ổn định sau khi vào bài trước khi bắt đầu kiểm tra
    const timer = setTimeout(checkGuard, 600);

    const events = ["fullscreenchange", "visibilitychange"] as const;
    events.forEach((evt) => document.addEventListener(evt, checkGuard));
    // window.addEventListener("blur", checkGuard);
    // window.addEventListener("focus", checkGuard);

    // Chặn chuột phải để hạn chế inspect / tra cứu
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => document.removeEventListener(evt, checkGuard));
      // window.removeEventListener("blur", checkGuard);
      // window.removeEventListener("focus", checkGuard);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [enabled, leaveCount, onAwayChange]);

  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    if (!isFullscreenSupported()) return false;
    if (document.fullscreenElement) {
      window.focus();
      setAway(false);
      prevAwayRef.current = false;
      return true;
    }

    try {
      await document.documentElement.requestFullscreen();
      window.focus();
      setAway(false);
      prevAwayRef.current = false;
      return document.fullscreenElement !== null;
    } catch {
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async (): Promise<void> => {
    if (typeof document === "undefined" || !document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
    }
  }, []);

  return {
    isFullscreen,
    isSupported,
    away,
    leaveCount,
    enterFullscreen,
    exitFullscreen,
  };
}
