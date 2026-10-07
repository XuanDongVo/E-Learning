import { request } from "@/services/api.service";
import type {
  AddClassMemberRequest,
  CreateStudentRequest,
  StudentDetail,
  StudentPageResponse,
  StudentProfile,
  StudentSummary,
  UpdateStudentProfileRequest,
  UpdateStudentStatusRequest,
} from "@/types/student";

export const studentService = {
  list: (params: {
    search?: string;
    accountStatus?: string;
    classId?: string;
    gradeId?: string;
    noClass?: boolean;
    page?: number;
    size?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.accountStatus) query.set("accountStatus", params.accountStatus);
    if (params.classId && params.classId !== "all") query.set("classId", params.classId);
    if (params.gradeId && params.gradeId !== "all") query.set("gradeId", params.gradeId);
    if (params.noClass) query.set("noClass", "true");
    query.set("page", String(params.page ?? 1));
    query.set("size", String(params.size ?? 8));
    return request<StudentPageResponse>(`/v1/users/students?${query.toString()}`);
  },
  get: (studentId: number) =>
    request<StudentDetail>("/v1/users/students/" + studentId),
  create: (payload: CreateStudentRequest) =>
    request<StudentDetail>("/v1/users/students", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStatus: (studentId: number, payload: UpdateStudentStatusRequest) =>
    request<void>("/v1/users/students/" + studentId + "/status", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  profile: () => request<StudentProfile>("/v1/student/profile"),
  updateProfile: (payload: UpdateStudentProfileRequest) =>
    request<StudentProfile>("/v1/student/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  listClassMembers: (classId: number) =>
    request<StudentSummary[]>("/v1/classes/" + classId + "/members"),
  addToClass: (classId: number, payload: AddClassMemberRequest) =>
    request<void>("/v1/classes/" + classId + "/members", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  removeFromClass: (classId: number, studentId: number) =>
    request<void>("/v1/classes/" + classId + "/members/" + studentId, {
      method: "DELETE",
    }),
};
