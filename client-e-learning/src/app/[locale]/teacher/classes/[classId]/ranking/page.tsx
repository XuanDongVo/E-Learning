import { ClassRankingView } from "@/components/features/teacher/classes/class-ranking-view";

export default async function ClassRankingPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <ClassRankingView classId={Number(classId)} />;
}
