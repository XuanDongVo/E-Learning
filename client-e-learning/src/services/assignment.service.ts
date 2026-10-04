import { request, requestBlob } from "./api.service";
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

export async function downloadAssignmentQuestionTemplate(): Promise<void> {
  const blob = await requestBlob(
    "/v1/assignments/question-import-template",
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "assignment-question-template.xlsx";
  anchor.click();
  URL.revokeObjectURL(url);
}

export {
  assignmentQuestionService,
} from "./assignment/assignment.question.service";
