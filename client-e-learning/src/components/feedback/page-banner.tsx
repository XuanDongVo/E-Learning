"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PageBannerTone = "info" | "warning" | "error";

const TONE_CLASS: Record<PageBannerTone, string> = {
  info: "border-primary/20 bg-primary/5 text-foreground",
  warning: "border-warning/40 bg-warning/10 text-warning-foreground",
  error: "border-destructive/30 bg-destructive/5 text-destructive",
};

export function PageBanner({
  tone = "info",
  title,
  message,
  action,
  onDismiss,
  className,
}: {
  tone?: PageBannerTone;
  title?: string;
  message: string;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  const t = useTranslations("feedback");

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        TONE_CLASS[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <p className={cn(title ? "mt-0.5 text-xs opacity-90" : "")}>{message}</p>
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={onDismiss}
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
