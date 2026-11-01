"use client";

import { useTranslations } from "next-intl";

export type OutcomeMix = {
  correct: number;
  partial: number;
  incorrect: number;
  blank: number;
};

export function OutcomeBar({
  outcome,
  className = "",
}: {
  outcome: OutcomeMix;
  className?: string;
}) {
  const total =
    outcome.correct + outcome.partial + outcome.incorrect + outcome.blank || 1;
  const w = (v: number) => `${(v / total) * 100}%`;
  return (
    <div className={`flex h-2.5 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      {outcome.correct > 0 ? (
        <div className="h-full bg-emerald-500" style={{ width: w(outcome.correct) }} />
      ) : null}
      {outcome.partial > 0 ? (
        <div className="h-full bg-amber-400" style={{ width: w(outcome.partial) }} />
      ) : null}
      {outcome.incorrect > 0 ? (
        <div className="h-full bg-rose-500" style={{ width: w(outcome.incorrect) }} />
      ) : null}
      {outcome.blank > 0 ? (
        <div className="h-full bg-slate-300" style={{ width: w(outcome.blank) }} />
      ) : null}
    </div>
  );
}

export function OutcomeLegend() {
  const t = useTranslations("teacher.analytics");
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <span className="size-2 rounded-full bg-emerald-500" /> {t("legend.correct")}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="size-2 rounded-full bg-amber-400" /> {t("legend.partial")}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="size-2 rounded-full bg-rose-500" /> {t("legend.incorrect")}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="size-2 rounded-full bg-slate-300" /> {t("legend.blank")}
      </span>
    </div>
  );
}
