"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { AssignmentAnalysisOverview } from "@/types/assignment-analysis";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";

function KpiCard({
  label,
  value,
  hint,
  footer,
}: {
  label: string;
  value: string;
  hint: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {footer}
    </div>
  );
}

export function OverviewPanel({
  assignmentId,
  overview,
  loading,
  onGoStudents,
}: {
  assignmentId: number;
  overview?: AssignmentAnalysisOverview;
  loading?: boolean;
  onGoStudents?: () => void;
}) {
  const t = useTranslations("teacher.analytics");
  const questionsQuery = useQuery({
    queryKey: ["teacher-analysis-questions", assignmentId],
    queryFn: () => assignmentAnalysisService.getQuestions(assignmentId),
  });

  if (loading || !overview) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{t("empty")}</div>;
  }

  const { progress, score, summary } = overview;
  const submittedLike = progress.submitted + progress.timedOut;
  const progressTotal =
    progress.submitted +
    progress.late +
    progress.timedOut +
    progress.inProgress +
    progress.notStarted +
    progress.overdue;
  const seg = (n: number) => `${(n / Math.max(progressTotal, 1)) * 100}%`;
  const maxBar = Math.max(...score.distribution.map((d) => d.count), 1);

  const items = questionsQuery.data?.items ?? [];
  const hard = items.filter((q) => q.difficulty === "HARD").slice(0, 5);
  const easy = items.filter((q) => q.difficulty === "EASY").slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t("overview.submissionRate")}
          value={progress.submissionRate != null ? `${Math.round(progress.submissionRate * 100)}%` : "—"}
          hint={t("overview.assignedOf", {
            submitted: progress.submitted,
            assigned: progress.assigned,
          })}
        />
        <KpiCard
          label={t("overview.averageScore")}
          value={score.averagePercent != null ? `${score.averagePercent}%` : "—"}
          hint={t("overview.medianHint", {
            median: score.medianPercent ?? "—",
            count: score.gradedAttemptCount,
          })}
        />
        <KpiCard
          label={t("overview.range")}
          value={
            score.lowestPercent != null && score.highestPercent != null
              ? `${score.lowestPercent}% – ${score.highestPercent}%`
              : "—"
          }
          hint={t("overview.rangeHint")}
        />
        <KpiCard
          label={t("overview.avgDuration")}
          value="—"
          hint={t("overview.timeLimit", { minutes: summary.timeLimitMinutes ?? "—" })}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("overview.progress")}</h3>
          <button type="button" className="text-xs font-medium text-primary" onClick={onGoStudents}>
            {t("overview.viewStudents")}
          </button>
        </div>
        <div className="mb-4 flex h-3 overflow-hidden rounded-full">
          <div className="bg-emerald-500" style={{ width: seg(progress.submitted) }} />
          <div className="bg-amber-500" style={{ width: seg(progress.late) }} />
          <div className="bg-amber-400" style={{ width: seg(progress.timedOut) }} />
          <div className="bg-blue-500" style={{ width: seg(progress.inProgress) }} />
          <div className="bg-slate-300" style={{ width: seg(progress.notStarted) }} />
          <div className="bg-rose-500" style={{ width: seg(progress.overdue) }} />
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["submitted", "bg-emerald-500", progress.submitted],
              ["late", "bg-amber-500", progress.late],
              ["timedOut", "bg-amber-400", progress.timedOut],
              ["inProgress", "bg-blue-500", progress.inProgress],
              ["notStarted", "bg-slate-300", progress.notStarted],
              ["overdue", "bg-rose-500", progress.overdue],
            ] as const
          ).map(([key, color, n]) => (
            <div key={key} className="rounded-xl border border-border/70 px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`size-2 rounded-full ${color}`} />
                {t(`progress.${key}`)}
              </p>
              <p className="mt-1 text-xl font-bold">{n}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t("overview.progressNote")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("overview.distribution")}</h3>
            <span className="text-xs text-muted-foreground">
              {t("overview.distributionN", { count: score.gradedAttemptCount })}
            </span>
          </div>
          <div className="flex h-40 items-end gap-1.5 px-1">
            {score.distribution.map((b) => {
              const h = (b.count / maxBar) * 100;
              const isLow = b.toPercent <= 50;
              return (
                <div key={b.fromPercent} className="flex flex-1 flex-col items-center gap-1">
                  <span className={`text-[10px] font-medium text-muted-foreground ${b.count ? "" : "opacity-0"}`}>
                    {b.count || 0}
                  </span>
                  <div
                    className={`w-full rounded-t-md ${isLow ? "bg-rose-400" : "bg-indigo-400"}`}
                    style={{ height: `${Math.max(h, b.count ? 8 : 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("overview.distributionNote", {
              avg: score.averagePercent ?? "—",
              median: score.medianPercent ?? "—",
            })}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">{t("overview.attention")}</h3>
          <p className="mb-2 text-xs font-medium text-rose-600">
            {t("overview.hardTitle", { count: hard.length })}
          </p>
          <ul className="space-y-2">
            {hard.map((q) => (
              <li key={q.position} className="flex items-start justify-between gap-2 text-sm">
                <span>
                  <span className="font-semibold text-primary">#{q.position}</span>{" "}
                  <span className="text-muted-foreground">{q.promptPreview}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{q.accuracyPercent ?? 0}%</span>
              </li>
            ))}
            {hard.length === 0 ? <li className="text-xs text-muted-foreground">—</li> : null}
          </ul>
          <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">
            {t("overview.easyTitle", { count: easy.length })}
          </p>
          <ul className="space-y-2">
            {easy.map((q) => (
              <li key={q.position} className="flex items-start justify-between gap-2 text-sm">
                <span>
                  <span className="font-semibold text-primary">#{q.position}</span>{" "}
                  <span className="text-muted-foreground">{q.promptPreview}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{q.accuracyPercent ?? 0}%</span>
              </li>
            ))}
            {easy.length === 0 ? <li className="text-xs text-muted-foreground">—</li> : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
