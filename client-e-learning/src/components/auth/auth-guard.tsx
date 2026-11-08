"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import type { UserRole } from "@/types/auth";

export function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: UserRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, sessionEndReason } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      if (sessionEndReason === "account_inactive") {
        router.replace("/login?reason=account_inactive");
        return;
      }
      if (sessionEndReason === "logged_out") {
        router.replace("/login");
        return;
      }
      const currentSearch = typeof window === "undefined" ? "" : window.location.search;
      const returnTo = `${pathname}${currentSearch}`;
      const reason = sessionEndReason === "session_expired"
        ? "&reason=session_expired"
        : "";
      router.replace(`/login?next=${encodeURIComponent(returnTo)}${reason}`);
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace(user.role === "TEACHER" ? "/teacher" : "/");
    }
  }, [isLoading, pathname, requiredRole, router, sessionEndReason, user]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-app text-body text-neutral-muted">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
