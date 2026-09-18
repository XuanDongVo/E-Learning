import Link from "next/link";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";
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
              <nav>
                <Link
                  href="/teacher"
                  className="flex items-center gap-3.5 rounded-xl bg-secondary-light px-4 py-3 text-sm font-semibold text-secondary-hover"
                >
                  <Users className="h-5 w-5" />
                  <span>Dashboard & Classes</span>
                </Link>
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
                <span className="rounded-full bg-secondary-light px-2 py-0.5 text-xs font-semibold text-secondary-hover">
                  Grade 6 - English
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
