import type { ApiResponse } from "@/types/auth";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type GuardianRelationship = "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER";
export type StudentAccountStatus = "ACTIVE" | "INACTIVE";

export interface StudentGuardian {
  id: number;
  relationship: GuardianRelationship;
  fullName: string;
  phone: string;
  email?: string | null;
  primary: boolean;
}
export interface StudentClass {
  id: number;
  name: string;
  gradeId: number;
  gradeName: string;
  academicYear: string;
  status: "ACTIVE" | "INACTIVE";
}
export interface StudentSummaryClass {
  id: number;
  name: string;
  gradeId: number;
  gradeName: string;
  academicYear: string;
  status: "ACTIVE" | "INACTIVE";
}
export interface StudentSummary {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  classes: StudentSummaryClass[];
  primaryGuardian?: StudentGuardian | null;
  accountStatus: StudentAccountStatus;
}
export interface StudentDetail {
  id: number;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  email: string;
  phone?: string | null;
  guardians: StudentGuardian[];
  classId?: number | null;
  className?: string | null;
  classStatus?: string | null;
  accountStatus: StudentAccountStatus;
}
export interface StudentProfile extends Omit<StudentDetail, "id" | "classId" | "className" | "classStatus"> {
  userId: number;
  currentClass?: StudentClass | null;
}
export interface StudentGuardianRequest {
  id?: number;
  relationship: GuardianRelationship;
  fullName: string;
  phone: string;
  email?: string;
  primary: boolean;
}
export interface CreateStudentRequest {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  classId: number;
  guardians?: StudentGuardianRequest[];
}
export interface UpdateStudentProfileRequest {
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  fullName?: string;
  guardians?: StudentGuardianRequest[];
}
export interface UpdateStudentStatusRequest { status: StudentAccountStatus; }
export interface AddClassMemberRequest { studentId: number; }
export type StudentApiResponse<T> = ApiResponse<T>;

export interface StudentsHeaderProps { onCreate: () => void; }
export interface StudentsToolbarProps {
  search: string;
  classFilter: string;
  gradeFilter: string;
  statusFilter: string;
  noClass: boolean;
  classes: { id: number; name: string; grade: { id: number; name: string } }[];
  grades: { id: number; name: string }[];
  onSearchChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onNoClassChange: (value: boolean) => void;
  onClear: () => void;
}
export interface StudentTableProps {
  students: StudentSummary[];
  isLoading: boolean;
  selectedIds: number[];
  onToggle: (studentId: number) => void;
  onToggleAll: () => void;
  onStatusChange: (student: StudentSummary) => void;
}
export interface StudentFormProps { onSuccess: () => void; onCancel: () => void; }
export interface StudentDetailViewProps { studentId: number; }
export interface StudentProfileFormProps {}
export interface ClassStudentsViewProps { classId: number; }
