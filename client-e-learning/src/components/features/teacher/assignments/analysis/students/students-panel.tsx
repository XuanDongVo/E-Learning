"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import type { AttemptLifecycleStatus } from "@/types/assignment-analysis";

const STATUS_DOT: Record<string, string> = {
  SUBMITTED: "bg-emerald-500",
  LATE: "bg-amber-500",
  TIMED_OUT: "bg-amber-400",
  IN_PROGRESS: "bg-blue-500",
  NOT_STARTED: "bg-slate-300",
  OVERDUE: "bg-rose-500",
};

export function StudentsPanel({
  assignmentId,
  classAvgPercent,
  onViewAttempt,
}: {
  assignmentId: number;
  classAvgPercent?: number | null;
  onViewAttempt: (studentId: number) => void;
}) {
  const t = useTranslations("teacher.analytics");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  const query = useQuery({
    queryKey: ["teacher-analysis-students", assignmentId, q, status],
    queryFn: () =>
      assignmentAnalysisService.getStudents(assignmentId, {
        page: 1,
        size: 100,
        search: q || undefined,
        lifecycleStatus: status === "ALL" || status === "LATE" || status === "OVERDUE"
          ? "ALL"
          : (status as AttemptLifecycleStatus),
        deadlineState: status === "LATE" ? "LATE" : status === "OVERDUE" ? "OVERDUE" : undefined,
      }),
  });

  const rows = query.data?.items ?? [];

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: rows.length };
    for (const s of rows) {
      c[s.lifecycleStatus] = (c[s.lifecycleStatus] ?? 0) + 1;
      if (s.deadlineState === "LATE") c.LATE = (c.LATE ?? 0) + 1;
      if (s.deadlineState === "OVERDUE") c.OVERDUE = (c.OVERDUE ?? 0) + 1;
    }
    return c;
  }, [rows]);

  const chips = [
    { id: "ALL", label: t("students.all", { count: counts.ALL ?? 0 }) },
    { id: "SUBMITTED", label: `${t("students.status.SUBMITTED")} (${counts.SUBMITTED ?? 0})` },
    { id: "LATE", label: `${t("students.status.LATE")} (${counts.LATE ?? 0})` },
    { id: "TIMED_OUT", label: `${t("students.status.TIMED_OUT")} (${counts.TIMED_OUT ?? 0})` },
    { id: "IN_PROGRESS", label: `${t("students.status.IN_PROGRESS")} (${counts.IN_PROGRESS ?? 0})` },
    { id: "NOT_STARTED", label: `${t("students.status.NOT_STARTED")} (${counts.NOT_STARTED ?? 0})` },
    { id: "OVERDUE", label: `${t("students.status.OVERDUE")} (${counts.OVERDUE ?? 0})` },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("students.searchPlaceholder")}
          className="h-9 rounded-full border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setStatus(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === c.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">{t("students.sortByName")}</div>
      </div>

      {query.isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{t("empty")}</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("students.col.student")}</th>
                <th className="px-3 py-2 font-medium">{t("students.col.class")}</th>
                <th className="px-3 py-2 font-medium">{t("students.col.status")}</th>
                <th className="px-3 py-2 font-medium">{t("students.col.score")}</th>
                <th className="px-3 py-2 font-medium">{t("students.col.percent")}</th>
                <th className="px-3 py-2 font-medium">{t("students.col.delta")}</th>
                <th className="px-3 py-2 font-medium">{t("students.col.duration")}</th>
                <th className="px-3 py-2 font-medium">{t("students.col.blank")}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const delta =
                  s.deltaVsClassAvg != null
                    ? s.deltaVsClassAvg
                    : s.scorePercent != null && classAvgPercent != null
                      ? Math.round(s.scorePercent - classAvgPercent)
                      : null;
                const minutes =
                  s.durationSeconds != null ? Math.round(s.durationSeconds / 60) : null;
                return (
                  <tr key={s.studentId} className="border-t border-border/70">
                    <td className="px-3 py-3 font-medium">{s.studentName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{s.className}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className={`size-2 rounded-full ${STATUS_DOT[s.lifecycleStatus] ?? "bg-slate-300"}`} />
                        {t(`students.status.${s.lifecycleStatus}` as "students.status.SUBMITTED")}
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {s.earnedPoints != null ? `${s.earnedPoints}/${s.possiblePoints}` : "—"}
                    </td>
                    <td
                      className={`px-3 py-3 tabular-nums font-semibold ${
                        s.scorePercent != null && s.scorePercent < 50 ? "text-rose-600" : ""
                      }`}
                    >
                      {s.scorePercent != null ? `${s.scorePercent}%` : "—"}
                    </td>
                    <td
                      className={`px-3 py-3 tabular-nums ${
                        delta == null ? "" : delta < 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {delta == null ? "—" : delta > 0 ? `+${delta}` : delta}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {minutes != null ? `${minutes}` : "—"}
                    </td>
                    <td className="px-3 py-3 tabular-nums">{s.blankCount ?? "—"}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => onViewAttempt(s.studentId)}
                        className="rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                        disabled={!s.attemptId}
                      >
                        {t("students.viewAttempt")}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                    {t("students.empty")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
