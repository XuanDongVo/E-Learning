import { StudentDetailView } from "@/components/features/teacher/students/student-detail-view";
export default async function TeacherStudentDetailPage({params}:{params:Promise<{studentId:string}>}){const {studentId}=await params;return <StudentDetailView studentId={Number(studentId)}/>;}
