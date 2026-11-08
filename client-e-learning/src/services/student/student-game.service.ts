import { request } from "@/services/api.service";
import type {
  GameGrade,
  GameUnitSummary,
  StartGameSessionRequest,
  StartGameSessionResponse,
  FinishGameSessionRequest,
  FinishGameSessionResponse,
} from "@/types/vocabulary-game";

export const studentGameService = {
  getGrades: () => request<GameGrade[]>("/v1/student/game/grades"),
  getUnitsByGrade: (gradeId: number) =>
    request<GameUnitSummary[]>(`/v1/student/game/units?gradeId=${gradeId}`),
  startSession: (data: StartGameSessionRequest) =>
    request<StartGameSessionResponse>("/v1/student/game/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  finishSession: (sessionId: number, data: FinishGameSessionRequest) =>
    request<FinishGameSessionResponse>(`/v1/student/game/sessions/${sessionId}/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};

