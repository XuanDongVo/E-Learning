"use client";

import { cn } from "@/lib/utils";
import { Pipo } from "./pipo";
import { usePipo } from "./pipo-provider";
import type { MascotColor, PipoMood, PipoProp } from "./pipo.types";

export type StudentMascotSceneProps = {
  /** A guide provides context; feedback reflects a real action; milestone needs confirmed progress. */
  variant: "guide" | "feedback" | "milestone";
  mood?: PipoMood;
  prop?: PipoProp;
  color?: MascotColor;
  message?: string;
  size?: "compact" | "medium";
  /** A decorative Pipo sticker for a page that already explains the action in text. */
  presentation?: "note" | "sticker";
  className?: string;
};

const sizeMap = { compact: 76, medium: 112 } as const;
const defaultMoods = { guide: "wave", feedback: "happy", milestone: "celebrate" } as const;

/**
 * Student-only, editorial mascot primitive.
 * Never floats over exercises. All outcomes/messages are provided by the
 * owning feature; no speculative score, XP or streak language is generated.
 */
export function StudentMascotScene({
  variant, mood, prop = "book", color = "primary", message,
  size = "compact", presentation = "note", className,
}: StudentMascotSceneProps) {
  const { enabled } = usePipo();
  if (!enabled) return null;

  const note = presentation === "note";
  return (
    <div
      data-mascot-variant={variant}
      data-mascot-presentation={presentation}
      className={cn(
        "student-mascot-scene",
        note ? "student-mascot-scene--note" : "student-mascot-scene--sticker",
        className,
      )}
    >
      <Pipo mood={mood ?? defaultMoods[variant]} prop={prop} color={color}
        size={sizeMap[size]} className="student-mascot-scene__pipo shrink-0" />
      {note && message?.trim() && (
        <p className="student-mascot-scene__message student-body text-foreground">
          {message}
        </p>
      )}
    </div>
  );
}
