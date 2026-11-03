"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table/data-table";
import type { StudentResultRow } from "@/types/assignment-analysis";
import { RegionState } from "@/components/feedback";
import { formatDurationSeconds, formatScorePercent } from "@/utils/format";

export function StudentsTable({
  rows,
  onViewAttempt,
}: {
  rows: StudentResultRow[];
  onViewAttempt: (studentId: number) => void;
}) {
  const t = useTranslations("teacher.analytics.students");
  const columns: DataTableColumn<StudentResultRow>[] = [
    { id: "student", header: t("col.student"), cell: (row) => <span className="font-medium">{row.studentName}</span> },
    { id: "class", header: t("col.class"), cell: (row) => row.className },
    { id: "status", header: t("col.status"), cell: (row) => t(`status.${row.lifecycleStatus}`) },
    { id: "deadline", header: t("col.deadline"), cell: (row) => t(`deadlineState.${row.deadlineState}`) },
    { id: "score", header: t("col.score"), cell: (row) => <span className="tabular-nums">{formatScorePercent(row.scorePercent, 0)}</span> },
    { id: "duration", header: t("col.duration"), cell: (row) => <span className="tabular-nums">{formatDurationSeconds(row.durationSeconds)}</span> },
    {
      id: "actions",
      header: null,
      align: "right",
      cell: (row) =>
        row.attemptId != null ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onViewAttempt(row.studentId)}>
            {t("viewAttempt")}
          </Button>
        ) : null,
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowKey={(row) => row.studentId}
      minWidth="720px"
      emptyState={<RegionState variant="empty" description={t("empty")} />}
    />
  );
}
