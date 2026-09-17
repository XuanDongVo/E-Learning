"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  PlayCircle,
  ClipboardList,
  BarChart2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockCurrentUser } from "@/mock/db";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Units", href: "/units", icon: BookOpen },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Progress", href: "/progress", icon: BarChart2 },
];

export function StudentSidebar() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border-color bg-white px-4 py-6 justify-between h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="space-y-8">
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-indigo-200">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-neutral-dark flex items-center gap-1">
              Learn<span className="text-primary">Up</span>
            </span>
          </div>
        </Link>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 rounded-[12px] px-4 py-3 text-sm font-semibold transition-all duration-200 group",
                  active
                    ? "bg-primary-light text-primary shadow-xs"
                    : "text-neutral-muted hover:bg-background-app hover:text-neutral-dark"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-primary" : "text-neutral-subtle"
                  )}
                />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="pt-4 border-t border-border-color">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-background-app"
        >
          <Avatar className="h-10 w-10 border-2 border-white shadow-xs">
            <AvatarImage src={mockCurrentUser.avatarUrl} alt={mockCurrentUser.name} />
            <AvatarFallback>{mockCurrentUser.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-neutral-dark truncate">
              {mockCurrentUser.name}
            </span>
            <span className="text-xs text-neutral-subtle font-medium">
              {mockCurrentUser.className}
            </span>
          </div>
          <Sparkles className="h-4 w-4 text-accent" />
        </Link>
      </div>
    </aside>
  );
}
