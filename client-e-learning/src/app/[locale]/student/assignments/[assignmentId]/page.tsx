import { StudentAssignmentPaperPage } from "@/components/features/student/assignment-attempt/student-assignment-paper-page";

export default async function StudentAssignmentPaperRoute({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return <StudentAssignmentPaperPage assignmentId={assignmentId} />;
}
