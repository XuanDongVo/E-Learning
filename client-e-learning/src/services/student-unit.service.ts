import type { StudentUnitDetail, StudentUnitSummary } from "@/types/student-unit";
import { MOCK_UNITS, MOCK_UNIT_CONTENT } from "../mock/student-unit.mock";

/**
 * TODO(backend): thay bằng API thật khi có (cả hai chưa tồn tại, student chưa gọi được /v1/content/**):
 *   GET /v1/student/units        → StudentUnitSummary[]
 *   GET /v1/student/units/{id}   → StudentUnitDetail
 * Hai hàm dưới đây đang trả dữ liệu mock để dựng UI.
 */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchStudentUnits(): Promise<StudentUnitSummary[]> {
  await delay();
  return MOCK_UNITS;
}

export async function fetchStudentUnit(id: number): Promise<StudentUnitDetail> {
  await delay();
  const unit = MOCK_UNITS.find((u) => u.id === id);
  if (!unit) throw new Error("Unit not found.");
  return { ...unit, ...MOCK_UNIT_CONTENT };
}
