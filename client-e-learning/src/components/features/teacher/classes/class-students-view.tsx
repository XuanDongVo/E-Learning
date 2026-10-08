"use client";
import type { ClassStudentsViewProps } from "@/types/student";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/services/class.service";
import { studentService } from "@/services/student.service";

export function ClassStudentsView({ classId }: ClassStudentsViewProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const members = useQuery({
    queryKey: ["class-members", classId],
    queryFn: () => studentService.listClassMembers(classId),
  });
  const students = useQuery({
    queryKey: ["students"],
    queryFn: studentService.list,
  });
  const add = useMutation({
    mutationFn: (studentId: number) =>
      studentService.addToClass(classId, { studentId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["class-members", classId] });
      void qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
  const remove = useMutation({
    mutationFn: (studentId: number) =>
      studentService.removeFromClass(classId, studentId),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["class-members", classId] }),
  });
  const className = useQuery({
    queryKey: ["classes"],
    queryFn: classService.list,
  }).data?.data?.find((c) => c.id === classId)?.name;
  const list = useMemo(() => {
    const q = search.toLowerCase();
    return (members.data?.data ?? []).filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    );
  }, [members.data, search]);
  const memberIds = new Set((members.data?.data ?? []).map((s) => s.id));
  const available = (students.data?.data ?? []).filter(
    (s) => !memberIds.has(s.id),
  );
  return (
    <div className="space-y-6">
      <div>
        <a
          href="/teacher/classes"
          className="text-body-sm font-bold text-primary"
        >
          ← Classes
        </a>
        <h1 className="mt-2 text-ui-3xl font-extrabold">
          {className || "Class"} students
        </h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Search class students"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="h-10 flex-1 rounded-md border border-border-color px-3"
        />
        <select
          aria-label="Add student"
          value=""
          onChange={(e) => {
            if (e.target.value) add.mutate(Number(e.target.value));
          }}
          className="h-10 sm:w-64 rounded-md border border-border-color px-3"
        >
          <option value="">Add student...</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-hidden rounded-md border border-border-color bg-card-bg">
        <div className="divide-y divide-border-color">
          {members.isLoading ? (
            <p className="p-6 text-neutral-muted">Loading...</p>
          ) : (
            list.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-bold">{s.fullName}</p>
                  <p className="text-body-sm text-neutral-muted">
                    {s.email}
                    {s.phone ? " · " + s.phone : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove.mutate(s.id)}
                  disabled={remove.isPending}
                  className="text-body-sm font-bold text-red-600"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
