import { StudentAssignmentAttemptPage } from "@/components/features/student/assignment-attempt/student-assignment-attempt-page";

export default async function StudentAssignmentAttemptRoute({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return <StudentAssignmentAttemptPage assignmentId={assignmentId} />;
}
