import { ActivityReviewPage } from "@/components/features/student/activities/review/activity-review-page";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const parsedSessionId = Number(sessionId);
  if (!Number.isInteger(parsedSessionId) || parsedSessionId <= 0) notFound();
  return <ActivityReviewPage sessionId={parsedSessionId} />;
}
