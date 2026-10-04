import { request, requestMultipart } from "@/services/api.service";
import type {
  AssignmentQuestion,
  AssignmentQuestionImportPreview,
  BulkDeleteAssignmentQuestionsRequest,
  CreateAssignmentQuestionRequest,
  ReorderAssignmentQuestionRequest,
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

  reorder: (
    assignmentId: number,
    payload: ReorderAssignmentQuestionRequest,
  ) =>
    request<AssignmentQuestion[]>(
      `/v1/assignments/${assignmentId}/questions/order`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  previewImport: (assignmentId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return requestMultipart<AssignmentQuestionImportPreview>(
      `/v1/assignments/${assignmentId}/questions/import/preview`,
      formData,
    );
  },
};
