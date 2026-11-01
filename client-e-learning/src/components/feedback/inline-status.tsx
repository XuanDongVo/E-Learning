"use client";

import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type InlineStatusTone = "neutral" | "progress" | "success" | "error";

const TONE_CLASS: Record<InlineStatusTone, string> = {
  neutral: "text-muted-foreground",
  progress: "text-amber-600",
  success: "text-muted-foreground",
  error: "text-destructive",
};

export function InlineStatus({
  tone = "neutral",
  message,
  className,
}: {
  tone?: InlineStatusTone;
  message: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        TONE_CLASS[tone],
        className,
      )}
      role={tone === "error" ? "alert" : undefined}
    >
      {tone === "progress" ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : null}
      {tone === "success" ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      ) : null}
      {tone === "error" ? (
        <CircleAlert className="h-3.5 w-3.5" aria-hidden />
      ) : null}
      {message}
    </span>
  );
}
