import { ActivityHub } from "@/components/features/student/activities/activity-hub";

export default async function StudentActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ unitId?: string }>;
}) {
  const params = await searchParams;
  const unitId = params.unitId ? Number(params.unitId) : undefined;

  return <ActivityHub unitId={Number.isFinite(unitId) ? unitId : undefined} />;
}
