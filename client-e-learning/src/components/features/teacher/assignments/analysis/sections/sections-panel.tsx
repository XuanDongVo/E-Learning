"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import type { SectionAnalysisRow } from "@/types/assignment-analysis";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table/data-table";
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
    return <div className="rounded-xl border border-destructive/30 p-4 text-sm">{t("loadError")}{" "}<button type="button" className="text-primary" onClick={() => query.refetch()}>{t("retry")}</button></div>;
  }

  const items = query.data?.items ?? [];
  const weakest = [...items].sort((a, b) => (a.accuracyPercent ?? 100) - (b.accuracyPercent ?? 100))[0];
  const columns: DataTableColumn<SectionAnalysisRow>[] = [
    { id: "section", header: t("sections.col.section"), cell: (row) => <span className="font-medium">{row.sectionTitle ?? "—"}</span> },
    { id: "count", header: t("sections.col.count"), cell: (row) => <span className="tabular-nums">{row.questionCount}</span> },
    {
      id: "result",
      header: t("sections.col.result"),
      cell: (row) => {
        const n = Math.max(row.sampleSlots, 1);
        return <OutcomeBar outcome={{ correct: Math.round((100 * row.correctCount) / n), partial: Math.round((100 * row.partialCount) / n), incorrect: Math.round((100 * row.incorrectCount) / n), blank: Math.round((100 * row.unansweredCount) / n) }} />;
      },
    },
    { id: "accuracy", header: t("sections.col.accuracy"), cell: (row) => <span className="tabular-nums">{row.accuracyPercent ?? 0}% <span className="text-xs text-muted-foreground">n={row.sampleSlots}</span></span> },
    { id: "score", header: t("sections.col.scoreRate"), cell: (row) => <span className="tabular-nums">{row.scoreRatePercent ?? 0}%</span> },
    { id: "blank", header: t("sections.col.blank"), cell: (row) => <span className="tabular-nums text-muted-foreground">{row.blankPercent ?? 0}%</span> },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {t("sections.footnote")}{" "}
          {weakest ? <span className="font-medium text-foreground">{t("sections.weakest", { title: weakest.sectionTitle ?? "—", percent: weakest.accuracyPercent ?? 0 })}</span> : null}
        </p>
        <OutcomeLegend />
      </div>
      <DataTable
        data={items}
        columns={columns}
        getRowKey={(row) => row.sectionId ?? row.sectionTitle ?? "section"}
        minWidth="720px"
        rowClassName={(row) => (row.accuracyPercent != null && row.accuracyPercent < 40 ? "bg-rose-50" : "")}
        emptyState={<div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{t("empty")}</div>}
      />
    </div>
  );
}
