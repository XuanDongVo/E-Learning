"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  ChevronRight,
  Pencil,
  Plus,
  School,
  Users,
} from "lucide-react";
import { classService } from "@/services/class.service";
import { Button } from "@/components/ui/button";
import { RegionState } from "@/components/feedback";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";

export function ClassWorkspaceShell({
  classId,
  children,
}: {
  classId: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const classQuery = useQuery({
    queryKey: ["class", classId],
    queryFn: async () => (await classService.getById(classId)).data,
    enabled: Number.isFinite(classId) && classId > 0,
  });

  const currentClass = classQuery.data;
  const base = `/teacher/classes/${classId}`;

  const tabs = [
    { href: base, label: "Tổng quan", icon: BookOpen, exact: true },
    { href: `${base}/students`, label: "Danh sách học sinh", icon: Users },
    { href: `${base}/ranking`, label: "Bảng xếp hạng XP", icon: Award },
  ];

  if (classQuery.isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonList count={2} />
        {children}
      </div>
    );
  }

  if (classQuery.isError || !currentClass) {
    return (
      <div className="space-y-5">
        <RegionState
          variant="error"
          title="Không tải được lớp"
          description="Lớp không tồn tại hoặc bạn không có quyền xem."
          action={
            <Link
              href="/teacher/classes"
              className="rounded-lg border px-3 py-2 text-sm font-bold hover:bg-muted"
            >
              Quay lại danh sách lớp
            </Link>
          }
        />
      </div>
    );
  }

  const shortName = currentClass.name.replace(/^Lớp\s+/i, "");

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Link href="/teacher/classes" className="hover:text-foreground">
          Lớp học
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-bold text-foreground">{currentClass.name}</span>
      </nav>

      <header className="overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-xl font-extrabold text-primary">
              {shortName.slice(0, 4)}
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
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <School className="size-3.5" />
                  {currentClass.grade.name} ({currentClass.grade.code})
                </span>
                <span>Niên khóa: {currentClass.academicYear}</span>
                <span>Sĩ số: {currentClass.studentCount} học sinh</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 px-1 py-1 sm:px-5 sm:py-4">
            <Link href={`${base}/students`}>
              <Button size="sm" className="h-10 gap-1.5 text-sm">
                <Plus className="size-4" />
                Thêm học sinh
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="h-10 gap-1.5 text-sm" disabled>
              <Pencil className="size-4" />
              Chỉnh sửa lớp
            </Button>
          </div>
        </div>

        <div className="-mx-5 -mb-5 mt-5 flex gap-1 overflow-x-auto border-t border-border px-4">
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
