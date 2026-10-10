import type { StudentUnitDetail, StudentUnitSummary } from "@/types/student-unit";
import { request } from "@/services/api.service";

export const studentUnitService = {
  list: () => request<StudentUnitSummary[]>("/v1/student/units"),
  getUnitDetail: (unitId: number) => request<StudentUnitDetail>(`/v1/student/units/${unitId}`),
};
