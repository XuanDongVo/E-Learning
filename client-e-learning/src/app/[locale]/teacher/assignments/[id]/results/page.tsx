"use client";

import { use } from "react";
import { TeacherAssignmentAnalysisPage } from "@/components/features/teacher/assignments/analysis/analysis-page";

export default function AssignmentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const assignmentId = Number(id);
  if (!Number.isFinite(assignmentId) || assignmentId <= 0) {
    return null;
  }
  return <TeacherAssignmentAnalysisPage assignmentId={assignmentId} />;
}
