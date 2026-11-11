"use client";

import { usePathname } from "@/i18n/navigation";
import { StudentNavbar } from "@/components/layout/student-navbar"; 

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const immersiveActivity = /^\/student\/units\/[^/]+\/activities\/[^/]+$/.test(pathname);
  const immersiveAssignmentAttempt = /^\/student\/assignments\/[^/]+\/attempt$/.test(pathname);
  const immersiveGame = /^\/student\/game\/[^/]+\/[^/]+$/.test(pathname);

  if (immersiveActivity || immersiveAssignmentAttempt || immersiveGame) {
    return (
      <div className="min-h-screen bg-background-app notranslate" translate="no">
        <main className="h-dvh w-full overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-app">
      <StudentNavbar />
      <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 sm:p-5 lg:p-6">
        {children}
      </main>
    </div>
  );
}
