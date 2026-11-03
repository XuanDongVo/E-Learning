"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ChevronRight, KeyRound, Mail, Pencil, School } from "lucide-react";
import { teacherStudentService } from "@/services/teacher/student.service";
import { Button } from "@/components/ui/button";

export default function StudentDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const studentId = Number(params.studentId);
  const pathname = usePathname();
  const base = `/teacher/students/${studentId}`;
  const t = useTranslations("teacher.students");
  const tHub = useTranslations("teacher.students.hub");

  const student = useQuery({
    queryKey: ["teacher-student", studentId],
    queryFn: () => teacherStudentService.get(studentId),
    enabled: Number.isFinite(studentId),
  });
  const detail = student.data?.data;
  const name = detail?.fullName ?? "…";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(-2)
    .toUpperCase();

  const accountActive = detail?.accountStatus !== "INACTIVE";
  const accountLabel = accountActive ? t("active") : t("locked");

  const tabs = [
    { href: base, label: tHub("tabs.overview"), exact: true },
    { href: `${base}/assignments`, label: tHub("tabs.assignments") },
    { href: `${base}/activities`, label: tHub("tabs.activities") },
    { href: `${base}/profile`, label: tHub("tabs.profile") },
  ];

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Link href="/teacher/students" className="hover:text-foreground">
          {t("title")}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{name}</span>
      </nav>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-lg font-extrabold text-primary">
              {initials || "HS"}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold">{name}</h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    accountActive
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-700"
                  }`}
                >
                  {accountLabel}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {detail?.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" />
                    {detail.email}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <School className="size-3.5" />
                  {detail?.membershipStatus === "ACTIVE" && detail.className
                    ? detail.className
                    : t("noActiveClass")}
                </span>
                {detail?.gradeName && (
                  <span className="font-semibold">{detail.gradeName}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold"
              disabled
              title={tHub("layout.resetPasswordSoon")}
            >
              <KeyRound className="size-3.5" /> {tHub("layout.resetPassword")}
            </Button>
            <Button size="sm" className="gap-1.5 text-xs font-bold" asChild>
              <Link href={`${base}/edit`}>
                <Pencil className="size-3.5" /> {tHub("layout.editProfile")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-t border-border px-3">
          {tabs.map((tab) => {
            const segment = tab.href.split("/").pop();
            const active = tab.exact
              ? pathname === tab.href ||
                pathname.endsWith(`/teacher/students/${studentId}`) ||
                (pathname.endsWith(`/students/${studentId}`) &&
                  !pathname.includes("/assignments") &&
                  !pathname.includes("/activities") &&
                  !pathname.includes("/profile") &&
                  !pathname.includes("/edit"))
              : pathname.includes(`/students/${studentId}/${segment}`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-bold transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </section>

      {student.isError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {t("detail.error")}
        </p>
      )}

      <div>{children}</div>
    </div>
  );
}
