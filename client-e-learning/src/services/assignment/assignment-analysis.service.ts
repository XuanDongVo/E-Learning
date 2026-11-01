import { request } from "@/services/api.service";
import type {
  AssignmentAnalysisOverview,
  AttemptReview,
  PageResponse,
  QuestionAnalysisList,
  StudentResultRow,
  StudentResultsQuery,
} from "@/types/assignment-analysis";

/**
 * Toggle: UI currently uses local mock in analysis/mock-data.ts.
 * Set to false and wire panels back to these methods when backend matches product mock.
 */
export const ANALYSIS_USE_MOCK = true;

function qs(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === "ALL") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/**
 * Real API client — kept for later. Analysis page does not call these while ANALYSIS_USE_MOCK=true.
 * Always use response.data (ApiResponse wrap).
 */
export const assignmentAnalysisService = {
  async getOverview(assignmentId: number): Promise<AssignmentAnalysisOverview> {
    // if (ANALYSIS_USE_MOCK) throw new Error("Use mock-data while ANALYSIS_USE_MOCK=true");
    const res = await request<AssignmentAnalysisOverview>(
      `/v1/teacher/assignments/${assignmentId}/analytics/overview`,
    );
    return res.data as AssignmentAnalysisOverview;
  },

  async getStudents(
    assignmentId: number,
    query: StudentResultsQuery = {},
  ): Promise<PageResponse<StudentResultRow>> {
    const res = await request<PageResponse<StudentResultRow>>(
      `/v1/teacher/assignments/${assignmentId}/analytics/students${qs({
        page: query.page ?? 1,
        size: query.size ?? 20,
        lifecycleStatus: query.lifecycleStatus,
        deadlineState: query.deadlineState,
        classId: query.classId ?? undefined,
        search: query.search,
      })}`,
    );
    return res.data as PageResponse<StudentResultRow>;
  },

  async getQuestions(assignmentId: number): Promise<QuestionAnalysisList> {
    const res = await request<QuestionAnalysisList>(
      `/v1/teacher/assignments/${assignmentId}/analytics/questions`,
    );
    return res.data as QuestionAnalysisList;
  },

  async getAttemptReview(assignmentId: number, studentId: number): Promise<AttemptReview> {
    const res = await request<AttemptReview>(
      `/v1/teacher/assignments/${assignmentId}/students/${studentId}/attempt`,
    );
    return res.data as AttemptReview;
  },
};
