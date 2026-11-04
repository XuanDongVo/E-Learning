"use client";

import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Pencil,
  Users,
} from "lucide-react";
import { classService } from "@/services/class.service";
import { teacherStudentService } from "@/services/teacher/student.service";
import { Button } from "@/components/ui/button";
import { RegionState } from "@/components/feedback";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClassOverviewView({ classId }: { classId: number }) {
  const classQuery = useQuery({
    queryKey: ["class", classId],
    queryFn: async () => (await classService.getById(classId)).data,
    enabled: Number.isFinite(classId) && classId > 0,
  });

  const membersQuery = useQuery({
    queryKey: ["class-members", classId],
    queryFn: async () =>
      (await teacherStudentService.listClassMembers(classId)).data ?? [],
    enabled: Number.isFinite(classId) && classId > 0,
  });

  const currentClass = classQuery.data;
  const members = membersQuery.data ?? [];
  const recentMembers = members.slice(0, 5);
  const isArchived = currentClass?.status !== "ACTIVE";

  if (classQuery.isLoading) {
    return <SkeletonList count={4} />;
  }

  if (classQuery.isError || !currentClass) {
    return (
      <RegionState
        variant="error"
        title="Không tải được thông tin lớp"
        description="Thử lại hoặc quay về danh sách lớp."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
      <div className="grid content-start gap-4">
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-extrabold text-foreground">
              Thông tin lớp
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Thông tin cơ bản của lớp học.
            </p>
          </div>

          <dl className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tên lớp
              </dt>
              <dd className="mt-1 text-sm font-extrabold text-foreground">
                {currentClass.name}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Khối
              </dt>
              <dd className="mt-1 text-sm font-extrabold text-foreground">
                {currentClass.grade.name} ({currentClass.grade.code})
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Năm học
              </dt>
              <dd className="mt-1 text-sm font-extrabold text-foreground">
                {currentClass.academicYear}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </dt>
              <dd className="mt-1 text-sm font-extrabold text-foreground">
                {isArchived ? "Đã lưu trữ" : "Đang hoạt động"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-extrabold text-foreground">
                Thành viên gần đây
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {members.length} học sinh trong lớp.
              </p>
            </div>
            <Link href={`/teacher/classes/${classId}/students`}>
              <Button size="sm" variant="outline" className="h-8 text-xs font-bold">
                Xem tất cả
              </Button>
            </Link>
          </div>

          {membersQuery.isLoading ? (
            <div className="p-4">
              <SkeletonList count={3} />
            </div>
          ) : recentMembers.length === 0 ? (
            <div className="p-6">
              <RegionState
                variant="empty"
                description="Chưa có học sinh trong lớp."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">
                    {getInitials(m.fullName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {m.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      m.accountStatus === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.accountStatus === "ACTIVE"
                      ? "Đang hoạt động"
                      : "Tạm khóa"}
                  </span>
                  <Link href={`/teacher/students/${m.id}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 shrink-0 gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Xem hồ sơ
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid content-start gap-4">
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-extrabold text-foreground">Sĩ số</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Học sinh đang tham gia lớp.
            </p>
          </div>
          <div className="flex items-center gap-4 p-5">
            <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">
                {currentClass.studentCount}
              </p>
              <p className="text-xs text-muted-foreground">học sinh đang tham gia</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-extrabold text-foreground">
              Thao tác nhanh
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Các việc thường làm với lớp này.
            </p>
          </div>
          <div className="grid gap-2 p-5">
            <Link href={`/teacher/classes/${classId}/students`} className="block">
              <Button className="h-12 w-full justify-start gap-2.5 text-xs font-bold">
                <Users className="size-4" />
                Danh sách học sinh
              </Button>
            </Link>
            <Link href={`/teacher/classes/${classId}/ranking`} className="block">
              <Button
                variant="outline"
                className="h-12 w-full justify-start gap-2.5 text-xs font-bold"
              >
                <BarChart3 className="size-4 text-muted-foreground" />
                Xếp hạng XP
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-2.5 text-xs font-bold"
              disabled
            >
              <Pencil className="size-4 text-muted-foreground" />
              Chỉnh sửa lớp
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-extrabold text-foreground">
              Trạng thái lớp
            </h2>
          </div>
          <div className="flex items-center gap-3 p-5">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-sky-500/10 text-sky-600">
              <CalendarDays className="size-4" />
            </div>
            <div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  isArchived
                    ? "bg-muted text-muted-foreground"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                {isArchived ? "Đã lưu trữ" : "Đang hoạt động"}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Lớp trong năm học {currentClass.academicYear}.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
