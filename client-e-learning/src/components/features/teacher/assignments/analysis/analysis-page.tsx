"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AnalysisHeader } from "./analysis-header";
import { AnalysisTabs } from "./analysis-tabs";
import { OverviewPanel } from "./overview/overview-panel";
import { QuestionsPanel } from "./questions/questions-panel";
import { SectionsPanel } from "./sections/sections-panel";
import { StudentsPanel } from "./students/students-panel";
import { ClassesPanel } from "./classes/classes-panel";
import { AttemptReviewSheet } from "./attempt-review/attempt-review-sheet";
import type { AnalysisTab } from "./types";
import { ANALYSIS_TABS } from "./types";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";

function parseTab(raw: string | null): AnalysisTab {
  if (raw && (ANALYSIS_TABS as string[]).includes(raw)) return raw as AnalysisTab;
  return "overview";
}

export function TeacherAssignmentAnalysisPage({ assignmentId }: { assignmentId: number }) {
  const t = useTranslations("teacher.analytics");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = parseTab(searchParams.get("tab"));
  const [reviewStudentId, setReviewStudentId] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const overviewQuery = useQuery({
    queryKey: ["teacher-analysis-overview", assignmentId],
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

  return (
    <div className="text-foreground">
      <AnalysisHeader title={overviewQuery.data?.summary.title} />
      <main className="space-y-4">
        <AnalysisTabs value={tab} onChange={setTab} />

        {overviewQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p>{t("loadError")}</p>
            <button type="button" className="mt-2 text-primary" onClick={() => overviewQuery.refetch()}>
              {t("retry")}
            </button>
          </div>
        ) : null}

        {tab === "overview" ? (
          <OverviewPanel
            assignmentId={assignmentId}
            overview={overviewQuery.data}
            loading={overviewQuery.isLoading}
            onGoStudents={() => setTab("students")}
          />
        ) : null}
        {tab === "questions" ? <QuestionsPanel assignmentId={assignmentId} /> : null}
        {tab === "sections" ? <SectionsPanel assignmentId={assignmentId} /> : null}
        {tab === "students" ? (
          <StudentsPanel
            assignmentId={assignmentId}
            classAvgPercent={overviewQuery.data?.score.averagePercent ?? null}
            onViewAttempt={(id) => {
              setReviewStudentId(id);
              setReviewOpen(true);
            }}
          />
        ) : null}
        {tab === "classes" ? (
          <ClassesPanel
            rows={overviewQuery.data?.classComparison ?? []}
            loading={overviewQuery.isLoading}
          />
        ) : null}
      </main>

      <AttemptReviewSheet
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        assignmentId={assignmentId}
        studentId={reviewStudentId}
        classAvgPercent={overviewQuery.data?.score.averagePercent ?? null}
      />
    </div>
  );
}
