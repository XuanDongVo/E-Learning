"use client";

import { useTranslations } from "next-intl";
import type { ClassComparisonRow } from "@/types/assignment-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table/data-table";

/** Accepts either 0–1 or 0–100 rates from backend. */
function rateLabel(v: number | null) {
  if (v == null) return "—";
  const n = v <= 1 ? v * 100 : v;
  return `${n.toFixed(0)}%`;
}

export function ClassComparisonTable({
  rows,
  onSelectClass,
}: {
  rows: ClassComparisonRow[];
  onSelectClass?: (classId: number) => void;
}) {
  const t = useTranslations("teacher.analytics.classComparison");
  const columns: DataTableColumn<ClassComparisonRow>[] = [
    {
      id: "class",
      header: t("class"),
      cell: (row) =>
        onSelectClass ? (
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => onSelectClass(row.classId)}>
            {row.className}
          </button>
        ) : row.className,
    },
    { id: "assigned", header: t("assigned"), cell: (row) => <span className="tabular-nums">{row.assignedCount}</span> },
    { id: "submission", header: t("submissionRate"), cell: (row) => <span className="tabular-nums">{rateLabel(row.submissionRate)} ({row.submittedCount})</span> },
    { id: "average", header: t("average"), cell: (row) => <span className="tabular-nums">{rateLabel(row.averagePercent)}</span> },
    { id: "median", header: t("median"), cell: (row) => <span className="tabular-nums">{rateLabel(row.medianPercent)}</span> },
    { id: "accuracy", header: t("accuracy"), cell: (row) => <span className="tabular-nums">{rateLabel(row.accuracyPercent)}</span> },
    { id: "band", header: t("overallBand"), cell: (row) => row.overallBand ? t(`band.${row.overallBand}`) : "—" },
  ];

  if (!rows.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable data={rows} columns={columns} getRowKey={(row) => row.classId} minWidth="640px" />
      </CardContent>
    </Card>
  );
}
