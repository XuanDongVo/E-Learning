import { ClassResponse, Grade, StudentSummary, ClassRankItem } from "@/types/teacher/teacher-class";

export const mockGrades: Grade[] = [
  { id: 1, code: "G6", name: "Khối 6", displayOrder: 1 },
  { id: 2, code: "G7", name: "Khối 7", displayOrder: 2 },
  { id: 3, code: "G8", name: "Khối 8", displayOrder: 3 },
];

export const mockClasses: ClassResponse[] = [
  {
    id: 101,
    name: "Lớp 6A",
    grade: { id: 1, code: "G6", name: "Khối 6", displayOrder: 1 },
    academicYear: "2026-2027",
    studentCount: 34,
    status: "ACTIVE",
  },
  {
    id: 102,
    name: "Lớp 6C",
    grade: { id: 1, code: "G6", name: "Khối 6", displayOrder: 1 },
    academicYear: "2026-2027",
    studentCount: 32,
    status: "ACTIVE",
  },
  {
    id: 103,
    name: "Lớp 7A",
    grade: { id: 2, code: "G7", name: "Khối 7", displayOrder: 2 },
    academicYear: "2026-2027",
    studentCount: 32,
    status: "ACTIVE",
  },
  {
    id: 104,
    name: "Lớp 8B",
    grade: { id: 3, code: "G8", name: "Khối 8", displayOrder: 3 },
    academicYear: "2026-2027",
    studentCount: 30,
    status: "ACTIVE",
  },
  {
    id: 105,
    name: "Lớp 6B (2025)",
    grade: { id: 1, code: "G6", name: "Khối 6", displayOrder: 1 },
    academicYear: "2025-2026",
    studentCount: 28,
    status: "ARCHIVED",
  },
];

export const mockClassStudents: StudentSummary[] = [
  {
    id: 1,
    fullName: "Nguyễn Minh Anh",
    email: "minhanh@example.edu.vn",
    phone: "090 123 4567",
    accountStatus: "ACTIVE",
    classes: [
      { id: 101, name: "Lớp 6A", gradeId: 1, gradeName: "Khối 6", academicYear: "2026-2027", status: "ACTIVE" }
    ],
    primaryGuardian: { name: "Nguyễn Thanh Hà", relation: "Mẹ", phone: "098 111 2233" },
  },
  {
    id: 2,
    fullName: "Trần Gia Huy",
    email: "giahuy@example.edu.vn",
    phone: "091 234 5678",
    accountStatus: "ACTIVE",
    classes: [
      { id: 101, name: "Lớp 6A", gradeId: 1, gradeName: "Khối 6", academicYear: "2026-2027", status: "ACTIVE" }
    ],
  },
  {
    id: 3,
    fullName: "Vũ Khánh Linh",
    email: "khanhlinh@example.edu.vn",
    phone: "094 567 8901",
    accountStatus: "ACTIVE",
    classes: [
      { id: 101, name: "Lớp 6A", gradeId: 1, gradeName: "Khối 6", academicYear: "2026-2027", status: "ACTIVE" }
    ],
  },
  {
    id: 4,
    fullName: "Đỗ Quốc Bảo",
    email: "quocbao@example.edu.vn",
    phone: "093 888 9911",
    accountStatus: "INACTIVE",
    classes: [
      { id: 101, name: "Lớp 6A", gradeId: 1, gradeName: "Khối 6", academicYear: "2026-2027", status: "ACTIVE" }
    ],
  },
  {
    id: 5,
    fullName: "Phạm Thảo Vy",
    email: "thaovy@example.edu.vn",
    phone: "097 222 3344",
    accountStatus: "ACTIVE",
    classes: [
      { id: 101, name: "Lớp 6A", gradeId: 1, gradeName: "Khối 6", academicYear: "2026-2027", status: "ACTIVE" }
    ],
  },
];

export const mockRanking: Record<"all" | "month" | "week", ClassRankItem[]> = {
  all: [
    { studentId: 1, fullName: "Nguyễn Minh Anh", email: "minhanh@example.edu.vn", xp: 2450, rank: 1, change: "same" },
    { studentId: 2, fullName: "Trần Gia Huy", email: "giahuy@example.edu.vn", xp: 2180, rank: 2, change: "up", changeValue: 1 },
    { studentId: 3, fullName: "Vũ Khánh Linh", email: "khanhlinh@example.edu.vn", xp: 1950, rank: 3, change: "down", changeValue: 1 },
    { studentId: 5, fullName: "Phạm Thảo Vy", email: "thaovy@example.edu.vn", xp: 1720, rank: 4, change: "up", changeValue: 2 },
    { studentId: 4, fullName: "Đỗ Quốc Bảo", email: "quocbao@example.edu.vn", xp: 1200, rank: 5, change: "same" },
  ],
  month: [
    { studentId: 2, fullName: "Trần Gia Huy", email: "giahuy@example.edu.vn", xp: 920, rank: 1, change: "up", changeValue: 1 },
    { studentId: 1, fullName: "Nguyễn Minh Anh", email: "minhanh@example.edu.vn", xp: 880, rank: 2, change: "down", changeValue: 1 },
    { studentId: 5, fullName: "Phạm Thảo Vy", email: "thaovy@example.edu.vn", xp: 750, rank: 3, change: "up", changeValue: 1 },
    { studentId: 3, fullName: "Vũ Khánh Linh", email: "khanhlinh@example.edu.vn", xp: 690, rank: 4, change: "down", changeValue: 1 },
    { studentId: 4, fullName: "Đỗ Quốc Bảo", email: "quocbao@example.edu.vn", xp: 410, rank: 5, change: "same" },
  ],
  week: [
    { studentId: 1, fullName: "Nguyễn Minh Anh", email: "minhanh@example.edu.vn", xp: 350, rank: 1, change: "up", changeValue: 1 },
    { studentId: 2, fullName: "Trần Gia Huy", email: "giahuy@example.edu.vn", xp: 320, rank: 2, change: "same" },
    { studentId: 3, fullName: "Vũ Khánh Linh", email: "khanhlinh@example.edu.vn", xp: 280, rank: 3, change: "up", changeValue: 1 },
    { studentId: 5, fullName: "Phạm Thảo Vy", email: "thaovy@example.edu.vn", xp: 210, rank: 4, change: "down", changeValue: 1 },
    { studentId: 4, fullName: "Đỗ Quốc Bảo", email: "quocbao@example.edu.vn", xp: 120, rank: 5, change: "same" },
  ],
};
