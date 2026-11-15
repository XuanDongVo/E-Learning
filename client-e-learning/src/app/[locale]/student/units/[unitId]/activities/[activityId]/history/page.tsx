import { notFound } from "next/navigation";
import { ActivityHistoryPage } from "@/components/features/student/activities/history/activity-history-page";

export default async function Page({
  params,
}: {
  params: Promise<{ unitId: string; activityId: string }>;
}) {
  const { unitId, activityId } = await params;
  const parsedUnitId = Number(unitId);
  const parsedActivityId = Number(activityId);
  if (
    !Number.isInteger(parsedUnitId) ||
    parsedUnitId <= 0 ||
    !Number.isInteger(parsedActivityId) ||
    parsedActivityId <= 0
  ) {
    notFound();
  }
  return <ActivityHistoryPage unitId={parsedUnitId} activityId={parsedActivityId} />;
}
