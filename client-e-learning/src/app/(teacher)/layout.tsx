import Link from "next/link";
import { GraduationCap, Users, ClipboardList, ShieldCheck, ArrowLeft } from "lucide-react";
import { RoleSwitcher } from "@/components/layout/role-switcher";
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Teacher Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#E2E8F0] bg-white px-4 py-6 justify-between h-screen sticky top-0 shrink-0">
        <div className="space-y-8">
          <Link href="/teacher" className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06B6D4] text-white shadow-md shadow-cyan-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-1">
                Learn<span className="text-[#06B6D4]">Teacher</span>
              </span>
            </div>
          </Link>

          <nav className="space-y-1.5">
            <Link
              href="/teacher"
              className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold bg-[#ECFEFF] text-[#0891B2]"
            >
              <Users className="h-5 w-5" />
              <span>Dashboard & Classes</span>
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#F1F5F9]">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] p-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Switch to Student View</span>
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0F172A]">Teacher Portal</span>
            <span className="text-xs font-semibold text-[#0891B2] bg-[#ECFEFF] px-2 py-0.5 rounded-full">
              Grade 6 - English
            </span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>  <main className="flex-1 p-6">{children}</main>
      </div>
      <RoleSwitcher />
    </div>
  );
}
