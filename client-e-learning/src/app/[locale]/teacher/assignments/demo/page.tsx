"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AssignmentBuilder } from "@/components/features/teacher/assignments/builder/components/AssignmentBuilder";
import { FullPageState } from "@/components/feedback";

function AssignmentDemoContent() {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("id");
  return (
    <AssignmentBuilder
      key={assignmentId ?? "new"}
      id={assignmentId ?? undefined}
    />
  );
}

export default function AssignmentDemoPage() {
  return (
    <Suspense
      fallback={
        <FullPageState variant="loading" />
      }
    >
      <AssignmentDemoContent />
    </Suspense>
  );
}
