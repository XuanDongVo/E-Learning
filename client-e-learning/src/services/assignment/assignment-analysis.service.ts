import { request } from "@/services/api.service";
import type {
  AssignmentAnalysisOverview,
  AttemptReview,
  QuestionAnalysisList,
  StudentResultsPage,
  StudentResultsQuery,
} from "@/types/assignment-analysis";

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
 * Teacher Assignment Analysis API.
 * Always use response.data (ApiResponse wrap).
 */
export const assignmentAnalysisService = {
  async getOverview(assignmentId: number): Promise<AssignmentAnalysisOverview> {
    const res = await request<AssignmentAnalysisOverview>(
      `/v1/teacher/assignments/${assignmentId}/analytics/overview`,
    );
    return res.data as AssignmentAnalysisOverview;
  },

  async getStudents(
    assignmentId: number,
    query: StudentResultsQuery = {},
  ): Promise<StudentResultsPage> {
    const res = await request<StudentResultsPage>(
      `/v1/teacher/assignments/${assignmentId}/analytics/students${qs({
        page: query.page ?? 0,
        size: query.size ?? 20,
        lifecycleStatus: query.lifecycleStatus,
        deadlineState: query.deadlineState,
        classId: query.classId ?? undefined,
        search: query.search,
      })}`,
    );
    return res.data as StudentResultsPage;
  },

  async getQuestions(assignmentId: number): Promise<QuestionAnalysisList> {
    const res = await request<QuestionAnalysisList>(
      `/v1/teacher/assignments/${assignmentId}/analytics/questions`,
    );
    return res.data as QuestionAnalysisList;
  },

  async getAttemptReview(
    assignmentId: number,
    studentId: number,
  ): Promise<AttemptReview> {
    const res = await request<AttemptReview>(
      `/v1/teacher/assignments/${assignmentId}/students/${studentId}/attempt`,
    );
    return res.data as AttemptReview;
  },
};
