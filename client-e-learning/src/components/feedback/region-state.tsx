"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type RegionStateVariant = "loading" | "error" | "empty";

export function RegionState({
  variant,
  title,
  description,
  action,
  minHeight = 160,
  className,
}: {
  variant: RegionStateVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  minHeight?: number | string;
  className?: string;
}) {
  const t = useTranslations("feedback");

  const resolvedTitle =
    title ??
    (variant === "loading"
      ? t("loading")
      : variant === "empty"
        ? t("empty")
        : t("errorGeneric"));

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-8 text-center",
        className,
      )}
      style={{ minHeight }}
      role={variant === "error" ? "alert" : variant === "loading" ? "status" : undefined}
    >
      {variant === "loading" ? <Spinner size="md" /> : null}
      <p className="text-sm font-semibold text-foreground">{resolvedTitle}</p>
      {description ? (
        <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
