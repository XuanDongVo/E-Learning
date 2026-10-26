import { request } from "@/services/api.service";
import type {
  AttemptResultResponse,
  AttemptRuntimeResponse,
  CreateAttemptEventRequest,
  SaveAttemptAnswerRequest,
  SaveAttemptAnswerResponse,
  StartOrResumeAttemptRequest,
  SubmitAttemptRequest,
  AttemptSummaryResponse,
} from "@/types/student/assignment-attempt";

/**
 * Sprint 1 HTTP contract.
 *
 * The client must persist activeSessionId in IndexedDB before calling startOrResume.
 * The server validates the credential and never echoes it in AttemptRuntimeResponse.
 * There is intentionally no heartbeat or claim/takeover endpoint in the MVP.
 */
export const studentAssignmentAttemptService = {
  startOrResume: (assignmentId: number, body: StartOrResumeAttemptRequest) =>
    request<AttemptRuntimeResponse>(`/v1/assignments/${assignmentId}/assessment-attempt`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  saveAnswer: (attemptId: number, body: SaveAttemptAnswerRequest) =>
    request<SaveAttemptAnswerResponse>(`/v1/assessment-attempts/${attemptId}/answers`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  submit: (attemptId: number, body: SubmitAttemptRequest) =>
    request<AttemptResultResponse>(`/v1/assessment-attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  result: (attemptId: number) =>
    request<AttemptResultResponse>(`/v1/assessment-attempts/${attemptId}/result`),

  event: (attemptId: number, body: CreateAttemptEventRequest) =>
    request<AttemptSummaryResponse>(`/v1/assessment-attempts/${attemptId}/events`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export type StudentAssignmentAttemptService = typeof studentAssignmentAttemptService;
export type { AttemptRuntimeResponse };
