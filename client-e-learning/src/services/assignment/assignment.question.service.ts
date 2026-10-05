import { request } from "@/services/api.service";
import type {
  AssignmentQuestion,
  BulkDeleteAssignmentQuestionsRequest,
  CreateAssignmentQuestionRequest,
  UpdateAssignmentQuestionRequest,
} from "@/types/assignment";

export const assignmentQuestionService = {
  list: (assignmentId: number) =>
    request<AssignmentQuestion[]>(
      `/v1/assignments/${assignmentId}/questions`,
    ),

  create: (
    assignmentId: number,
    payload: CreateAssignmentQuestionRequest[],
  ) =>
    request<AssignmentQuestion[]>(
      `/v1/assignments/${assignmentId}/questions`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  update: (
    assignmentId: number,
    questionId: number,
    payload: UpdateAssignmentQuestionRequest,
  ) =>
    request<AssignmentQuestion>(
      `/v1/assignments/${assignmentId}/questions/${questionId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  bulkDelete: (
    assignmentId: number,
    payload: BulkDeleteAssignmentQuestionsRequest,
  ) =>
    request<void>(
      `/v1/assignments/${assignmentId}/questions/bulk-delete`,
      {
        method: "DELETE",
        body: JSON.stringify(payload),
      },
    ),
};
