import { PracticeRunner } from "@/components/features/student/activities/practice-runner";

export default async function StudentActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PracticeRunner activityId={Number(id)} />;
}
