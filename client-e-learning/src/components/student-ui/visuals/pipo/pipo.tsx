"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { usePipo } from "./pipo-provider";
import { PipoCharacter } from "./pipo-character";
import type { MascotColor, PipoMood, PipoStage, PipoProp } from "./pipo.types";

export type PipoProps = {
  mood?: PipoMood;
  size?: number;
  stage?: PipoStage;
  color?: MascotColor;
  prop?: PipoProp;
  /** Decorative when placed next to text. Disabling Pipo never removes vital content. */
  className?: string;
};

export function Pipo({ mood, size = 280, stage = 2, color = "primary", prop, className }: PipoProps) {
  const { speech, enabled } = usePipo();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let blinkTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const schedule = () => {
      blinkTimer = setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        closeTimer = setTimeout(() => {
          if (cancelled) return;
          setBlink(false);
          schedule();
        }, 150);
      }, 3500 + Math.random() * 2500);
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(blinkTimer);
      clearTimeout(closeTimer);
    };
  }, [enabled]);

  if (!enabled) return null;
  const actualMood = mood ?? speech.mood;

  return (
    <span
      aria-hidden="true"
      style={{ width: size, maxWidth: "100%", aspectRatio: "1 / 1" } as CSSProperties}
      className={cn(
        "inline-flex shrink-0 items-center justify-center align-middle leading-none",
        (actualMood === "cheer" || actualMood === "celebrate") &&
          "motion-safe:animate-[pipo-bounce_0.4s_ease-in-out_3]",
        className,
      )}
    >
      <PipoCharacter mood={actualMood} size={size} stage={stage} color={color} blink={blink} prop={prop} />
    </span>
  );
}
