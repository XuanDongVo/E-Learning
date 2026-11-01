"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { QuestionAnalysisRow } from "@/types/assignment-analysis";

function rate(v: number | null) {
  return v == null ? "—" : `${v.toFixed(0)}%`;
}

function QuestionRow({ row }: { row: QuestionAnalysisRow }) {
  const t = useTranslations("teacher.analytics.questions");
  if (row.isExample) return null;
  return (
    <tr className="border-t border-border/70">
      <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.position}</td>
      <td className="px-3 py-2">
        <p className="line-clamp-2 font-medium">{row.promptPreview}</p>
        <p className="text-xs text-muted-foreground">{row.questionType}</p>
      </td>
      <td className="px-3 py-2 tabular-nums">{row.attemptCount}</td>
      <td className="px-3 py-2 tabular-nums text-emerald-600">{row.correctCount}</td>
      <td className="px-3 py-2 tabular-nums text-amber-600">{row.partialCount}</td>
      <td className="px-3 py-2 tabular-nums text-rose-600">{row.incorrectCount}</td>
      <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.unansweredCount}</td>
      <td className="px-3 py-2 tabular-nums">{rate(row.accuracyPercent)}</td>
      <td className="px-3 py-2 tabular-nums">{rate(row.scoreRatePercent)}</td>
    </tr>
  );
}

export function QuestionsPanel({ assignmentId }: { assignmentId: number }) {
  const t = useTranslations("teacher.analytics");
  const tq = useTranslations("teacher.analytics.questions");

  const query = useQuery({
    queryKey: QUERY_KEYS.teacherAssignmentAnalysisQuestions(assignmentId),
    queryFn: () => assignmentAnalysisService.getQuestions(assignmentId),
  });

  const groups = useMemo(() => {
    const items = (query.data?.items ?? []).filter((q) => !q.isExample);
    const map = new Map<string, QuestionAnalysisRow[]>();
    for (const q of items) {
      const key = q.sectionTitle || tq("ungrouped");
      const list = map.get(key) ?? [];
      list.push(q);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [query.data, tq]);

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <RegionState
        variant="error"
        title={t("loadError")}
        action={
          <button type="button" className="text-sm text-primary" onClick={() => query.refetch()}>
            {t("retry")}
          </button>
        }
      />
    );
  }

  if (!groups.length) {
    return <RegionState variant="empty" title={tq("empty")} />;
  }

  return (
    <div className="space-y-6">
      {groups.map(([section, rows]) => (
        <div key={section} className="overflow-x-auto rounded-xl border border-border">
          <div className="border-b border-border bg-muted/40 px-3 py-2 text-sm font-semibold">
            {section}
          </div>
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">{tq("col.prompt")}</th>
                <th className="px-3 py-2 font-medium">{tq("col.n")}</th>
                <th className="px-3 py-2 font-medium">{tq("col.correct")}</th>
                <th className="px-3 py-2 font-medium">{tq("col.partial")}</th>
                <th className="px-3 py-2 font-medium">{tq("col.incorrect")}</th>
                <th className="px-3 py-2 font-medium">{tq("col.unanswered")}</th>
                <th className="px-3 py-2 font-medium">{tq("col.accuracy")}</th>
                <th className="px-3 py-2 font-medium">{tq("col.scoreRate")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <QuestionRow key={row.questionId} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
