"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart2,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Home,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockCurrentUser } from "@/mock/db";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

const NAV_ITEMS = [
  { label: "Home", href: "/student", icon: Home },
  { label: "Units", href: "/student/units", icon: BookOpen },
  { label: "Activities", href: "/student/activities", icon: Activity },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { label: "Progress", href: "/student/progress", icon: BarChart2 },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const isItemActive = (href: string) =>
    href === "/student"
      ? pathname === "/student"
      : pathname.startsWith(href);

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border-color bg-card-bg px-4 py-6 lg:flex">
      <div className="space-y-8">
        <Link href="/student" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-ui-xl font-extrabold tracking-tight text-neutral-dark">
            Learn<span className="text-primary">Up</span>
          </span>
        </Link>

        <nav className="space-y-1" aria-label="Student navigation">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-body font-semibold transition-colors",
                  active
                    ? "bg-primary-light text-primary"
                    : "text-neutral-muted hover:bg-background-app hover:text-neutral-dark",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center border-t border-border-color pt-4">
        <Link
          href="/student/profile"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 transition-colors hover:bg-background-app"
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage
              src={mockCurrentUser.avatarUrl}
              alt={mockCurrentUser.name}
            />
            <AvatarFallback>{mockCurrentUser.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-body font-bold text-neutral-dark">
              {mockCurrentUser.name}
            </span>
            <span className="block truncate text-body-sm text-neutral-muted">
              {mockCurrentUser.className}
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => void logout()}
          aria-label="Sign out"
          title="Sign out"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-muted transition hover:bg-background-app hover:text-neutral-dark"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
