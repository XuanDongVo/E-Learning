"use client";

import {
  createContext, useCallback, useContext, useEffect,
  useRef, useState, type ReactNode,
} from "react";
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
  speech: initialSpeech, enabled: true, toggle: () => {}, say: () => {},
});

// Pipo is contextual decorative UI, not a global navigation preference.
// Retain the optional toggle in context for compatibility with consumers,
// but do not restore an old disabled flag with no discoverable control.
export const usePipo = () => useContext(PipoContext);

export function PipoProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [speech, setSpeech] = useState<Speech>(initialSpeech);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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

  const toggle = useCallback(() => setEnabled(value => !value), []);

  return (
    <PipoContext.Provider value={{ speech, enabled, toggle, say }}>
      {children}
    </PipoContext.Provider>
  );
}
