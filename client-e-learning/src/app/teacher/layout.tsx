import Link from "next/link";
import { Activity, ArrowLeft, BarChart3, BookOpen, ClipboardList, Gamepad2, LayoutDashboard, Settings, ShieldCheck, UserRound, Users } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SessionActions } from "@/components/auth/session-actions";
import { RoleSwitcher } from "@/components/layout/role-switcher";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthGuard requiredRole="TEACHER">
        <div className="flex min-h-screen bg-background-app">
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border-color bg-card-bg px-4 py-6 lg:flex">
            <div className="space-y-8">
              <Link href="/teacher" className="flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-md shadow-secondary/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-neutral-dark">
                  Learn<span className="text-secondary">Teacher</span>
                </span>
              </Link>
              <nav className="space-y-1">
                <Link href="/teacher" className="flex items-center gap-3.5 rounded-xl bg-secondary-light px-4 py-3 text-sm font-semibold text-secondary-hover"><LayoutDashboard className="h-5 w-5" /><span>Dashboard</span></Link>
                <Link href="/teacher/classes" className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-muted transition hover:bg-secondary-light hover:text-secondary-hover"><Users className="h-5 w-5" /><span>Classes</span></Link>
                <div className="my-3 border-t border-border-color" />
                <span className="px-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-neutral-subtle">Workspace</span>
                <Link href="#content" className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-muted"><BookOpen className="h-4 w-4" /><span>Content</span></Link>
                <Link href="#activities" className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-muted"><Activity className="h-4 w-4" /><span>Activities</span></Link>
                <Link href="#assignments" className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-muted"><ClipboardList className="h-4 w-4" /><span>Assignments</span></Link>
                <Link href="#students" className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-muted"><UserRound className="h-4 w-4" /><span>Students</span></Link>
                <Link href="#games" className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-muted"><Gamepad2 className="h-4 w-4" /><span>Games</span></Link>
                <Link href="#reports" className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-muted"><BarChart3 className="h-4 w-4" /><span>Reports</span></Link>
                <Link href="#settings" className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-muted"><Settings className="h-4 w-4" /><span>Settings</span></Link>
              </nav>
            </div>
            <Link
              href="/student"
              className="flex items-center gap-2 border-t border-border-color p-2 pt-4 text-xs font-bold text-primary hover:text-primary-hover"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Switch to Student View</span>
            </Link>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-16 items-center justify-between border-b border-border-color bg-card-bg px-6">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-neutral-dark">
                  Teacher Portal
                </span>
              </div>
              <SessionActions />
            </header>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </AuthGuard>
      <RoleSwitcher />
    </>
  );
}
