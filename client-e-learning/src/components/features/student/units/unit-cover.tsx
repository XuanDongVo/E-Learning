"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen, PenLine, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UnitCoverProps {
  /** Unit display number (e.g. "03"), not a database ID. */
  label: string;
  name: string;
  coverUrl?: string | null;
  className?: string;
  labelClassName?: string;
  /** Larger stationery illustration for the Unit detail page. */
  variant?: "card" | "hero";
}

const tones = ["clay", "denim", "sage", "mustard"] as const;

/** Extract the number from seed codes such as G7-SEED-U03, preserving unknown codes. */
export const unitLabel = (code: string | number) => {
  const raw = String(code);
  const suffix = raw.match(/(?:^|[-_])(?:UNIT|U)[-_]?(\d{1,3})$/i);
  if (suffix) return suffix[1].padStart(2, "0");
  if (/^\d+$/.test(raw)) return raw.padStart(2, "0");
  return raw;
};

function coverTone(label: string, name: string): typeof tones[number] {
  const digits = label.match(/\d+$/);
  const number = digits ? Number(digits[0]) : [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return tones[(Math.max(1, number) - 1) % tones.length];
}

/**
 * Shared Student Unit cover:
 * - valid media: real image
 * - missing/broken media: original illustrated paper cover, never an empty block
 * The theme is deterministic and does not require external images/packages.
 */
export function UnitCover({
  label, name, coverUrl, className, labelClassName, variant = "card",
}: UnitCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasImage = Boolean(coverUrl && coverUrl !== failedUrl);
  const tone = coverTone(label, name);

  if (hasImage && coverUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-secondary", className)}>
        <Image
          src={coverUrl}
          alt={name}
          fill
          unoptimized
          sizes={variant === "hero" ? "(max-width: 640px) 100vw, 340px" : "(max-width: 640px) 100vw, 320px"}
          className="object-cover"
          onError={() => setFailedUrl(coverUrl)}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      data-cover-tone={tone}
      data-cover-variant={variant}
      className={cn("student-unit-cover-illustrated relative isolate flex select-none items-center justify-center overflow-hidden", className)}
    >
      <div className="student-unit-cover-grid" />
      <span className="student-unit-cover-orbit student-unit-cover-orbit--one" />
      <span className="student-unit-cover-orbit student-unit-cover-orbit--two" />
      <span className="student-unit-cover-ink-mark student-unit-cover-ink-mark--left" />
      <span className="student-unit-cover-ink-mark student-unit-cover-ink-mark--right" />
      <div className="student-unit-cover-notebook">
        <span className="student-unit-cover-notebook__spiral" />
        <BookOpen className="student-unit-cover-notebook__book" strokeWidth={1.6} />
        <span className={cn("student-unit-cover-notebook__number", labelClassName)}>{label}</span>
        <span className="student-unit-cover-notebook__line" />
        <span className="student-unit-cover-notebook__line student-unit-cover-notebook__line--short" />
      </div>
      <Sparkles className="student-unit-cover-sparkle" strokeWidth={1.8} />
      <PenLine className="student-unit-cover-pencil" strokeWidth={1.9} />
    </div>
  );
}
