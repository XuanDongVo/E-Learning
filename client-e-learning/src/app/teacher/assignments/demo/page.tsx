"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AssignmentBuilder } from "@/components/features/teacher/assignments/demo/components/AssignmentBuilder";

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
        <div className="p-8 text-sm text-muted-foreground">
          Loading assignment builder…
        </div>
      }
    >
      <AssignmentDemoContent />
    </Suspense>
  );
}
