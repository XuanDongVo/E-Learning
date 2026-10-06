import { request } from "./api.service";
import type {
  Assignment,
  CreateAssignmentRequest,
} from "@/types/assignment";

export async function listAssignments() {
  return request<Assignment[]>("/v1/assignments");
}

export async function createAssignment(payload: CreateAssignmentRequest) {
  return request<Assignment>("/v1/assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAssignment(id: number) {
  return request<Assignment>(`/v1/assignments/${id}`);
}

export async function updateAssignment(id: number, payload: CreateAssignmentRequest) {
  return request<Assignment>(`/v1/assignments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAssignmentStatus(id: number, status: string) {
  return request<Assignment>(`/v1/assignments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export {
  assignmentQuestionService,
} from "./assignment/assignment.question.service";
