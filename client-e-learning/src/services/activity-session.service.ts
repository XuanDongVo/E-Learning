import { request } from "@/services/api.service";
import type {
  ActivitySession,
  ActivitySessionAnswerFeedback,
  ActivitySessionMode,
  ActivitySessionResult,
  ActivitySessionOptions,
  SelectionStrategy,
} from "@/types/activity-session";

export const activitySessionService = {
  options: (activityId: number) =>
    request<ActivitySessionOptions>(
      `/v1/activities/${activityId}/session-options`,
    ),
  start: (
    activityId: number,
    mode?: ActivitySessionMode,
    selectionStrategy?: SelectionStrategy,
  ) =>
    request<ActivitySession>(`/v1/activities/${activityId}/sessions`, {
      method: "POST",
      body: JSON.stringify({ mode, selectionStrategy }),
    }),
  get: (sessionId: number) =>
    request<ActivitySession>(`/v1/activity-sessions/${sessionId}`),
  answer: (sessionId: number, questionId: number, answer: string | string[]) =>
    request<ActivitySessionAnswerFeedback>(
      `/v1/activity-sessions/${sessionId}/questions/${questionId}/answer`,
      { method: "POST", body: JSON.stringify({ answer }) },
    ),
  hint: (sessionId: number, questionId: number) =>
    request<{ session: ActivitySession; hint: string }>(
      `/v1/activity-sessions/${sessionId}/questions/${questionId}/hint`,
      { method: "POST" },
    ),
  finish: (sessionId: number) =>
    request<ActivitySession>(`/v1/activity-sessions/${sessionId}/finish`, {
      method: "POST",
    }),
  result: (sessionId: number) =>
    request<ActivitySessionResult>(
      `/v1/activity-sessions/${sessionId}/result`,
    ),
};
