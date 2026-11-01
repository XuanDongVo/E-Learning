"use client";

import { useTranslations } from "next-intl";
import type { ClassComparisonRow } from "@/types/assignment-analysis";

export function ClassesPanel({
  rows,
  loading,
}: {
  rows: ClassComparisonRow[];
  loading?: boolean;
}) {
  const t = useTranslations("teacher.analytics");

  if (loading) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{t("empty")}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {t("classes.singleNote", { count: rows.length })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">{t("classes.col.class")}</th>
              <th className="px-3 py-2 font-medium">{t("classes.col.assigned")}</th>
              <th className="px-3 py-2 font-medium">{t("classes.col.submissionRate")}</th>
              <th className="px-3 py-2 font-medium">{t("classes.col.average")}</th>
              <th className="px-3 py-2 font-medium">{t("classes.col.median")}</th>
              <th className="px-3 py-2 font-medium">{t("classes.col.accuracy")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.classId} className="border-t border-border/70">
                <td className="px-3 py-3 font-semibold">{r.className}</td>
                <td className="px-3 py-3 tabular-nums">{r.assignedCount}</td>
                <td className="px-3 py-3 tabular-nums">
                  {r.submissionRate != null ? `${Math.round(r.submissionRate * 100)}%` : "—"}{" "}
                  ({r.submittedCount})
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {r.averagePercent != null ? `${r.averagePercent}%` : "—"}{" "}
                  <span className="text-xs text-muted-foreground">n={r.submittedCount}</span>
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {r.medianPercent != null ? `${r.medianPercent}%` : "—"}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {r.accuracyPercent != null ? `${r.accuracyPercent}%` : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  {t("empty")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
