"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SessionActions() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-body font-extrabold text-neutral-dark">
          {user.fullName}
        </p>
        <p className="text-body-sm text-neutral-muted">{user.email}</p>
      </div>
      <Avatar className="h-10 w-10 border-2 border-white shadow-xs">
        <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
      </Avatar>

      <button
        type="button"
        onClick={() => void logout()}
        aria-label="Sign out"
        title="Sign out"
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-neutral-muted transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
