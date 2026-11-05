import { ClassStudentsPanel } from "@/components/features/teacher/classes/class-students/class-students-panel";

export default async function ClassStudentsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <ClassStudentsPanel classId={Number(classId)} />;
}
