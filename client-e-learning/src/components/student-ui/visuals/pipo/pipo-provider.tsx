"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { PipoMood } from "./pipo.types";

type Speech = { text: string; mood: PipoMood };
const initialSpeech: Speech = { text: "Ready for a little progress?", mood: "wave" };

type PipoContextValue = {
  speech: Speech;
  enabled: boolean;
  toggle: () => void;
  say: (text: string, mood?: PipoMood, ttlMs?: number) => void;
};

const PipoContext = createContext<PipoContextValue>({
  speech: initialSpeech,
  enabled: true,
  toggle: () => {},
  say: () => {},
});

export const usePipo = () => useContext(PipoContext);

export function PipoProvider({ children }: { children: ReactNode }) {
  // SSR and first client render agree. The stored preference is applied after hydration.
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);
  const [speech, setSpeech] = useState<Speech>(initialSpeech);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    try {
      setEnabled(window.localStorage.getItem("learnup-mascot") !== "off");
    } catch {
      // Storage can be blocked; mascot stays functional without persistence.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem("learnup-mascot", enabled ? "on" : "off");
    } catch {
      // Storage denial does not block the UI.
    }
  }, [enabled, ready]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const say = useCallback((text: string, mood: PipoMood = "happy", ttlMs = 5000) => {
    clearTimeout(timer.current);
    setSpeech({ text: text.slice(0, 80), mood });
    if (ttlMs > 0) {
      timer.current = setTimeout(() => {
        setSpeech((current) => ({ ...current, mood: "idle" }));
      }, ttlMs);
    }
  }, []);

  const toggle = useCallback(() => setEnabled((current) => !current), []);

  return (
    <PipoContext.Provider value={{ speech, enabled, toggle, say }}>
      {children}
    </PipoContext.Provider>
  );
}
