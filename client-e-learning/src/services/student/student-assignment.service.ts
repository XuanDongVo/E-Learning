import { request } from "@/services/api.service";
import type { StudentAssignmentItem } from "../../components/features/student/assigment/types";

export interface StudentAssignmentListResponse {
  items: StudentAssignmentItem[];
  total: number;
}

export const studentAssignmentService = {
  getAssignments: async (status?: string, query?: string) => {
    const params = new URLSearchParams();
    if (status ) params.set("status", status);
    if (query) params.set("q", query);

    const queryString = params.toString();
    const endpoint = `/v1/student/assignments${queryString ? `?${queryString}` : ""}`;
    return request<StudentAssignmentListResponse | StudentAssignmentItem[]>(endpoint);
  },

};

