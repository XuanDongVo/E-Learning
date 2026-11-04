"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, UserPlus, Users } from "lucide-react";
import { teacherStudentService } from "@/services/teacher/student.service";
import { classService } from "@/services/class.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegionState } from "@/components/feedback";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";

export function ClassStudentsPanel({ classId }: { classId: number }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const membersQuery = useQuery({
    queryKey: ["class-members", classId],
    queryFn: async () =>
      (await teacherStudentService.listClassMembers(classId)).data ?? [],
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "for-class-add"],
    queryFn: async () =>
      (await teacherStudentService.list({ size: 100 })).data?.items ?? [],
  });

  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await classService.list()).data ?? [],
  });

  const className = classesQuery.data?.find((c) => c.id === classId)?.name;

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["class-members", classId] });
    void qc.invalidateQueries({ queryKey: ["class", classId] });
    void qc.invalidateQueries({ queryKey: ["students"] });
  };

  const add = useMutation({
    mutationFn: (studentId: number) =>
      teacherStudentService.addToClass(classId, { studentId }),
    onSuccess: refresh,
  });

  const transfer = useMutation({
    mutationFn: (studentId: number) =>
      teacherStudentService.transferToClass(classId, studentId),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (studentId: number) =>
      teacherStudentService.removeFromClass(classId, studentId),
    onSuccess: refresh,
  });

  const members = membersQuery.data ?? [];
  const memberIds = new Set(members.map((s) => s.id));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter(
      (s) =>
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    );
  }, [members, search]);

  const available = (studentsQuery.data ?? []).filter(
    (s) => !memberIds.has(s.id),
  );

  const handleEnrollmentChange = (studentId: number) => {
    const selected = available.find((s) => s.id === studentId);
    if (!selected) return;

    const activeClass = selected.classes?.find(
      (m) => m.status === "ACTIVE",
    );

    if (activeClass) {
      const ok = window.confirm(
        `Chuyển ${selected.fullName} từ "${activeClass.name}" sang "${className ?? "lớp này"}"?`,
      );
      if (ok) transfer.mutate(studentId);
      return;
    }

    add.mutate(studentId);
  };

  const pending = add.isPending || transfer.isPending || remove.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="h-10 bg-background pl-9 text-sm"
          />
        </div>

        <select
          aria-label="Thêm hoặc chuyển học sinh"
          value=""
          disabled={pending}
          onChange={(e) => {
            if (e.target.value) handleEnrollmentChange(Number(e.target.value));
            e.target.value = "";
          }}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:w-72"
        >
          <option value="">Thêm / chuyển học sinh vào lớp</option>
          {available.map((s) => {
            const active = s.classes?.find((m) => m.status === "ACTIVE");
            return (
              <option key={s.id} value={s.id}>
                {s.fullName}
                {active ? ` (từ ${active.name})` : ""}
              </option>
            );
          })}
        </select>
      </div>

      {(add.isError || transfer.isError || remove.isError) && (
        <p role="alert" className="text-sm text-destructive">
          Không thể cập nhật thành viên lớp. Thử lại.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {membersQuery.isLoading ? (
          <div className="p-4">
            <SkeletonList count={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto size-10 text-muted-foreground opacity-30" />
            <h3 className="mt-3 text-sm font-extrabold">Không có học sinh</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Thêm học sinh từ danh sách bên trên.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="p-3.5 pl-4">Học sinh</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Số điện thoại</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 pr-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => {
                  const initials = s.fullName
                    .split(" ")
                    .slice(-2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-muted/30">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                            {initials}
                          </span>
                          <div>
                            <p className="text-sm font-extrabold text-foreground">
                              {s.fullName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              ID: #{s.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-muted-foreground">
                        {s.email}
                      </td>
                      <td className="p-3.5 font-medium text-muted-foreground">
                        {s.phone || "—"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            s.accountStatus === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {s.accountStatus === "ACTIVE"
                            ? "Đang hoạt động"
                            : "Tạm khóa"}
                        </span>
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Xóa ${s.fullName} khỏi lớp?`,
                              )
                            ) {
                              remove.mutate(s.id);
                            }
                          }}
                          className="h-8 gap-1 text-xs font-semibold text-rose-600 hover:bg-rose-500/10"
                        >
                          <Trash2 className="size-3.5" />
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
