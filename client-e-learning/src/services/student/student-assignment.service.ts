import { request } from "@/services/api.service";
import type { StudentAssignmentItem, AssignmentFilter } from "../../components/features/student/assigment/types";

export const studentAssignmentService = {
  getAssignments: async (status: AssignmentFilter = "TODO"): Promise<StudentAssignmentItem[]> => {
    const params = new URLSearchParams({ status });
    const endpoint = `/v1/student/assignments?${params.toString()}`;
    const response = await request<StudentAssignmentItem[]>(endpoint);

    return response.data ?? [];
  },
};
