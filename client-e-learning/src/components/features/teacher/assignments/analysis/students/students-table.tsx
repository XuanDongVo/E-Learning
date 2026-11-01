"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { StudentResultRow } from "@/types/assignment-analysis";

function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function StudentsTable({
  rows,
  onViewAttempt,
}: {
  rows: StudentResultRow[];
  onViewAttempt: (studentId: number) => void;
}) {
  const t = useTranslations("teacher.analytics.students");

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">{t("col.student")}</th>
            <th className="px-3 py-2 font-medium">{t("col.class")}</th>
            <th className="px-3 py-2 font-medium">{t("col.status")}</th>
            <th className="px-3 py-2 font-medium">{t("col.deadline")}</th>
            <th className="px-3 py-2 font-medium">{t("col.score")}</th>
            <th className="px-3 py-2 font-medium">{t("col.duration")}</th>
            <th className="px-3 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.studentId} className="border-t border-border/70">
              <td className="px-3 py-2 font-medium">{row.studentName}</td>
              <td className="px-3 py-2">{row.className}</td>
              <td className="px-3 py-2">{t(`status.${row.lifecycleStatus}`)}</td>
              <td className="px-3 py-2">{t(`deadlineState.${row.deadlineState}`)}</td>
              <td className="px-3 py-2 tabular-nums">
                {row.scorePercent == null ? "—" : `${row.scorePercent.toFixed(0)}%`}
              </td>
              <td className="px-3 py-2 tabular-nums">{formatDuration(row.durationSeconds)}</td>
              <td className="px-3 py-2 text-right">
                {row.attemptId != null ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewAttempt(row.studentId)}
                  >
                    {t("viewAttempt")}
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
