"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";

const OUTCOME_STYLE: Record<string, string> = {
  CORRECT: "bg-emerald-50 text-emerald-700",
  PARTIAL: "bg-amber-50 text-amber-700",
  PARTIALLY_CORRECT: "bg-amber-50 text-amber-700",
  INCORRECT: "bg-rose-50 text-rose-700",
  UNANSWERED: "bg-muted text-muted-foreground",
};

function formatAnswer(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function AttemptReviewSheet({
  open,
  onOpenChange,
  assignmentId,
  studentId,
  classAvgPercent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: number;
  studentId: number | null;
  classAvgPercent?: number | null;
}) {
  const t = useTranslations("teacher.analytics");
  const query = useQuery({
    queryKey: ["teacher-analysis-review", assignmentId, studentId],
    queryFn: () => assignmentAnalysisService.getAttemptReview(assignmentId, studentId!),
    enabled: open && studentId != null,
  });

  if (!open || studentId == null) return null;

  const r = query.data;
  const delta =
    r?.scorePercent != null && classAvgPercent != null
      ? Math.round(r.scorePercent - classAvgPercent)
      : null;
  const minutes = r?.durationSeconds != null ? Math.round(r.durationSeconds / 60) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="close" onClick={() => onOpenChange(false)} />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-background shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-background px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">{r?.studentName ?? "…"}</h2>
            <p className="text-xs text-muted-foreground">{t("review.readonly")}</p>
          </div>
          <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>

        {query.isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">{t("empty")}</div>
        ) : query.isError ? (
          <div className="p-4 text-sm">{t("loadError")}</div>
        ) : r ? (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{t("review.score")}</p>
                <p className="font-semibold">
                  {r.earnedPoints}/{r.possiblePoints} · {r.scorePercent ?? "—"}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("review.vsClass")}</p>
                <p className={`font-semibold ${delta != null && delta < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {delta != null ? delta : "—"}
                  {classAvgPercent != null ? ` (TB ${classAvgPercent}%)` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("review.duration")}</p>
                <p className="font-semibold">{minutes != null ? `${minutes}` : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("review.classAtStart")}</p>
                <p className="font-semibold">{r.className}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("review.started")}</p>
                <p>{r.startedAt ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("review.finished")}</p>
                <p>{r.finishedAt ?? "—"}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("review.byQuestion")}
              </h3>
              <div className="space-y-3">
                {r.questions.map((q) => {
                  const outcomeKey = q.outcome === "PARTIAL" ? "PARTIAL" : q.outcome;
                  return (
                    <div key={q.questionId} className="rounded-xl border border-border p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          #{q.position}. {q.prompt}
                        </p>
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            OUTCOME_STYLE[q.outcome] ?? OUTCOME_STYLE.UNANSWERED
                          }`}
                        >
                          {t(`review.outcome.${outcomeKey}` as "review.outcome.CORRECT")}{" "}
                          {q.earnedPoints}/{q.possiblePoints}
                        </span>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">{t("review.studentAnswer")}</p>
                          <p className="font-medium">{formatAnswer(q.studentAnswer)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("review.correctAnswer")}</p>
                          <p className="font-medium text-emerald-700">{formatAnswer(q.correctAnswer)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
