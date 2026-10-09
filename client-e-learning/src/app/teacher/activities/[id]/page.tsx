"use client";

import { useParams } from "next/navigation";
import { ActivityEditor } from "@/components/features/teacher/activities/activity-editor";

export default function ActivityPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return (
      <p role="alert" className="text-body text-danger-text">
        Invalid activity id.
      </p>
    );
  }

  // Use the same editor as /activities/new, populated with the existing Activity.
  return <ActivityEditor activityId={id} />;
}
