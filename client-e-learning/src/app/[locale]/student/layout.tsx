import { AuthGuard } from "@/components/auth/auth-guard";
import { StudentShell } from "@/components/layout/student-shell";
import "@/styles/student/theme.css";
import "@/styles/student/surfaces.css";
import "@/styles/student/typography.css";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="STUDENT">
      <div className="student-theme min-h-screen bg-background text-foreground">
        <StudentShell>{children}</StudentShell>
      </div>
    </AuthGuard>
  );
}
