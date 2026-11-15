import { request } from "@/services/api.service";
import type { ActivitySession, ActivitySessionAnswerFeedback, ActivitySessionMode, ActivitySessionResult, ActivitySessionOptions, GuidedStepAnswerFeedback, SelectionStrategy } from "@/types/student/activity-session";

export const activitySessionService = {
  options: (activityId: number) => request<ActivitySessionOptions>(`/v1/activities/${activityId}/session-options`),
  start: (activityId: number, mode?: ActivitySessionMode, selectionStrategy?: SelectionStrategy) => request<ActivitySession>(`/v1/activities/${activityId}/sessions`, { method: "POST", body: JSON.stringify({ mode, selectionStrategy }) }),
  get: (sessionId: number) => request<ActivitySession>(`/v1/activity-sessions/${sessionId}`),
  answer: (sessionId: number, questionId: number, answer: string | string[]) => request<ActivitySessionAnswerFeedback>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/answer`, { method: "POST", body: JSON.stringify({ answer }) }),
  // Server confirms TIMEOUT only after deadline + network grace.
  timeout: (sessionId: number, questionId: number) => request<ActivitySession>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/timeout`, { method: "POST" }),
  hint: (sessionId: number, questionId: number) => request<{ session: ActivitySession; hint: string }>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/hint`, { method: "POST" }),
  answerGuidedStep: (sessionId: number, questionId: number, stepKey: string, requestId: string, answer: string) => request<GuidedStepAnswerFeedback>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/steps/${stepKey}/answer`, { method: "POST", body: JSON.stringify({ requestId, answer }) }),
  hintGuidedStep: (sessionId: number, questionId: number, stepKey: string) => request<{ session: ActivitySession; hint: string }>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/steps/${stepKey}/hint`, { method: "POST" }),
  finish: (sessionId: number) => request<ActivitySession>(`/v1/activity-sessions/${sessionId}/finish`, { method: "POST" }),
  result: (sessionId: number) => request<ActivitySessionResult>(`/v1/activity-sessions/${sessionId}/result`),
};
