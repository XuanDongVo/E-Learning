import type { ApiResponse } from "@/types/auth";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type GuardianRelationship = "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER";

export interface StudentGuardian {
  id: number;
  relationship: GuardianRelationship;
  fullName: string;
  phone: string;
  email?: string | null;
  primary: boolean;
}
export interface StudentClass {
  id: number; name: string; gradeId: number; gradeName: string; academicYear: string; status: "ACTIVE" | "INACTIVE";
}
export interface StudentSummary {
  id: number; fullName: string; email: string; phone?: string | null; className?: string | null; classStatus?: string | null;
}
export interface StudentDetail {
  id: number; fullName: string; dateOfBirth?: string | null; gender?: Gender | null; email: string; phone?: string | null;
  guardians: StudentGuardian[]; classId?: number | null; className?: string | null; classStatus?: string | null; accountStatus: string;
}
export interface StudentProfile extends Omit<StudentDetail, "id" | "classId" | "className" | "classStatus"> {
  userId: number; currentClass?: StudentClass | null;
}
export interface StudentGuardianRequest {
  id?: number; relationship: GuardianRelationship; fullName: string; phone: string; email?: string; primary: boolean;
}
export interface CreateStudentRequest {
  email: string; password: string; fullName: string; dateOfBirth?: string; gender?: Gender; phone?: string; classId: number; guardians?: StudentGuardianRequest[];
}
export interface UpdateStudentProfileRequest {
  dateOfBirth?: string; gender?: Gender; phone?: string; fullName?: string; guardians?: StudentGuardianRequest[];
}
export interface AddClassMemberRequest { studentId: number; }
export type StudentApiResponse<T> = ApiResponse<T>;
