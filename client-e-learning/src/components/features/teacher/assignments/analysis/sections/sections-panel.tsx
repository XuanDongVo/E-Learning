"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import { OutcomeBar, OutcomeLegend } from "../shared/outcome-bar";

export function SectionsPanel({ assignmentId }: { assignmentId: number }) {
  const t = useTranslations("teacher.analytics");
  const query = useQuery({
    queryKey: ["teacher-analysis-sections", assignmentId],
    queryFn: () => assignmentAnalysisService.getSections(assignmentId),
  });

  if (query.isLoading) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{t("empty")}</div>;
  }
  if (query.isError) {
    return (
      <div className="rounded-xl border border-destructive/30 p-4 text-sm">
        {t("loadError")}{" "}
        <button type="button" className="text-primary" onClick={() => query.refetch()}>
          {t("retry")}
        </button>
      </div>
    );
  }

  const items = query.data?.items ?? [];
  const weakest = [...items].sort((a, b) => (a.accuracyPercent ?? 100) - (b.accuracyPercent ?? 100))[0];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {t("sections.footnote")}{" "}
          {weakest ? (
            <span className="font-medium text-foreground">
              {t("sections.weakest", {
                title: weakest.sectionTitle ?? "—",
                percent: weakest.accuracyPercent ?? 0,
              })}
            </span>
          ) : null}
        </p>
        <OutcomeLegend />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">{t("sections.col.section")}</th>
              <th className="px-3 py-2 font-medium">{t("sections.col.count")}</th>
              <th className="px-3 py-2 font-medium">{t("sections.col.result")}</th>
              <th className="px-3 py-2 font-medium">{t("sections.col.accuracy")}</th>
              <th className="px-3 py-2 font-medium">{t("sections.col.scoreRate")}</th>
              <th className="px-3 py-2 font-medium">{t("sections.col.blank")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => {
              const n = Math.max(s.sampleSlots, 1);
              const outcome = {
                correct: Math.round((100 * s.correctCount) / n),
                partial: Math.round((100 * s.partialCount) / n),
                incorrect: Math.round((100 * s.incorrectCount) / n),
                blank: Math.round((100 * s.unansweredCount) / n),
              };
              const weak = (s.accuracyPercent ?? 100) < 40;
              return (
                <tr
                  key={s.sectionId ?? s.sectionTitle ?? Math.random()}
                  className={`border-t border-border/70 ${weak ? "bg-rose-50/50" : ""}`}
                >
                  <td className="px-3 py-3 font-medium">{s.sectionTitle ?? "—"}</td>
                  <td className="px-3 py-3 tabular-nums">{s.questionCount}</td>
                  <td className="min-w-[10rem] px-3 py-3">
                    <OutcomeBar outcome={outcome} />
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {s.accuracyPercent ?? 0}%{" "}
                    <span className="text-xs text-muted-foreground">n={s.sampleSlots}</span>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{s.scoreRatePercent ?? 0}%</td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">{s.blankPercent ?? 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
