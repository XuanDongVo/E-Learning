import { request } from "@/services/api.service";
import type { AttemptResultResponse, AttemptRuntimeResponse, CreateAttemptEventRequest, OpenAttemptResponse, SaveAttemptAnswerRequest, SaveAttemptAnswerResponse, AttemptSessionResponse, SubmitAttemptRequest, AttemptSummaryResponse } from "@/types/student/assignment-attempt";

/** Contract-only HTTP boundary. Runtime endpoints are not implemented in Sprint 0. */
export const studentAssignmentAttemptService = {
  open: (attemptId:number) => request<OpenAttemptResponse>(`/v1/assessment-attempts/${attemptId}`),
  start: (assignmentId:number) => request<OpenAttemptResponse>(`/v1/assignments/${assignmentId}/assessment-attempt`, {method:"POST"}),
  saveAnswer: (attemptId:number, body:SaveAttemptAnswerRequest) => request<SaveAttemptAnswerResponse>(`/v1/assessment-attempts/${attemptId}/answers`, {method:"PUT",body:JSON.stringify(body)}),
  heartbeat: (attemptId:number, activeSessionId:string) => request<AttemptSessionResponse>(`/v1/assessment-attempts/${attemptId}/heartbeat`, {method:"POST",body:JSON.stringify({activeSessionId})}),
  claimSession: (attemptId:number, activeSessionId:string) => request<AttemptSessionResponse>(`/v1/assessment-attempts/${attemptId}/session/claim`, {method:"POST",body:JSON.stringify({activeSessionId})}),
  submit: (attemptId:number, body:SubmitAttemptRequest) => request<AttemptResultResponse>(`/v1/assessment-attempts/${attemptId}/submit`, {method:"POST",body:JSON.stringify(body)}),
  result: (attemptId:number) => request<AttemptResultResponse>(`/v1/assessment-attempts/${attemptId}/result`),
  event: (attemptId:number, body:CreateAttemptEventRequest) => request<AttemptSummaryResponse>(`/v1/assessment-attempts/${attemptId}/events`, {method:"POST",body:JSON.stringify(body)})
};
export type StudentAssignmentAttemptService = typeof studentAssignmentAttemptService;
export type { AttemptRuntimeResponse };
