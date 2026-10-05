import { request } from "@/services/api.service";
import type { AddClassMemberRequest, CreateStudentRequest, StudentDetail, StudentProfile, StudentSummary, UpdateStudentProfileRequest } from "@/types/student";

export const studentService = {
  list: () => request<StudentSummary[]>("/v1/users/students"),
  get: (studentId: number) => request<StudentDetail>(`/v1/users/students/${studentId}`),
  create: (payload: CreateStudentRequest) => request<StudentDetail>("/v1/users/students", { method: "POST", body: JSON.stringify(payload) }),
  profile: () => request<StudentProfile>("/v1/student/profile"),
  updateProfile: (payload: UpdateStudentProfileRequest) => request<StudentProfile>("/v1/student/profile", { method: "PUT", body: JSON.stringify(payload) }),
  listClassMembers: (classId: number) => request<StudentSummary[]>(`/v1/classes/${classId}/members`),
  addToClass: (classId: number, payload: AddClassMemberRequest) => request<void>(`/v1/classes/${classId}/members`, { method: "POST", body: JSON.stringify(payload) }),
  removeFromClass: (classId: number, studentId: number) => request<void>(`/v1/classes/${classId}/members/${studentId}`, { method: "DELETE" }),
};
