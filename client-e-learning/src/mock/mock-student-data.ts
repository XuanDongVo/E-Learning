/** Domain-aligned labels for teacher student hub (mock until aggregate APIs exist). */

export type AccountStatusLabel = "Tài khoản hoạt động" | "Tài khoản đã khóa";
/** Assignment attempt lifecycle — matches AssessmentAttempt + late flag */
export type AttemptStatus = "Chưa làm" | "Đang làm" | "Đã nộp" | "Nộp muộn" | "Hết giờ";
export type SessionMode = "Learning" | "Try Hard";
/** ActivitySessionStatus display */
export type SessionStatus = "Hoàn thành" | "Hết mạng sống" | "Bỏ dở" | "Đang làm";

/** @deprecated Prefer live StudentDetail from API for identity */
export const mockStudent = {
  id: 1,
  name: "Nguyễn Minh Anh",
  initials: "MA",
  className: "Lớp 6A",
  grade: "Khối 6",
  email: "minhanh@example.edu.vn",
  phone: "090 123 4567",
  parent: "Nguyễn Thanh Hà",
  relation: "Mẹ",
  parentPhone: "098 111 2233",
  dob: "12/03/2014",
  gender: "Nữ",
  joinedAt: "05/09/2026",
  accountStatus: "Tài khoản hoạt động" as AccountStatusLabel,
  membershipStatus: "ACTIVE",
};

export const mockAssignments = [
  { assignmentId: "1", title: "Grammar check · Present Simple", due: "04/10, 21:00", status: "Đã nộp" as AttemptStatus, submittedAt: "03/10, 19:42", score: "85%" },
  { assignmentId: "2", title: "School things review", due: "28/09, 21:00", status: "Nộp muộn" as AttemptStatus, submittedAt: "29/09, 07:10", score: "70%" },
  { assignmentId: "3", title: "Travel vocabulary", due: "05/10, 21:00", status: "Đang làm" as AttemptStatus },
  { assignmentId: "4", title: "Community reading", due: "09/10, 21:00", status: "Chưa làm" as AttemptStatus },
  { assignmentId: "5", title: "Listening · Daily routines", due: "01/10, 21:00", status: "Hết giờ" as AttemptStatus, submittedAt: "01/10, 21:00", score: "60%" },
];

export const mockSessions = [
  { id: "s1", activity: "Phrasal verbs cơ bản", unit: "Unit 2 · My Home", mode: "Learning" as SessionMode, status: "Hoàn thành" as SessionStatus, firstCorrect: 8, total: 10, hints: 2, completedAt: "03/10, 20:15" },
  { id: "s2", activity: "Phrasal verbs cơ bản", unit: "Unit 2 · My Home", mode: "Try Hard" as SessionMode, status: "Hết mạng sống" as SessionStatus, firstCorrect: 5, total: 10, completedAt: "03/10, 20:40" },
  { id: "s3", activity: "Đồ vật trong nhà", unit: "Unit 2 · My Home", mode: "Learning" as SessionMode, status: "Bỏ dở" as SessionStatus, firstCorrect: 0, total: 10, completedAt: "—" },
  { id: "s4", activity: "Từ vựng trường học", unit: "Unit 1 · My School", mode: "Try Hard" as SessionMode, status: "Hoàn thành" as SessionStatus, firstCorrect: 11, total: 12, completedAt: "27/09, 18:05" },
];

export function accountStatusLabel(status?: string | null): AccountStatusLabel {
  return status === "INACTIVE" || status === "Tài khoản đã khóa" ? "Tài khoản đã khóa" : "Tài khoản hoạt động";
}

export function membershipLabel(status?: string | null, className?: string | null): string {
  if (!className) return "Chưa có lớp";
  return status === "ACTIVE" ? "Đang trong lớp" : "Đã rời lớp";
}

export function genderLabel(g?: string | null): string {
  if (g === "MALE" || g === "Nam") return "Nam";
  if (g === "FEMALE" || g === "Nữ") return "Nữ";
  if (g === "OTHER" || g === "Khác") return "Khác";
  return "—";
}

export function relationshipLabel(r?: string | null): string {
  const map: Record<string, string> = {
    MOTHER: "Mẹ", FATHER: "Bố", GUARDIAN: "Người giám hộ", OTHER: "Khác",
    Mẹ: "Mẹ", Bố: "Bố",
  };
  return r ? map[r] ?? r : "—";
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = value.length > 10 ? value.slice(0, 10) : value;
  const [y, m, day] = d.split("-");
  if (y && m && day) return `${day}/${m}/${y}`;
  return value;
}
