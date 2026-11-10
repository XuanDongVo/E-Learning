"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  Gamepad2,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Trophy,
  LibraryBig,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { studentProfileService } from "@/services/student/student-profile.service";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

export const NAV_ITEMS = [
  { label: "Home", href: "/student", icon: Home },
  { label: "Learning", href: "/student/units", icon: BookOpen },
  { label: "Vocabulary", href: "/student/vocabulary", icon: LibraryBig },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { label: "Game", href: "/student/game", icon: Gamepad2 },
  { label: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
];

export function StudentNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ownProfile = useQuery({
    queryKey: ["student-profile"],
    queryFn: studentProfileService.get,
    enabled: Boolean(user),
  });
  const avatarKey = ownProfile.data?.data?.avatarKey;
  const avatarMatch = avatarKey?.match(
    /^dicebear:(adventurer|bottts|lorelei|pixel-art|fun-emoji|big-smile|notionists|open-peeps|micah|thumbs):(.{1,40})$/,
  );
  const avatarUrl = avatarMatch
    ? `https://api.dicebear.com/9.x/${avatarMatch[1]}/svg?seed=${encodeURIComponent(avatarMatch[2])}`
    : undefined;

  // Đóng menu khi đổi trang
  useEffect(() => setOpen(false), [pathname]);

  // Khoá cuộn trang + phím Esc khi menu mobile mở
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const isItemActive = (href: string) =>
    href === "/student" ? pathname === "/student" : pathname.startsWith(href);

  const displayName = user.fullName || user.email;
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <header className="student-navbar sticky top-0 z-40 w-full border-b-1 border-ink shadow-pop bg-card-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6">
          {/* Brand */}
          <Link href="/student" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-ui-xl font-extrabold tracking-tight text-neutral-dark">
              E-<span className="text-primary">Learning</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
            aria-label="Student navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "student-nav-item flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary-light text-primary"
                      : "text-neutral-muted hover:bg-background-app hover:text-neutral-dark",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop user */}
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Link
              href="/student/profile"
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-background-app"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="max-w-36 leading-tight">
                <span className="block truncate text-sm font-bold text-neutral-dark">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-neutral-muted">
                  {user.email}
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-muted transition hover:bg-background-app hover:text-neutral-dark"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="student-mobile-menu"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border-color text-neutral-dark transition hover:bg-background-app lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer (right) */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-foreground/40 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          id="student-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Student menu"
          className={cn(
            "student-nav-drawer absolute right-0 top-0 flex h-full w-[82%] max-w-80 flex-col border-l border-border-color bg-card-bg shadow-xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border-color px-4">
            <span className="text-ui-xl font-extrabold tracking-tight text-neutral-dark">
              E-<span className="text-primary">Learning</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-muted hover:bg-background-app hover:text-neutral-dark"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav
            className="flex-1 space-y-1 overflow-y-auto p-3"
            aria-label="Student navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "student-nav-item flex min-h-12 items-center gap-3 rounded-lg px-4 text-base font-semibold transition-colors",
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

          <div className="flex items-center border-t border-border-color p-3">
            <Link
              href="/student/profile"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 hover:bg-background-app"
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={avatarUrl} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-neutral-dark">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-neutral-muted">
                  {user?.email || ""}
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Sign out"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-muted hover:bg-background-app hover:text-neutral-dark"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
