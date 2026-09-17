"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  PlayCircle,
  ClipboardList,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Units", href: "/units", icon: BookOpen },
  { label: "Assign", href: "/assignments", icon: ClipboardList },
  { label: "Progress", href: "/progress", icon: BarChart2 },
];

export function StudentBottomNav() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#E2E8F0] bg-white/95 px-2 backdrop-blur-md lg:hidden">
      {NAV_ITEMS.map((item) => {
        const active = isItemActive(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-1 text-[11px] font-semibold transition-all",
              active
                ? "text-[#4F46E5]"
                : "text-[#94A3B8] hover:text-[#64748B]"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-12 items-center justify-center rounded-full transition-all",
                active ? "bg-[#EEF2FF] text-[#4F46E5]" : ""
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
