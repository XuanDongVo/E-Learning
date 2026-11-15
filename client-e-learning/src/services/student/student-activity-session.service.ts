import { request } from "@/services/api.service";
import type { ActivityHistoryPeriod, ActivitySession, ActivitySessionAnswerFeedback, ActivitySessionHistoryPage, ActivitySessionMode, ActivitySessionResult, ActivitySessionOptions, ActivitySessionReview, ActivitySessionStatus, GuidedStepAnswerFeedback, SelectionStrategy } from "@/types/student/activity-session";

export type ActivitySessionHistoryFilters = {
  page?: number;
  size?: number;
  period?: ActivityHistoryPeriod;
  mode?: ActivitySessionMode;
  status?: Exclude<ActivitySessionStatus, "IN_PROGRESS">;
};

function historyQuery(filters: ActivitySessionHistoryFilters) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    size: String(filters.size ?? 10),
    period: filters.period ?? "ALL",
  });
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.status) params.set("status", filters.status);
  return params.toString();
}

export const activitySessionService = {
  history: (activityId: number, filters: ActivitySessionHistoryFilters = {}) =>
    request<ActivitySessionHistoryPage>(
      `/v1/activities/${activityId}/sessions?${historyQuery(filters)}`,
    ),
  options: (activityId: number) => request<ActivitySessionOptions>(`/v1/activities/${activityId}/session-options`),
  start: (activityId: number, mode?: ActivitySessionMode, selectionStrategy?: SelectionStrategy) => request<ActivitySession>(`/v1/activities/${activityId}/sessions`, { method: "POST", body: JSON.stringify({ mode, selectionStrategy }) }),
  get: (sessionId: number) => request<ActivitySession>(`/v1/activity-sessions/${sessionId}`),
  answer: (sessionId: number, questionId: number, requestId: string, answer: string | string[]) => request<ActivitySessionAnswerFeedback>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/answer`, { method: "POST", body: JSON.stringify({ requestId, answer }) }),
  // Server confirms TIMEOUT only after deadline + network grace.
  timeout: (sessionId: number, questionId: number) => request<ActivitySession>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/timeout`, { method: "POST" }),
  hint: (sessionId: number, questionId: number) => request<{ session: ActivitySession; hint: string }>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/hint`, { method: "POST" }),
  answerGuidedStep: (sessionId: number, questionId: number, stepKey: string, requestId: string, answer: string) => request<GuidedStepAnswerFeedback>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/steps/${stepKey}/answer`, { method: "POST", body: JSON.stringify({ requestId, answer }) }),
  hintGuidedStep: (sessionId: number, questionId: number, stepKey: string) => request<{ session: ActivitySession; hint: string }>(`/v1/activity-sessions/${sessionId}/questions/${questionId}/steps/${stepKey}/hint`, { method: "POST" }),
  finish: (sessionId: number) => request<ActivitySession>(`/v1/activity-sessions/${sessionId}/finish`, { method: "POST" }),
  result: (sessionId: number) => request<ActivitySessionResult>(`/v1/activity-sessions/${sessionId}/result`),
  review: (sessionId: number) => request<ActivitySessionReview>(`/v1/activity-sessions/${sessionId}/review`),
};
