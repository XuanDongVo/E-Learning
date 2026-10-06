"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/services/class.service";
import { gradeService } from "@/services/grade.service";
import { studentService } from "@/services/student.service";
import { StudentsHeader } from "./students-header";
import { StudentsToolbar } from "./students-toolbar";
import { StudentTable } from "./student-table";
import { StudentForm } from "./student-form";
import { filterStudents } from "./student-filters";
import type { StudentSummary } from "@/types/student";

export function StudentsPageView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noClass, setNoClass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const students = useQuery({ queryKey: ["students"], queryFn: studentService.list });
  const classes = useQuery({ queryKey: ["classes"], queryFn: classService.list });
  const grades = useQuery({ queryKey: ["grades"], queryFn: gradeService.list });

  const list = students.data?.data ?? [];
  const filtered = useMemo(
    () => filterStudents(list, search, statusFilter, classFilter, gradeFilter, noClass),
    [list, search, statusFilter, classFilter, gradeFilter, noClass],
  );

  const clearFilters = () => {
    setSearch("");
    setClassFilter("all");
    setGradeFilter("all");
    setStatusFilter("all");
    setNoClass(false);
  };

  const toggle = (studentId: number) => setSelectedIds((current) =>
    current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]
  );

  const toggleAll = () => {
    const ids = filtered.map((student) => student.id);
    setSelectedIds((current) => ids.every((id) => current.includes(id))
      ? current.filter((id) => !ids.includes(id))
      : [...new Set([...current, ...ids])]);
  };

  const changeStatus = async (student: StudentSummary) => {
    const nextStatus = student.accountStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await studentService.updateStatus(student.id, { status: nextStatus });
    await queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  if (creating) {
    return <StudentForm onCancel={() => setCreating(false)} onSuccess={() => { setCreating(false); void queryClient.invalidateQueries({ queryKey: ["students"] }); }} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <StudentsHeader onCreate={() => setCreating(true)} />
      <StudentsToolbar search={search} classFilter={classFilter} gradeFilter={gradeFilter} statusFilter={statusFilter} noClass={noClass}
        classes={(classes.data?.data ?? []).filter((item) => item.status === "ACTIVE")} grades={grades.data?.data ?? []}
        onSearchChange={setSearch} onClassChange={setClassFilter} onGradeChange={setGradeFilter} onStatusChange={setStatusFilter}
        onNoClassChange={setNoClass} onClear={clearFilters} />
      <div className="text-body-sm text-neutral-muted">Showing {filtered.length} of {list.length} students</div>
      <StudentTable students={filtered} isLoading={students.isLoading} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} onStatusChange={changeStatus} />
    </div>
  );
}
