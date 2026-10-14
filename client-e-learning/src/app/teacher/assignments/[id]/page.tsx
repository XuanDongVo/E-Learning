"use client";

import { Suspense } from "react";
import { AssignmentBuilder } from "@/components/features/teacher/assignments/demo/components/AssignmentBuilder";

export default function AssignmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground">
          Loading assignment builder…
        </div>
      }
    >
      <AssignmentBuilder id={params.id} />
    </Suspense>
  );
}