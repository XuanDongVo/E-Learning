"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  ChevronRight,
  Pencil,
  Plus,
  School,
  Users,
} from "lucide-react";
import { mockClasses } from "@/mock/mock-teacher-classes";
import { Button } from "@/components/ui/button";

export default function ClassWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { classId: string };
}) {
  const pathname = usePathname();
  const currentClass =
    mockClasses.find((c) => String(c.id) === params.classId) || mockClasses[0];

  const base = `/teacher/classes/${params.classId}`;

  const tabs = [
    { href: base, label: "Tổng quan", icon: BookOpen, exact: true },
    { href: `${base}/students`, label: "Danh sách học sinh", icon: Users },
    { href: `${base}/ranking`, label: "Bảng xếp hạng XP", icon: Award },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Link href="/teacher/classes" className="hover:text-foreground">
          Lớp học
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-bold">{currentClass.name}</span>
      </nav>

      {/* Workspace Header */}
      <header className="rounded-lg border border-border bg-card p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-xl font-extrabold text-primary">
              {currentClass.name.replace("Lớp ", "")}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {currentClass.name}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${
                    currentClass.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentClass.status === "ACTIVE"
                    ? "Đang hoạt động"
                    : "Đã lưu trữ"}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground font-semibold">
                <span className="inline-flex items-center gap-1">
                  <School className="size-3.5" /> {currentClass.grade.name} (
                  {currentClass.grade.code})
                </span>
                <span>Niên khóa: {currentClass.academicYear}</span>
                <span>Sĩ số: {currentClass.studentCount} học sinh</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2  px-5 py-4">
            <Link href={`/teacher/classes/${currentClass.id}/students`}>
              <Button size="sm" className="h-10 text-sm">
                <Plus className="size-4" />
                Thêm học sinh
              </Button>
            </Link>

            <Button
              size="sm"
              variant="outline"
              className="h-10 text-sm"
              onClick={() => {}}
              // disabled={()=>{}}
            >
              <Pencil className="size-4" />
              Chỉnh sửa lớp
            </Button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mt-5 -mb-5 -mx-5 flex gap-1 border-t border-border px-4 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href 
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
