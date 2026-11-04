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

/** Map common domain statuses to a visual tone. */
export function toneForStatus(status: string): StatusTone {
  switch (status) {
    case "COMPLETED":
    case "SUBMITTED":
    case "ACTIVE":
    case "PUBLISHED":
      return "success";
    case "GAME_OVER":
    case "LATE":
    case "TIMED_OUT":
    case "DRAFT":
    case "INACTIVE":
      return "warning";
    case "ABANDONED":
    case "ARCHIVED":
    case "NOT_STARTED":
      return "neutral";
    case "IN_PROGRESS":
      return "info";
    default:
      return "neutral";
  }
}

export type StatusBadgeProps = {
  /** Domain status code used to pick tone when `tone` is omitted. */
  status?: string;
  /** Explicit tone overrides status mapping. */
  tone?: StatusTone;
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
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        TONE_CLASS[resolved],
        className,
      )}
    >
      {label}
    </span>
  );
}
