"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

function parseTab(raw: string | null): AnalysisTab {
  if (raw && (ANALYSIS_TABS as string[]).includes(raw)) return raw as AnalysisTab;
  return "overview";
}

export function TeacherAssignmentAnalysisPage({
  assignmentId: _assignmentId,
}: {
  assignmentId: number;
}) {
  // assignmentId reserved for when USE_MOCK is turned off
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = parseTab(searchParams.get("tab"));
  const [reviewStudentId, setReviewStudentId] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const setTab = useCallback(
    (next: AnalysisTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-foreground">
      <AnalysisHeader />
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <AnalysisTabs value={tab} onChange={setTab} />
        {tab === "overview" ? (
          <OverviewPanel onGoStudents={() => setTab("students")} />
        ) : null}
        {tab === "questions" ? <QuestionsPanel /> : null}
        {tab === "sections" ? <SectionsPanel /> : null}
        {tab === "students" ? (
          <StudentsPanel
            onViewAttempt={(id) => {
              setReviewStudentId(id);
              setReviewOpen(true);
            }}
          />
        ) : null}
        {tab === "classes" ? <ClassesPanel /> : null}
      </main>

      <AttemptReviewSheet
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        studentId={reviewStudentId}
      />
    </div>
  );
}
