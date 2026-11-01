"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Pipo, type PipoMood } from "@/components/ui/mascot";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type FullPageStateVariant = "loading" | "error" | "empty";

const MOOD: Record<FullPageStateVariant, PipoMood> = {
  loading: "think",
  error: "oops",
  empty: "wave",
};

export function FullPageState({
  variant,
  title,
  description,
  action,
  showMascot = true,
  className,
}: {
  variant: FullPageStateVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  /** Student-facing screens can show Pipo; dense teacher UIs may turn off. */
  showMascot?: boolean;
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
        "mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-10 text-center",
        className,
      )}
      role={variant === "error" ? "alert" : variant === "loading" ? "status" : undefined}
      aria-live={variant === "loading" ? "polite" : undefined}
    >
      {showMascot ? (
        <Pipo mood={MOOD[variant]} size={120} />
      ) : variant === "loading" ? (
        <Spinner size="lg" />
      ) : null}

      <h1 className="text-lg font-bold text-foreground">{resolvedTitle}</h1>

      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
