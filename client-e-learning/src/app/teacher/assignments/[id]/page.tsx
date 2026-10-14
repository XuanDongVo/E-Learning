import { AssignmentBuilder } from "@/components/features/teacher/assignments/demo/components/AssignmentBuilder";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AssignmentBuilder id={id} />;
}
