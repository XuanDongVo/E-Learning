import { ClassWorkspaceShell } from "@/components/features/teacher/classes/class-workspace-shell";

export default async function ClassWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return (
    <ClassWorkspaceShell classId={Number(classId)}>
      {children}
    </ClassWorkspaceShell>
  );
}
