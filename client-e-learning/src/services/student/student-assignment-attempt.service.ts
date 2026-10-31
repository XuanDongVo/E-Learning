import { request } from "@/services/api.service";
import type {
  AttemptIntroResponse,
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
 * Student Assignment Attempt HTTP contract.
 *
 * Persist activeSessionId in IndexedDB before startOrResume and every mutation.
 * The server never echoes the credential in AttemptRuntimeResponse.
 * No heartbeat or claim/takeover endpoint in the MVP.
 */
export const studentAssignmentAttemptService = {
  intro: (assignmentId: number) =>
    request<AttemptIntroResponse>(`/v1/student/assignments/${assignmentId}/assessment-attempt/intro`),

  startOrResume: (assignmentId: number, body: StartOrResumeAttemptRequest) =>
    request<AttemptRuntimeResponse>(`/v1/student/assignments/${assignmentId}/assessment-attempt`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  saveAnswer: (
    attemptId: number,
    attemptQuestionId: number,
    body: SaveAttemptAnswerRequest,
  ) =>
    request<SaveAttemptAnswerResponse>(
      `/v1/student/assessment-attempts/${attemptId}/questions/${attemptQuestionId}/answer`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    ),

  submit: (attemptId: number, body: SubmitAttemptRequest) =>
    request<AttemptResultResponse>(`/v1/student/assessment-attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  result: (attemptId: number) =>
    request<AttemptResultResponse>(`/v1/student/assessment-attempts/${attemptId}/result`),

  event: (attemptId: number, body: CreateAttemptEventRequest) =>
    request<AttemptSummaryResponse>(`/v1/student/assessment-attempts/${attemptId}/events`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export type StudentAssignmentAttemptService = typeof studentAssignmentAttemptService;
export type { AttemptRuntimeResponse };
