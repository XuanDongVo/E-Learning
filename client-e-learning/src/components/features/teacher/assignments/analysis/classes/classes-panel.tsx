"use client";

import { useTranslations } from "next-intl";
import type { ClassComparisonRow } from "@/types/assignment-analysis";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table/data-table";

export function ClassesPanel({
  rows,
  loading,
}: {
  rows: ClassComparisonRow[];
  loading?: boolean;
}) {
  const t = useTranslations("teacher.analytics");
  const columns: DataTableColumn<ClassComparisonRow>[] = [
    { id: "class", header: t("classes.col.class"), cell: (row) => <span className="font-semibold">{row.className}</span> },
    { id: "assigned", header: t("classes.col.assigned"), cell: (row) => <span className="tabular-nums">{row.assignedCount}</span> },
    { id: "submission", header: t("classes.col.submissionRate"), cell: (row) => <span className="tabular-nums">{row.submissionRate != null ? `${Math.round(row.submissionRate * 100)}%` : "—"} ({row.submittedCount})</span> },
    { id: "average", header: t("classes.col.average"), cell: (row) => <span className="tabular-nums">{row.averagePercent != null ? `${row.averagePercent}%` : "—"} <span className="text-xs text-muted-foreground">n={row.submittedCount}</span></span> },
    { id: "median", header: t("classes.col.median"), cell: (row) => <span className="tabular-nums">{row.medianPercent != null ? `${row.medianPercent}%` : "—"}</span> },
    { id: "accuracy", header: t("classes.col.accuracy"), cell: (row) => <span className="tabular-nums">{row.accuracyPercent != null ? `${row.accuracyPercent}%` : "—"}</span> },
  ];

  if (loading) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{t("empty")}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {t("classes.singleNote", { count: rows.length })}
      </div>
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.classId}
        minWidth="640px"
        emptyState={<div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{t("empty")}</div>}
      />
    </div>
  );
}
