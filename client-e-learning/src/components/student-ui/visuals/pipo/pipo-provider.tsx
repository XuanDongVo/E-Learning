"use client";

import {
  createContext, useCallback, useContext, useEffect,
  useRef, useState, useSyncExternalStore, type ReactNode,
} from "react";
import type { PipoMood } from "./pipo.types";

type Speech = { text: string; mood: PipoMood };
const initialSpeech: Speech = { text: "Ready for a little progress?", mood: "wave" };
const STORAGE_KEY = "learnup-mascot";

type PipoContextValue = {
  speech: Speech;
  enabled: boolean;
  toggle: () => void;
  say: (text: string, mood?: PipoMood, ttlMs?: number) => void;
};
const PipoContext = createContext<PipoContextValue>({
  speech: initialSpeech, enabled: true, toggle: () => {}, say: () => {},
});

const pipoListeners = new Set<() => void>();
let memoryEnabled = true;

function getClientEnabled(): boolean {
  try {
    const persisted = window.localStorage.getItem(STORAGE_KEY);
    return persisted == null ? memoryEnabled : persisted !== "off";
  } catch {
    return memoryEnabled;
  }
}
function getServerEnabled(): boolean {
  // Stable server snapshot for hydration; the client preference applies after hydration.
  return true;
}
function subscribePipo(listener: () => void) {
  pipoListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    pipoListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
function togglePipo() {
  const next = !getClientEnabled();
  memoryEnabled = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    // Storage may be denied; still update this tab's reactive snapshot.
  }
  pipoListeners.forEach((listener) => listener());
}

export const usePipo = () => useContext(PipoContext);

export function PipoProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(subscribePipo, getClientEnabled, getServerEnabled);
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

  const toggle = useCallback(() => togglePipo(), []);

  return (
    <PipoContext.Provider value={{ speech, enabled, toggle, say }}>
      {children}
    </PipoContext.Provider>
  );
}
