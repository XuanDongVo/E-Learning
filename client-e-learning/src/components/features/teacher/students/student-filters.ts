import type { StudentSummary } from "@/types/student";
export function filterStudents(students: StudentSummary[], search: string, status: string) {
 const q=search.trim().toLowerCase();
 return students.filter(s=>(!q||s.fullName.toLowerCase().includes(q)||s.email.toLowerCase().includes(q))&&(status==="all"||s.classStatus===status));
}
