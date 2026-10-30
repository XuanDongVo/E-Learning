"use client";

import { useCallback, useEffect, useState } from "react";

function isFullscreenSupported(): boolean {
  return typeof document !== "undefined"
    && typeof document.documentElement.requestFullscreen === "function";
}

export function useAttemptFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && document.fullscreenElement !== null,
  );
  const [isSupported] = useState(isFullscreenSupported);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", syncFullscreen);
    syncFullscreen();
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    if (!isFullscreenSupported()) return false;
    if (document.fullscreenElement) return true;

    try {
      // Must be invoked directly from a user gesture (Start/Resume or Continue).
      await document.documentElement.requestFullscreen();
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
      // Navigation must not be blocked if the browser refuses to exit fullscreen.
    }
  }, []);

  return { isFullscreen, isSupported, enterFullscreen, exitFullscreen };
}
