import { PracticeRunner } from "@/components/features/student/activities/practice-runner";


export default async function StudentActivityPage({
  params,
}: {
  params: Promise<{ unitId: string; activityId: string }>;
}) {
  const { unitId, activityId } = await params;
  return (
    <PracticeRunner
      unitId={Number(unitId)}
      activityId={Number(activityId)}
    />
  );
}