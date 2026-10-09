import { PracticeRunner } from "@/components/features/student/activities/practice-runner";


export default async function StudentActivityPage({ params }: { params: Promise<{ "activityId": string }> }) {
  const { "activityId": id } = await params;
  return <PracticeRunner activityId={Number(id)} />;
}