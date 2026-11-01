"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { ProgressSummary } from "./progress-summary";
import { ScoreSummaryCard } from "./score-summary";
import { ScoreDistribution } from "./score-distribution";
import { ClassComparisonTable } from "./class-comparison-table";

export function OverviewPanel({
  assignmentId,
  onSelectClass,
}: {
  assignmentId: number;
  onSelectClass?: (classId: number) => void;
}) {
  const t = useTranslations("teacher.analytics");
  const query = useQuery({
    queryKey: QUERY_KEYS.teacherAssignmentAnalysisOverview(assignmentId),
    queryFn: () => assignmentAnalysisService.getOverview(assignmentId),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
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

  const data = query.data;
  if (!data) {
    return <RegionState variant="empty" title={t("empty")} />;
  }

  return (
    <div className="space-y-4">
      <ProgressSummary progress={data.progress} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ScoreSummaryCard score={data.score} />
        <ScoreDistribution buckets={data.score.distribution} />
      </div>
      <ClassComparisonTable rows={data.classComparison} onSelectClass={onSelectClass} />
    </div>
  );
}
