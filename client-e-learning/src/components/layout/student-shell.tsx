"use client";

import { usePathname } from "next/navigation";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentBottomNav } from "@/components/layout/student-bottom-nav";
import { StudentHeader } from "@/components/layout/student-header";

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersiveActivity = /^\/student\/activities\/[^/]+/.test(pathname);

  if (immersiveActivity) {
    return (
      <div className="min-h-screen bg-background-app">
        <main className="min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background-app">
      <StudentSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <StudentHeader />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <StudentBottomNav />
      </div>
    </div>
  );
}
