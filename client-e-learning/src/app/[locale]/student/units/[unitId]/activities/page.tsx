import { ActivityHub } from "@/components/features/student/activities/activity-hub";

export default async function StudentActivitiesPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId: rawUnitId } = await params;
  const unitId = Number(rawUnitId);

  return <ActivityHub unitId={Number.isFinite(unitId) ? unitId : undefined} />;
}
