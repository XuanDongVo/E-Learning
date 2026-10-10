"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/services/class.service";
import { gradeService } from "@/services/grade.service";
import { teacherStudentService } from "@/services/teacher/student.service";
import { StudentsHeader } from "./students-header";
import { StudentsToolbar } from "./students-toolbar";
import { StudentTable } from "./student-table";
import { StudentForm } from "./student-form";
import { StudentDetailModal } from "./student-detail-modal";
import type { StudentSummary } from "@/types/teacher/student";

export function StudentsPageView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noClass, setNoClass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewingStudentId, setViewingStudentId] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const students = useQuery({
    queryKey: ["students", debouncedSearch, statusFilter, classFilter, gradeFilter, noClass, page, pageSize],
    queryFn: () => teacherStudentService.list({
      search: debouncedSearch || undefined,
      accountStatus: statusFilter === "all" ? undefined : statusFilter,
      classId: classFilter, gradeId: gradeFilter, noClass, page, size: pageSize,
    }),
  });
  const classes = useQuery({ queryKey: ["classes"], queryFn: classService.list });
  const grades = useQuery({ queryKey: ["grades"], queryFn: gradeService.list });
  const pageData = students.data?.data;
  const studentRows = pageData?.items ?? [];

  const clearFilters = () => { setSearch(""); setClassFilter("all"); setGradeFilter("all"); setStatusFilter("all"); setNoClass(false); setPage(1); };
  const toggle = (studentId: number) => setSelectedIds((current) => current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]);
  const toggleAll = () => { const ids = studentRows.map((student) => student.id); setSelectedIds((current) => ids.every((id) => current.includes(id)) ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])]); };
  const changeStatus = async (student: StudentSummary) => { const nextStatus = student.accountStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"; await teacherStudentService.updateStatus(student.id, { status: nextStatus }); await queryClient.invalidateQueries({ queryKey: ["students"] }); };

  if (creating) return <StudentForm onCancel={() => setCreating(false)} onSuccess={() => { setCreating(false); void queryClient.invalidateQueries({ queryKey: ["students"] }); }} />;

  return <div className="mx-auto max-w-7xl space-y-5"><StudentsHeader onCreate={() => setCreating(true)} /><StudentsToolbar search={search} classFilter={classFilter} gradeFilter={gradeFilter} statusFilter={statusFilter} noClass={noClass} classes={(classes.data?.data ?? []).filter((item) => item.status === "ACTIVE")} grades={grades.data?.data ?? []} onSearchChange={(value) => { setSearch(value); setPage(1); }} onClassChange={(value) => { setClassFilter(value); setPage(1); }} onGradeChange={(value) => { setGradeFilter(value); setPage(1); }} onStatusChange={(value) => { setStatusFilter(value); setPage(1); }} onNoClassChange={(value) => { setNoClass(value); setPage(1); }} onClear={clearFilters} /><StudentTable students={studentRows} isLoading={students.isLoading} page={page} totalElements={pageData?.totalElements ?? 0} totalPages={pageData?.totalPages ?? 1} pageSize={pageSize} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} onStatusChange={changeStatus} onView={(student) => setViewingStudentId(student.id)} onPageChange={setPage} onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setPage(1); }} />{viewingStudentId !== null && <StudentDetailModal studentId={viewingStudentId} onClose={() => setViewingStudentId(null)} />}</div>;
}
