"use client";

import { usePathname } from "@/i18n/navigation";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentBottomNav } from "@/components/layout/student-bottom-nav";
import { StudentHeader } from "@/components/layout/student-header";

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersiveActivity = /^\/student\/units\/[^/]+\/activities\/[^/]+$/.test(pathname);
  const immersiveAssignmentAttempt = /^\/student\/assignments\/[^/]+$/.test(pathname);

  if (immersiveActivity || immersiveAssignmentAttempt) {
    return (
      <div className="min-h-screen bg-background-app">
        <main className="h-dvh w-full overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background-app pb-16 lg:pb-0">
      <StudentSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <StudentHeader />
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-5 lg:p-6">
          {children}
        </main>
        <StudentBottomNav />
      </div>
    </div>
  );
}
