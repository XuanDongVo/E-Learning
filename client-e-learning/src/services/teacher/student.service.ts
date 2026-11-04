import { request } from "@/services/api.service";
import type { AddClassMemberRequest, CreateStudentRequest, StudentDetail, StudentPageResponse, StudentSummary, UpdateStudentProfileRequest, UpdateStudentStatusRequest } from "@/types/teacher/student";
import type { PageResult, StudentActivitySessionItem, StudentAssignmentItem } from "@/types/teacher/student-learning";

const BASE = "/v1/teacher/students";

export interface StudentLearningSummary {
  assigned: number;
  submitted: number;
  late: number;
  timedOut: number;
  notStarted: number;
  inProgress: number;
  sessionTotal: number;
}

export interface ResetPasswordResult {
  studentId: number;
  temporaryPassword: string;
}

export const teacherStudentService = {
  list: (params: { search?: string; accountStatus?: string; classId?: string; gradeId?: string; noClass?: boolean; page?: number; size?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.accountStatus) query.set("accountStatus", params.accountStatus);
    if (params.classId && params.classId !== "all") query.set("classId", params.classId);
    if (params.gradeId && params.gradeId !== "all") query.set("gradeId", params.gradeId);
    if (params.noClass) query.set("noClass", "true");
    query.set("page", String(params.page ?? 1));
    query.set("size", String(params.size ?? 8));
    return request<StudentPageResponse>(`${BASE}?${query.toString()}`);
  },
  get: (studentId: number) => request<StudentDetail>(`${BASE}/${studentId}`),
  learningSummary: (studentId: number) =>
    request<StudentLearningSummary>(`${BASE}/${studentId}/learning-summary`),
  listAssignments: (
    studentId: number,
    params: { status?: string; page?: number; size?: number } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "ALL") query.set("status", params.status);
    query.set("page", String(params.page ?? 1));
    query.set("size", String(params.size ?? 20));
    return request<PageResult<StudentAssignmentItem>>(`${BASE}/${studentId}/assignments?${query}`);
  },
  listActivitySessions: (
    studentId: number,
    params: { mode?: string; status?: string; page?: number; size?: number } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.mode && params.mode !== "all") query.set("mode", params.mode);
    if (params.status && params.status !== "all") query.set("status", params.status);
    query.set("page", String(params.page ?? 1));
    query.set("size", String(params.size ?? 20));
    return request<PageResult<StudentActivitySessionItem>>(
      `${BASE}/${studentId}/activity-sessions?${query}`,
    );
  },
  resetPassword: (studentId: number, newPassword?: string) =>
    request<ResetPasswordResult>(`${BASE}/${studentId}/reset-password`, {
      method: "POST",
      body: JSON.stringify(newPassword ? { newPassword } : {}),
    }),
  create: (payload: CreateStudentRequest) => request<StudentDetail>(BASE, { method: "POST", body: JSON.stringify(payload) }),
  updateStatus: (studentId: number, payload: UpdateStudentStatusRequest) =>
    request<void>(`${BASE}/${studentId}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  updateProfile: (studentId: number, payload: UpdateStudentProfileRequest) =>
    request<StudentDetail>(`${BASE}/${studentId}/profile`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  listClassMembers: (
    classId: number,
    params: { search?: string; page?: number; size?: number } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 1));
    query.set("size", String(params.size ?? 20));
    return request<StudentPageResponse>(`/v1/classes/${classId}/members?${query.toString()}`);
  },
  addToClass: (classId: number, payload: AddClassMemberRequest) =>
    request<void>(`/v1/classes/${classId}/members`, { method: "POST", body: JSON.stringify(payload) }),
  transferToClass: (classId: number, studentId: number) =>
    request<void>(`/v1/classes/${classId}/members/${studentId}/transfer`, { method: "POST" }),
  removeFromClass: (classId: number, studentId: number) =>
    request<void>(`/v1/classes/${classId}/members/${studentId}`, { method: "DELETE" }),
};
