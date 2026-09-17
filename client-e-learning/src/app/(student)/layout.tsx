import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentBottomNav } from "@/components/layout/student-bottom-nav";
import { StudentHeader } from "@/components/layout/student-header";
import { RoleSwitcher } from "@/components/layout/role-switcher";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <StudentHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1">{children}</main>

        {/* Mobile Bottom Navigation */}
        <StudentBottomNav />
      </div>

      {/* Role Switcher Demo Tool */}
      <RoleSwitcher />
    </div>
  );
}
