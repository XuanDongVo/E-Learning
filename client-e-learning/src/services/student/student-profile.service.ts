import { request } from "@/services/api.service";
import type { StudentProfile, UpdateStudentProfileRequest } from "@/types/student/profile";

export const studentProfileService = {
  get: () => request<StudentProfile>("/v1/student/profile"),
  update: (payload: UpdateStudentProfileRequest) => request<StudentProfile>("/v1/student/profile", { method: "PUT", body: JSON.stringify(payload) }),
};
