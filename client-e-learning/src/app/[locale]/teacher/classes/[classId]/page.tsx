import { ClassOverviewView } from "@/components/features/teacher/classes/class-overview-view";

export default async function ClassOverviewPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <ClassOverviewView classId={Number(classId)} />;
}
