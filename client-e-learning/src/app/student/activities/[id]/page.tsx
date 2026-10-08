import { ActivitySessionRunner } from "@/components/features/student/activities/activity-session-runner";

export default async function StudentActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ActivitySessionRunner activityId={Number(id)} />;
}
