export interface Grade {
  id: number;
  code: string;
  name: string;
  displayOrder: number;
}

export interface ClassResponse {
  id: number;
  name: string;
  grade: Grade;
  academicYear: string;
  studentCount: number;
  status: "ACTIVE" | "ARCHIVED";
}

export interface CreateClassRequest {
  name: string;
  gradeId: number;
  academicYear: string;
}

export type UpdateClassRequest = CreateClassRequest;

export interface StudentSummaryClass {
  id: number;
  name: string;
  gradeId: number;
  gradeName: string;
  academicYear: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface StudentGuardian {
  name: string;
  relation: string;
  phone: string;
}

export interface StudentSummary {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  classes: StudentSummaryClass[];
  primaryGuardian?: StudentGuardian | null;
  accountStatus: "ACTIVE" | "INACTIVE";
}

export interface ClassRankItem {
  studentId: number;
  fullName: string;
  email: string;
  xp: number;
  rank: number;
  change: "up" | "down" | "same";
  changeValue?: number;
}
