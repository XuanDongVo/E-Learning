"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  CircleHelp,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LocaleProvider, useLocale } from "@/components/i18n/locale-provider";

const navigation: {
  key:
    | "overview"
    | "classes"
    | "students"
    | "activities"
    | "assignments"
    | "analytics";
  href: string;
  icon: LucideIcon;
  badge?: string;
}[] = [
  { key: "overview", href: "/teacher", icon: LayoutDashboard },
  { key: "classes", href: "/teacher/classes", icon: Users },
  { key: "students", href: "/teacher/students", icon: Users },
  { key: "activities", href: "/teacher/activities", icon: ClipboardList },
  {
    key: "assignments",
    href: "/teacher/assignments",
    icon: ClipboardList,
    badge: "8",
  },
  { key: "analytics", href: "/teacher/reports", icon: BarChart3 },
];

function TeacherSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLocale();
  const [contentExpandedOverride, setContentExpandedOverride] = useState<boolean | null>(null);
  const contentExpanded = contentExpandedOverride ?? pathname.startsWith("/teacher/content");
  const questionBanksActive = pathname.startsWith(
    "/teacher/content/question-banks",
  );
  const explorerActive =
    pathname.startsWith("/teacher/content") && !questionBanksActive;

  return (
    <>
      {open && (
        <button
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[4.1rem] items-center gap-3 border-b-2 border-sidebar-border px-4 bg-sidebar">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-pop-sm">
            <GraduationCap className="size-[1.1rem]" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.95rem] font-extrabold tracking-tight">
              Class<span className="text-primary">Room</span>
            </p>
            <p className="text-[0.625rem] font-semibold text-muted-foreground">
              English learning studio
            </p>
          </div>
          <button
            className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Đóng menu"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav
          className="flex-1 space-y-1.5 px-3 py-4"
          aria-label="Điều hướng giáo viên"
        >
          <p className="px-2 pb-1.5 text-[0.625rem] font-bold uppercase tracking-wider text-muted-foreground/80">
            Không gian giáo viên
          </p>
          {navigation.map(({ key, href, icon: Icon }) => {
            const active =
              href === "/teacher"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[0.8125rem] font-bold transition-all ${
                  active
                    ? "border border-border bg-card text-primary shadow-pop-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <Icon className="size-[1.05rem]" />
                <span className="flex-1">{t(key)}</span>
              </Link>
            );
          })}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              aria-expanded={contentExpanded}
              onClick={() => setContentExpandedOverride(!contentExpanded)}
              className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[0.8125rem] font-bold transition-all ${
                explorerActive || questionBanksActive
                  ? "border border-border bg-card text-primary shadow-pop-sm"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <BookOpen className="size-[1.05rem]" />
              <span className="flex-1 text-left">{t("content")}</span>
              {contentExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
            {contentExpanded && (
              <div className="ml-5 space-y-1 border-l-2 border-border pl-3 pt-1">
                <Link
                  href="/teacher/content"
                  onClick={onClose}
                  aria-current={explorerActive ? "page" : undefined}
                  className={`flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold transition-all ${
                    explorerActive
                      ? "border border-border bg-card text-primary shadow-pop-sm"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {t("contentExplorer")}
                </Link>
                <Link
                  href="/teacher/content/question-banks"
                  onClick={onClose}
                  aria-current={questionBanksActive ? "page" : undefined}
                  className={`flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold transition-all ${
                    questionBanksActive
                      ? "border border-border bg-card text-primary shadow-pop-sm"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {t("questionBanksNav")}
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            className="flex h-9 w-full items-center gap-3 rounded-xl px-2.5 text-[0.8125rem] font-bold text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            onClick={() => toast("Cài đặt sẽ có ở giai đoạn sau")}
          >
            <Settings className="size-4" />
            Cài đặt
          </button>
          <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 shadow-pop-sm">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-[0.75rem] font-extrabold text-primary border border-primary/20">
              MA
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.75rem] font-extrabold">
                Cô Mai Anh
              </p>
              <p className="truncate text-[0.625rem] font-semibold text-muted-foreground">
                Giáo viên tiếng Anh
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAssignmentEditor =
    /^\/teacher\/assignments\/[^/]+$/.test(pathname) ||
    pathname === "/teacher/assignments/new";

  return (
    <AuthGuard requiredRole="TEACHER">
      <LocaleProvider>
        <div className="min-h-screen bg-background-app text-foreground font-sans">
          <TeacherSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="min-h-screen lg:pl-60">
           {!isAssignmentEditor && (
             <header className="sticky top-0 z-20 flex h-[4.1rem] items-center gap-3 border-b-2 border-border bg-card/95 px-4 backdrop-blur sm:px-6">
              <button
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-pop-sm lg:hidden"
                aria-label="Mở menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-4" />
              </button>
              <div className="relative hidden w-full max-w-md sm:block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-10 w-full rounded-xl border-2 border-border bg-card pl-9 pr-3 text-[0.8125rem] font-medium outline-none placeholder:text-muted-foreground shadow-pop-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Tìm lớp học, unit, học sinh..."
                  aria-label="Tìm kiếm"
                />
              </div>
              <div className="ml-auto flex items-center gap-2.5">
                <LocaleToggle />
                <button
                  className="grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground shadow-pop-sm hover:bg-muted"
                  aria-label="Trợ giúp"
                >
                  <CircleHelp className="size-4" />
                </button>
                <button
                  className="relative grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground shadow-pop-sm hover:bg-muted"
                  aria-label="Thông báo"
                  onClick={() => toast.success("Bạn không có thông báo mới")}
                >
                  <Bell className="size-4" />
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
                </button>
              </div>
            </header>
           )}
            <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </LocaleProvider>
    </AuthGuard>
  );
}

function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div
      className="flex h-9 items-center rounded-lg border border-border bg-card p-0.5"
      aria-label={t("language")}
    >
      <button
        type="button"
        onClick={() => setLocale("vi")}
        className={`rounded-md px-2 text-[0.6875rem] font-bold ${locale === "vi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        aria-pressed={locale === "vi"}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-md px-2 text-[0.6875rem] font-bold ${locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
