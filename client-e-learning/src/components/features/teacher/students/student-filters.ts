import type { StudentSummary } from "@/types/student";

export function filterStudents(
  students: StudentSummary[],
  search: string,
  status: string,
  classFilter = "all",
  gradeFilter = "all",
  noClass = false,
) {
  const query = search.trim().toLowerCase();
  return students.filter((student) => {
    const matchesSearch = !query ||
      student.fullName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      (student.phone ?? "").toLowerCase().includes(query);
    const matchesStatus = status === "all" || student.accountStatus === status;
    const activeClasses = student.classes.filter((item) => item.status === "ACTIVE");
    const matchesClass = classFilter === "all" || activeClasses.some((item) => String(item.id) === classFilter);
    const matchesGrade = gradeFilter === "all" || activeClasses.some((item) => String(item.gradeId) === gradeFilter);
    const matchesNoClass = !noClass || activeClasses.length === 0;
    return matchesSearch && matchesStatus && matchesClass && matchesGrade && matchesNoClass;
  });
}
