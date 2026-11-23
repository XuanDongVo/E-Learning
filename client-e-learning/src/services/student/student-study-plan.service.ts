import { request } from "@/services/api.service";
import type { StudentStudyTask, StudyTaskInput } from "@/types/student-study-plan";

const ROOT = "/v1/student/study-plan/tasks";

export const studentStudyPlanService = {
  list: () => request<StudentStudyTask[]>(ROOT),
  create: (input: StudyTaskInput) =>
    request<StudentStudyTask>(ROOT, { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: StudyTaskInput) =>
    request<StudentStudyTask>(ROOT + "/" + id, { method: "PUT", body: JSON.stringify(input) }),
  complete: (id: number, completed: boolean) =>
    request<StudentStudyTask>(ROOT + "/" + id + "/completion", {
      method: "PATCH", body: JSON.stringify({ completed }),
    }),
  delete: (id: number) => request<void>(ROOT + "/" + id, { method: "DELETE" }),
};
