"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace(user.role === "TEACHER" ? "/teacher" : "/");
    }
  }, [isLoading, pathname, requiredRole, router, user]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-app text-body text-neutral-muted">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}