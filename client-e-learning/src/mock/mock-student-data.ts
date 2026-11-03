export type StudentStatus = "Đang học" | "Cần hỗ trợ" | "Tạm nghỉ";
export type AccountStatus = "Đang hoạt động" | "Chờ kích hoạt" | "Tạm khóa";
export type AttemptStatus = "Chưa làm" | "Đang làm" | "Đã nộp" | "Nộp muộn";
export type SessionMode = "Learning" | "Try Hard";
export type SessionStatus = "Hoàn thành" | "Hết mạng" | "Bỏ dở" | "Đang làm";

export const mockStudent = {
  id: "nguyen-minh-anh",
  name: "Nguyễn Minh Anh",
  initials: "MA",
  code: "HS-6A-012",
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
  accountStatus: "Đang hoạt động" as AccountStatus,
  status: "Đang học" as StudentStatus,
  notes: "Học tốt phần từ vựng, cần luyện thêm kỹ năng nghe.",
};

export const mockAssignments = [
  { assignmentId: "present-simple-6a", title: "Grammar check · Present Simple", due: "04/10, 21:00", status: "Đã nộp" as AttemptStatus, submittedAt: "03/10, 19:42", score: 8.5 },
  { assignmentId: "school-things-review-6a", title: "School things review", due: "28/09, 21:00", status: "Nộp muộn" as AttemptStatus, submittedAt: "29/09, 07:10", score: 7 },
  { assignmentId: "travel-vocabulary-7a", title: "Travel vocabulary", due: "05/10, 21:00", status: "Đang làm" as AttemptStatus },
  { assignmentId: "community-reading-8b", title: "Community reading", due: "09/10, 21:00", status: "Chưa làm" as AttemptStatus },
];

export const mockSessions = [
  { id: "s1", activity: "Phrasal verbs cơ bản", unit: "Unit 2 · My Home", mode: "Learning" as SessionMode, status: "Hoàn thành" as SessionStatus, firstCorrect: 8, total: 10, hints: 2, completedAt: "03/10, 20:15" },
  { id: "s2", activity: "Phrasal verbs cơ bản", unit: "Unit 2 · My Home", mode: "Try Hard" as SessionMode, status: "Hết mạng" as SessionStatus, firstCorrect: 5, total: 10, completedAt: "03/10, 20:40" },
  { id: "s3", activity: "Daily routines & time", unit: "Unit 1 · School", mode: "Learning" as SessionMode, status: "Hoàn thành" as SessionStatus, firstCorrect: 10, total: 10, hints: 0, completedAt: "28/09, 19:30" },
  { id: "s4", activity: "Family members vocabulary", unit: "Unit 1 · School", mode: "Learning" as SessionMode, status: "Bỏ dở" as SessionStatus, firstCorrect: 3, total: 10, hints: 1, completedAt: "25/09, 18:20" },
];
