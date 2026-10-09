"use client";

import { useParams } from "next/navigation";
import { ActivityDetail } from "@/components/features/teacher/activities/activity-detail";

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return Number.isFinite(id)
    ? <ActivityDetail activityId={id} />
    : <p className="text-body text-danger-text">Invalid activity id.</p>;
}
