import { request } from "@/services/api.service";
import type { StudentProfile, UpdateStudentProfileRequest } from "@/types/student/profile";
import type { StudentLearningOverview } from "@/types/student/profile";

export const studentProfileService = {
  get: () => request<StudentProfile>("/v1/student/profile"),
  learningOverview: () =>
    request<StudentLearningOverview>("/v1/student/profile/learning-overview"),
  updateAvatar: (avatarKey: string) =>
    request<StudentProfile>("/v1/student/profile/avatar", {
      method: "PATCH",
      body: JSON.stringify({ avatarKey }),
    }),
  update: (payload: UpdateStudentProfileRequest) => request<StudentProfile>("/v1/student/profile", { method: "PUT", body: JSON.stringify(payload) }),
};
