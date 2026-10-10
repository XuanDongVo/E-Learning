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
    queryFn: () => studentService.list(),
  });
  const classes = useQuery({
    queryKey: ["classes"],
    queryFn: classService.list,
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["class-members"] });
    void qc.invalidateQueries({ queryKey: ["students"] });
  };

  const add = useMutation({
    mutationFn: (studentId: number) =>
      studentService.addToClass(classId, { studentId }),
    onSuccess: refresh,
  });

  const transfer = useMutation({
    mutationFn: (studentId: number) =>
      studentService.transferToClass(classId, studentId),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (studentId: number) =>
      studentService.removeFromClass(classId, studentId),
    onSuccess: refresh,
  });

  const className = classes.data?.data?.find(
    (item) => item.id === classId,
  )?.name;
  const list = useMemo(() => {
    const query = search.toLowerCase();
    return (members.data?.data ?? []).filter(
      (student) =>
        student.fullName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [members.data, search]);

  const memberIds = new Set(
    (members.data?.data ?? []).map((student) => student.id),
  );
  const available = (students.data?.data?.items ?? []).filter(
    (student) => !memberIds.has(student.id),
  );

  const handleEnrollmentChange = (studentId: number) => {
    const selected = available.find((student) => student.id === studentId);
    if (!selected) return;

    const activeClass = selected.classes.find(
      (membership) => membership.status === "ACTIVE",
    );

    if (activeClass) {
      if (
        window.confirm(
          `Transfer ${selected.fullName} from ${activeClass.name} to ${className ?? "this class"}? The old membership will remain as history.`,
        )
      ) {
        transfer.mutate(studentId);
      }
      return;
    }

    add.mutate(studentId);
  };

  const pending = add.isPending || transfer.isPending;

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
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search students..."
          className="h-10 flex-1 rounded-md border border-border-color px-3"
        />
        <select
          aria-label="Add or transfer student"
          value=""
          disabled={pending}
          onChange={(event) => {
            if (event.target.value) {
              handleEnrollmentChange(Number(event.target.value));
            }
          }}
          className="h-10 rounded-md border border-border-color px-3 sm:w-72"
        >
          <option value="">Add or transfer student...</option>
          {available.map((student) => {
            const activeClass = student.classes.find(
              (membership) => membership.status === "ACTIVE",
            );
            return (
              <option key={student.id} value={student.id}>
                {student.fullName}
                {activeClass ? ` · Transfer from ${activeClass.name}` : ""}
              </option>
            );
          })}
        </select>
      </div>

      {(add.isError || transfer.isError || remove.isError) && (
        <p role="alert" className="text-body-sm text-red-600">
          The class membership could not be updated. Check the student&apos;s
          current class and try again.
        </p>
      )}

      <div className="overflow-hidden rounded-md border border-border-color bg-card-bg">
        <div className="divide-y divide-border-color">
          {members.isLoading ? (
            <p className="p-6 text-neutral-muted">Loading...</p>
          ) : list.length === 0 ? (
            <p className="p-6 text-neutral-muted">
              No active students in this class yet.
            </p>
          ) : (
            list.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-bold">{student.fullName}</p>
                  <p className="text-body-sm text-neutral-muted">
                    {student.email}
                    {student.phone ? " · " + student.phone : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove.mutate(student.id)}
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
