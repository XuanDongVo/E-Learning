import { ClassStudentsView } from "@/components/features/teacher/classes/class-students-view";
export default async function ClassStudentsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <ClassStudentsView classId={Number(classId)} />;
}
