"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, KeyRound, Mail, Pencil, School } from "lucide-react";
import { mockStudent } from "@/mock/mock-student-data";
import { Button } from "@/components/ui/button";

export default function StudentDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { studentId: string };
}) {
  const pathname = usePathname();
  const base = `/teacher/students/${params.studentId}`;

  const tabs = [
    { href: base, label: "Tổng quan", exact: true },
    { href: `${base}/assignments`, label: "Bài tập" },
    { href: `${base}/activities`, label: "Hoạt động" },
    { href: `${base}/profile`, label: "Hồ sơ" },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Link href="/students" className="hover:text-foreground">Học sinh</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{mockStudent.name}</span>
      </nav>

      {/* Header Info Card */}
      <section className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-lg font-extrabold text-primary">
              {mockStudent.initials}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold">{mockStudent.name}</h1>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                  {mockStudent.accountStatus}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="font-semibold">{mockStudent.code}</span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="size-3.5" />
                  {mockStudent.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <School className="size-3.5" />
                  {mockStudent.className || "Chưa có lớp"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <KeyRound className="size-3.5" /> Đặt lại mật khẩu
            </Button>
            <Button size="sm"  className="gap-1.5 text-xs font-bold">
              <Link href={`${base}/edit`}>
                <Pencil className="size-3.5" /> Sửa hồ sơ
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto border-t border-border px-3">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-bold transition-colors ${
                  isActive
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

      <div>{children}</div>
    </div>
  );
}
