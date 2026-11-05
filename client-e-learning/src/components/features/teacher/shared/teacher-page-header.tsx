"use client";

import type { ReactNode } from "react";
import { Pipo, type PipoMood } from "@/components/ui/mascot";
import { cn } from "@/lib/utils";

export interface TeacherPageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Pipo mood — default wave */
  pipoMood?: PipoMood;
  /** Pipo size in px — default 100 */
  pipoSize?: number;
  className?: string;
}

/**
 * Shared teacher list-page hero.
 * Identity only: title + description + Pipo.
 * Primary actions belong in the toolbar below — do not pass buttons here.
 */
export function TeacherPageHeader({
  title,
  description,
  pipoMood = "wave",
  pipoSize = 280,
  className,
}: TeacherPageHeaderProps) {
  return (
    <div
      className={cn(
        "grid-paper relative isolate mb-6 flex min-h-32 items-center justify-between gap-4 overflow-hidden rounded-2xl border-2 border-ink bg-card px-6 py-5 shadow-pop",
        "max-sm:flex-wrap max-sm:px-4 max-sm:py-4 ",
        className,
      )}
    >
      <div className="min-w-0 flex-1 pr-4 sm:pr-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {/* <div className="shrink-0 self-end sm:self-center">
        <Pipo mood={pipoMood} size={pipoSize} stage={2} />
      </div> */}
    </div>
  );
}
