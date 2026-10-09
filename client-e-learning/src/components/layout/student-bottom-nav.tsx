"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart2,
  BookOpen,
  ClipboardList,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/student", icon: Home },
  { label: "Units", href: "/student/units", icon: BookOpen },
  { label: "Activities", href: "/student/activities", icon: Activity },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { label: "Progress", href: "/student/progress", icon: BarChart2 },
];

export function StudentBottomNav() {
  const pathname = usePathname();

  const isItemActive = (href: string) =>
    href === "/student"
      ? pathname === "/student"
      : pathname.startsWith(href);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-color bg-card-bg px-2 lg:hidden"
      aria-label="Student navigation"
    >
      {NAV_ITEMS.map((item) => {
        const active = isItemActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-1 text-label font-semibold transition-colors",
              active ? "text-primary" : "text-neutral-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
