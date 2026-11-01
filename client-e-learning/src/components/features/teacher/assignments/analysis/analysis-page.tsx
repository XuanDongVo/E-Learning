"use client";

import { useCallback, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FullPageState } from "@/components/feedback";
import { useTranslations } from "next-intl";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { AnalysisHeader } from "./analysis-header";
import { AnalysisTabs } from "./analysis-tabs";
import { OverviewPanel } from "./overview/overview-panel";
import { StudentsPanel } from "./students/students-panel";
import { QuestionsPanel } from "./questions/questions-panel";
import { AttemptReviewSheet } from "./attempt-review/attempt-review-sheet";
import type { AnalysisTab } from "./types";
import { ANALYSIS_TABS } from "./types";

function parseTab(raw: string | null): AnalysisTab {
  if (raw && (ANALYSIS_TABS as string[]).includes(raw)) return raw as AnalysisTab;
  return "overview";
}

export function TeacherAssignmentAnalysisPage({
  assignmentId,
}: {
  assignmentId: number;
}) {
  const t = useTranslations("teacher.analytics");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = parseTab(searchParams.get("tab"));
  const [filterClassId, setFilterClassId] = useState<number | null>(null);
  const [reviewStudentId, setReviewStudentId] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const overviewQuery = useQuery({
    queryKey: QUERY_KEYS.teacherAssignmentAnalysisOverview(assignmentId),
    queryFn: () => assignmentAnalysisService.getOverview(assignmentId),
  });

  const setTab = useCallback(
    (next: AnalysisTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const onSelectClass = (classId: number) => {
    setFilterClassId(classId);
    setTab("students");
  };

  const onViewAttempt = (studentId: number) => {
    setReviewStudentId(studentId);
    setReviewOpen(true);
  };

  if (overviewQuery.isError && !overviewQuery.data) {
    return (
      <FullPageState
        variant="error"
        title={t("loadError")}
        action={
          <button type="button" className="text-sm text-primary" onClick={() => overviewQuery.refetch()}>
            {t("retry")}
          </button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnalysisHeader summary={overviewQuery.data?.summary ?? null} />
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <AnalysisTabs value={tab} onChange={setTab} />
        {tab === "overview" ? (
          <OverviewPanel assignmentId={assignmentId} onSelectClass={onSelectClass} />
        ) : null}
        {tab === "students" ? (
          <StudentsPanel
            assignmentId={assignmentId}
            initialClassId={filterClassId}
            onViewAttempt={onViewAttempt}
          />
        ) : null}
        {tab === "questions" ? <QuestionsPanel assignmentId={assignmentId} /> : null}
      </main>

      <AttemptReviewSheet
        assignmentId={assignmentId}
        studentId={reviewStudentId}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />
    </div>
  );
}
