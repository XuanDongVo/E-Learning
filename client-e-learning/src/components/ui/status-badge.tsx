import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "info";

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-rose-500/10 text-rose-600",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-primary/10 text-primary",
};

/**
 * Domain statuses grouped by visual tone.
 * Add a new status to the matching list — no switch cases to touch.
 * Comparison is case-insensitive.
 */
const STATUS_BY_TONE: Record<StatusTone, readonly string[]> = {
  success: ["COMPLETED", "SUBMITTED", "ACTIVE", "PUBLISHED"],
  warning: ["GAME_OVER", "LATE", "TIMED_OUT", "DRAFT", "INACTIVE"],
  danger: [],
  neutral: ["ABANDONED", "ARCHIVED", "NOT_STARTED"],
  info: ["IN_PROGRESS"],
};

const STATUS_TONE_LOOKUP: Map<string, StatusTone> = (() => {
  const map = new Map<string, StatusTone>();
  (Object.entries(STATUS_BY_TONE) as [StatusTone, readonly string[]][]).forEach(
    ([tone, statuses]) => {
      statuses.forEach((status) => {
        map.set(status.toUpperCase(), tone);
      });
    },
  );
  return map;
})();

/** Resolve a domain status code to a visual tone. */
export function toneForStatus(status: string): StatusTone {
  return STATUS_TONE_LOOKUP.get(status.trim().toUpperCase()) ?? "neutral";
}

export type StatusBadgeProps = {
  /** Domain status code used to pick tone when `tone` is omitted. */
  status?: string;
  /** Explicit tone overrides status mapping. */
  tone?: StatusTone;
  /** Display text — keep i18n at the call site. */
  label: React.ReactNode;
  className?: string;
};

export function StatusBadge({
  status,
  tone,
  label,
  className,
}: StatusBadgeProps) {
  const resolved = tone ?? (status ? toneForStatus(status) : "neutral");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-bold leading-tight tracking-tight",
        TONE_CLASS[resolved],
        className,
      )}
    >
      {label}
    </span>
  );
}
