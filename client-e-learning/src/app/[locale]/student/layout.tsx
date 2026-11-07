import { AuthGuard } from "@/components/auth/auth-guard";
import { StudentShell } from "@/components/layout/student-shell";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="STUDENT">
      <StudentShell>{children}</StudentShell>
    </AuthGuard>
  );
}
