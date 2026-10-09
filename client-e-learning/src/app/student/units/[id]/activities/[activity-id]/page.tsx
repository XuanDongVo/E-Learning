import { PracticeRunner } from "@/components/features/student/activities/practice-runner";


export default async function StudentActivityPage({ params }: { params: Promise<{ "activity-id": string }> }) {
  const { "activity-id": id } = await params;
  return <PracticeRunner activityId={Number(id)} />;
}
  