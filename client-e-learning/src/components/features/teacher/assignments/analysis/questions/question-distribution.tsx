"use client";

import { useTranslations } from "next-intl";
import type { QuestionAnswerDistribution } from "@/types/assignment-analysis";

function CountBar({ count, max, correct }: { count: number; max: number; correct?: boolean }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex min-w-[8rem] items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${correct ? "bg-emerald-500" : "bg-rose-400"}`}
          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span className="w-6 tabular-nums text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

export function QuestionDistributionPanel({
  questionType,
  distribution,
}: {
  questionType: string;
  distribution: QuestionAnswerDistribution | null | undefined;
}) {
  const t = useTranslations("teacher.analytics");
  if (!distribution) {
    return <div className="px-3 py-3 text-sm text-muted-foreground">{t("questions.noDist")}</div>;
  }

  const kind = distribution.kind || "UNKNOWN";

  if (kind === "OPTIONS") {
    const items = distribution.options ?? [];
    const max = Math.max(...items.map((i) => i.count), distribution.unansweredCount, 1);
    return (
      <div className="space-y-2 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {questionType === "MULTIPLE_CHOICE" ? t("questions.distOptionsMulti") : t("questions.distOptions")}
        </p>
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.key} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 text-sm">
              <span className="font-semibold text-muted-foreground">{item.key}</span>
              <span>
                {item.label}{" "}
                {item.correct ? <span className="text-xs font-medium text-emerald-600">{t("questions.correctMark")}</span> : null}
              </span>
              <CountBar count={item.count} max={max} correct={item.correct} />
            </li>
          ))}
          <li className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 text-sm text-muted-foreground">
            <span>—</span>
            <span>{t("questions.blank")}</span>
            <CountBar count={distribution.unansweredCount} max={max} />
          </li>
        </ul>
        <p className="text-[11px] text-muted-foreground">n = {distribution.sampleSize}</p>
      </div>
    );
  }

  if (kind === "TEXT") {
    const items = distribution.textAnswers ?? [];
    const max = Math.max(...items.map((i) => i.count), distribution.unansweredCount, 1);
    return (
      <div className="space-y-2 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("questions.distText")}</p>
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.key} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
              <span>
                {item.label}{" "}
                {item.correct ? <span className="text-xs font-medium text-emerald-600">{t("questions.correctMark")}</span> : null}
              </span>
              <CountBar count={item.count} max={max} correct={item.correct} />
            </li>
          ))}
          <li className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm text-muted-foreground">
            <span>{t("questions.blank")}</span>
            <CountBar count={distribution.unansweredCount} max={max} />
          </li>
        </ul>
        <p className="text-[11px] text-muted-foreground">n = {distribution.sampleSize}</p>
      </div>
    );
  }

  if (kind === "CLOZE" || kind === "MATCHING") {
    const blanks = kind === "CLOZE" ? distribution.blanks : distribution.matchPairs;
    return (
      <div className="space-y-4 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {kind === "CLOZE" ? t("questions.distCloze") : t("questions.distMatching")}
        </p>
        {(blanks ?? []).map((b) => {
          const max = Math.max(...b.answers.map((a) => a.count), b.blankCount, 1);
          return (
            <div key={b.blankKey} className="rounded-lg border border-border/60 p-3">
              <p className="mb-2 text-sm font-medium">{b.blankLabel}</p>
              <ul className="space-y-1.5">
                {b.answers.map((a) => (
                  <li key={a.key} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
                    <span>
                      {a.label}{" "}
                      {a.correct ? (
                        <span className="text-xs font-medium text-emerald-600">{t("questions.correctMark")}</span>
                      ) : null}
                    </span>
                    <CountBar count={a.count} max={max} correct={a.correct} />
                  </li>
                ))}
                <li className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm text-muted-foreground">
                  <span>{t("questions.blank")}</span>
                  <CountBar count={b.blankCount} max={max} />
                </li>
              </ul>
            </div>
          );
        })}
        <p className="text-[11px] text-muted-foreground">n = {distribution.sampleSize}</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 text-sm text-muted-foreground">
      {t("questions.unsupported", { type: questionType })}
    </div>
  );
}
