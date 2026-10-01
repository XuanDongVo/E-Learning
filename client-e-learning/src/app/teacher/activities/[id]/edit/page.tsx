"use client";

import { useParams } from "next/navigation";
import { ActivityEditor } from "@/components/features/teacher/activities/activity-editor";

export default function ActivityEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return Number.isFinite(id)
    ? <ActivityEditor activityId={id} />
    : <p className="text-body text-danger-text">Invalid activity id.</p>;
}
