import { AuthGuard } from "@/components/auth/auth-guard";
import { StudentShell } from "@/components/layout/student-shell";
import "@/styles/student/theme.css";
import "@/styles/student/surfaces.css";
import "@/styles/student/typography.css";
import "@/styles/student/page-heading.css";
import "@/styles/student/vocabulary.css";
import "@/styles/student/vocabulary-progress.css";
import "@/styles/student/foundations-v2.css";
import "@/styles/student/knowledge.css";
import "@/styles/student/unit-detail-hero.css";
import "@/styles/student/mascot-scenes.css";
import { PipoProvider } from "@/components/student-ui/visuals/pipo/pipo-provider";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="STUDENT">
      <PipoProvider>
        <div className="student-theme min-h-screen bg-background text-foreground">
          <StudentShell>{children}</StudentShell>
        </div>
      </PipoProvider>
    </AuthGuard>
  );
}
