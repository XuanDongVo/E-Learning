import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentBottomNav } from "@/components/layout/student-bottom-nav";
import { StudentHeader } from "@/components/layout/student-header";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><div className="flex min-h-screen bg-background-app"><StudentSidebar /><div className="flex min-w-0 flex-1 flex-col"><StudentHeader /><main className="flex-1">{children}</main><StudentBottomNav /></div></div></AuthGuard>;
}