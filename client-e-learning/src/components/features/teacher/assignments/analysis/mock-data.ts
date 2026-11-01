/** UI mock — aligned with product screenshots. Swap to API later. */

export type MockOutcome = {
  correct: number;
  partial: number;
  incorrect: number;
  blank: number;
};

export type MockQuestion = {
  position: number;
  prompt: string;
  typeLabel: string;
  sectionTitle: string;
  accuracyPercent: number;
  blankPercent: number;
  outcome: MockOutcome;
  n: number;
  difficulty: "HARD" | "EASY" | null;
};

export type MockSection = {
  title: string;
  questionCount: number;
  outcome: MockOutcome;
  accuracyPercent: number;
  scoreRatePercent: number;
  blankPercent: number;
  n: number;
};

export type MockStudent = {
  studentId: number;
  name: string;
  className: string;
  classNote: string | null;
  status: "SUBMITTED" | "LATE" | "TIMED_OUT" | "IN_PROGRESS" | "NOT_STARTED" | "OVERDUE";
  earned: number | null;
  possible: number | null;
  percent: number | null;
  deltaVsAvg: number | null;
  durationMinutes: number | null;
  blankCount: number | null;
};

export type MockReviewQuestion = {
  position: number;
  prompt: string;
  outcome: "CORRECT" | "PARTIAL" | "INCORRECT" | "UNANSWERED";
  earnedLabel: string;
  studentAnswer: string;
  correctAnswer: string;
};

export const MOCK_ASSIGNMENT = {
  id: 1,
  title: "Demo · All question types & shared content",
  dueAtLabel: "21:00 22-10",
  timeLimitMinutes: 40,
  assigned: 24,
};

export const MOCK_OVERVIEW = {
  submissionRate: 0.88,
  submittedCount: 21,
  assignedCount: 24,
  averagePercent: 63,
  medianPercent: 61,
  lowestPercent: 24,
  highestPercent: 92,
  avgDurationMinutes: 30,
  timeLimitMinutes: 40,
  progress: {
    submitted: 17,
    late: 2,
    timedOut: 2,
    inProgress: 1,
    notStarted: 0,
    overdue: 2,
  },
  distribution: [
    { from: 0, to: 10, count: 0 },
    { from: 10, to: 20, count: 0 },
    { from: 20, to: 30, count: 1 },
    { from: 30, to: 40, count: 1 },
    { from: 40, to: 50, count: 2 },
    { from: 50, to: 60, count: 6 },
    { from: 60, to: 70, count: 2 },
    { from: 70, to: 80, count: 6 },
    { from: 80, to: 90, count: 2 },
    { from: 90, to: 100, count: 1 },
  ],
  hardQuestions: [
    { position: 9, prompt: "My brother (1)___ (get) up at six. He (2)___ (have) breakfast and (3)___ (go) to school.", accuracy: 10 },
    { position: 2, prompt: "cat · hat · map · name", accuracy: 19 },
    { position: 10, prompt: "Write two sentences about your best friend.", accuracy: 19 },
    { position: 21, prompt: "Chỗ trống (2) trong “My Weekend”: go · goes · going · went", accuracy: 19 },
    { position: 8, prompt: "Nam likes English best.", accuracy: 29 },
  ],
  easyQuestions: [
    { position: 3, prompt: "Ha Noi is the capital city of Viet Nam.", accuracy: 100 },
    { position: 4, prompt: "There are eight days in a week.", accuracy: 100 },
    { position: 7, prompt: "Look! The children (1)___ football in the yard.", accuracy: 90 },
  ],
};

export const MOCK_QUESTIONS: MockQuestion[] = [
  { position: 1, prompt: "We have Maths (1)___ Monday and Friday.", typeLabel: "Single choice", sectionTitle: "1. Single choice & True / False", accuracyPercent: 67, blankPercent: 5, n: 21, difficulty: null, outcome: { correct: 67, partial: 0, incorrect: 28, blank: 5 } },
  { position: 2, prompt: "cat · hat · map · name", typeLabel: "Single choice", sectionTitle: "1. Single choice & True / False", accuracyPercent: 19, blankPercent: 5, n: 21, difficulty: "HARD", outcome: { correct: 19, partial: 0, incorrect: 76, blank: 5 } },
  { position: 3, prompt: "Ha Noi is the capital city of Viet Nam.", typeLabel: "Single choice", sectionTitle: "1. Single choice & True / False", accuracyPercent: 100, blankPercent: 0, n: 21, difficulty: "EASY", outcome: { correct: 100, partial: 0, incorrect: 0, blank: 0 } },
  { position: 4, prompt: "There are eight days in a week.", typeLabel: "Single choice", sectionTitle: "1. Single choice & True / False", accuracyPercent: 100, blankPercent: 0, n: 21, difficulty: "EASY", outcome: { correct: 100, partial: 0, incorrect: 0, blank: 0 } },
  { position: 5, prompt: "Which of these are school subjects?", typeLabel: "Multiple choice", sectionTitle: "2. Multiple choice – choose all correct answers", accuracyPercent: 52, blankPercent: 0, n: 21, difficulty: null, outcome: { correct: 52, partial: 30, incorrect: 18, blank: 0 } },
  { position: 6, prompt: "Which things can you usually find in a classroom?", typeLabel: "Multiple choice", sectionTitle: "2. Multiple choice – choose all correct answers", accuracyPercent: 76, blankPercent: 0, n: 21, difficulty: null, outcome: { correct: 76, partial: 18, incorrect: 6, blank: 0 } },
  { position: 7, prompt: "Look! The children (1)___ football in the yard.", typeLabel: "Text input", sectionTitle: "3. Text input & multiple blanks", accuracyPercent: 90, blankPercent: 0, n: 21, difficulty: "EASY", outcome: { correct: 90, partial: 0, incorrect: 10, blank: 0 } },
  { position: 8, prompt: "Nam likes English best.", typeLabel: "Text input", sectionTitle: "3. Text input & multiple blanks", accuracyPercent: 29, blankPercent: 5, n: 21, difficulty: "HARD", outcome: { correct: 29, partial: 0, incorrect: 66, blank: 5 } },
  { position: 9, prompt: "My brother (1)___ (get) up at six. He (2)___ (have) breakfast and (3)___ (go) to school.", typeLabel: "Multiple blanks", sectionTitle: "3. Text input & multiple blanks", accuracyPercent: 10, blankPercent: 0, n: 21, difficulty: "HARD", outcome: { correct: 10, partial: 55, incorrect: 35, blank: 0 } },
  { position: 10, prompt: "Write two sentences about your best friend.", typeLabel: "Text input · chấm tay", sectionTitle: "3. Text input & multiple blanks", accuracyPercent: 19, blankPercent: 0, n: 21, difficulty: "HARD", outcome: { correct: 19, partial: 48, incorrect: 33, blank: 0 } },
  { position: 11, prompt: "The library is open on Saturday.", typeLabel: "Single choice", sectionTitle: "4. Read the notice - Instructions", accuracyPercent: 62, blankPercent: 0, n: 21, difficulty: null, outcome: { correct: 62, partial: 0, incorrect: 38, blank: 0 } },
  { position: 12, prompt: "Students can borrow two books.", typeLabel: "Single choice", sectionTitle: "4. Read the notice - Instructions", accuracyPercent: 76, blankPercent: 0, n: 21, difficulty: null, outcome: { correct: 76, partial: 0, incorrect: 24, blank: 0 } },
];

export const MOCK_SECTIONS: MockSection[] = [
  { title: "1. Single choice & True / False", questionCount: 4, outcome: { correct: 71, partial: 0, incorrect: 27, blank: 2 }, accuracyPercent: 71, scoreRatePercent: 71, blankPercent: 2, n: 84 },
  { title: "2. Multiple choice – choose all correct answers", questionCount: 2, outcome: { correct: 64, partial: 22, incorrect: 14, blank: 0 }, accuracyPercent: 64, scoreRatePercent: 86, blankPercent: 0, n: 42 },
  { title: "3. Text input & multiple blanks", questionCount: 4, outcome: { correct: 37, partial: 28, incorrect: 34, blank: 1 }, accuracyPercent: 37, scoreRatePercent: 55, blankPercent: 1, n: 84 },
  { title: "4. Read the notice", questionCount: 3, outcome: { correct: 70, partial: 0, incorrect: 30, blank: 0 }, accuracyPercent: 70, scoreRatePercent: 70, blankPercent: 0, n: 63 },
  { title: "5. Look at the picture", questionCount: 3, outcome: { correct: 65, partial: 0, incorrect: 33, blank: 2 }, accuracyPercent: 65, scoreRatePercent: 65, blankPercent: 2, n: 63 },
  { title: "6. Reading comprehension", questionCount: 3, outcome: { correct: 65, partial: 0, incorrect: 27, blank: 8 }, accuracyPercent: 65, scoreRatePercent: 65, blankPercent: 8, n: 63 },
  { title: "7. Cloze passage", questionCount: 4, outcome: { correct: 45, partial: 0, incorrect: 45, blank: 10 }, accuracyPercent: 45, scoreRatePercent: 45, blankPercent: 10, n: 84 },
  { title: "8. Match the questions with the answers", questionCount: 5, outcome: { correct: 65, partial: 0, incorrect: 23, blank: 12 }, accuracyPercent: 65, scoreRatePercent: 65, blankPercent: 12, n: 105 },
];

export const MOCK_STUDENTS: MockStudent[] = [
  { studentId: 1, name: "Nguyễn Minh Anh", className: "6A1", classNote: null, status: "SUBMITTED", earned: 11.7, possible: 29.5, percent: 40, deltaVsAvg: -24, durationMinutes: 28, blankCount: 1 },
  { studentId: 2, name: "Trần Gia Bảo", className: "6A1", classNote: null, status: "SUBMITTED", earned: 18, possible: 29.5, percent: 61, deltaVsAvg: -2, durationMinutes: 22, blankCount: 0 },
  { studentId: 3, name: "Lê Khánh Chi", className: "6A1", classNote: null, status: "SUBMITTED", earned: 17.2, possible: 29.5, percent: 58, deltaVsAvg: -5, durationMinutes: 29, blankCount: 0 },
  { studentId: 4, name: "Phạm Đức Duy", className: "6A1", classNote: null, status: "SUBMITTED", earned: 23.5, possible: 29.5, percent: 80, deltaVsAvg: 17, durationMinutes: 31, blankCount: 0 },
  { studentId: 5, name: "Chu Hải Đăng", className: "6A1", classNote: null, status: "TIMED_OUT", earned: 16.2, possible: 29.5, percent: 55, deltaVsAvg: -8, durationMinutes: 40, blankCount: 10 },
  { studentId: 6, name: "Hoàng Thu Hà", className: "6A1", classNote: null, status: "SUBMITTED", earned: 15.2, possible: 29.5, percent: 51, deltaVsAvg: -12, durationMinutes: 28, blankCount: 2 },
  { studentId: 7, name: "Đặng Ngọc Hân", className: "6A1", classNote: null, status: "SUBMITTED", earned: 24, possible: 29.5, percent: 81, deltaVsAvg: 18, durationMinutes: 28, blankCount: 0 },
  { studentId: 8, name: "Vũ Quang Huy", className: "6A1", classNote: "nay 6A2", status: "SUBMITTED", earned: 13.2, possible: 29.5, percent: 45, deltaVsAvg: -19, durationMinutes: 33, blankCount: 2 },
  { studentId: 9, name: "Bùi Tuấn Khang", className: "6A1", classNote: null, status: "SUBMITTED", earned: 21, possible: 29.5, percent: 71, deltaVsAvg: 8, durationMinutes: 22, blankCount: 0 },
  { studentId: 10, name: "Đỗ Phương Linh", className: "6A1", classNote: null, status: "SUBMITTED", earned: 25.2, possible: 29.5, percent: 85, deltaVsAvg: 22, durationMinutes: 23, blankCount: 0 },
  { studentId: 11, name: "Ngô Bảo Long", className: "6A1", classNote: null, status: "SUBMITTED", earned: 19.2, possible: 29.5, percent: 65, deltaVsAvg: 2, durationMinutes: 23, blankCount: 0 },
  { studentId: 12, name: "Dương Thảo My", className: "6A1", classNote: null, status: "SUBMITTED", earned: 23.5, possible: 29.5, percent: 80, deltaVsAvg: 17, durationMinutes: 34, blankCount: 0 },
  { studentId: 13, name: "Lý Hoàng Nam", className: "6A1", classNote: null, status: "SUBMITTED", earned: 14.7, possible: 29.5, percent: 50, deltaVsAvg: -13, durationMinutes: 33, blankCount: 1 },
  { studentId: 14, name: "Kiều Bảo Ngọc", className: "6A1", classNote: null, status: "IN_PROGRESS", earned: null, possible: null, percent: null, deltaVsAvg: null, durationMinutes: null, blankCount: null },
];

export const MOCK_CLASS_ROWS = [
  {
    classId: 1,
    className: "6A1",
    assigned: 24,
    submitted: 21,
    submissionRate: 0.88,
    averagePercent: 63,
    medianPercent: 61,
    accuracyPercent: 60,
    outcome: { correct: 60, partial: 12, incorrect: 20, blank: 8 } as MockOutcome,
  },
];

export const MOCK_REVIEW = {
  studentId: 1,
  name: "Nguyễn Minh Anh",
  className: "6A1",
  status: "SUBMITTED" as const,
  earned: 11.7,
  possible: 29.5,
  percent: 40,
  deltaVsAvg: -24,
  classAvg: 63,
  durationMinutes: 28,
  startedAt: "20:02 20-10",
  finishedAt: "20:29 20-10",
  sections: [
    { title: "1. Single choice & True / False", earned: 3, possible: 4, classRate: 71 },
    { title: "2. Multiple choice – choose all correct answers", earned: 1.7, possible: 2, classRate: 86 },
    { title: "3. Text input & multiple blanks", earned: 2, possible: 5.5, classRate: 55 },
    { title: "4. Read the notice", earned: 1, possible: 3, classRate: 70 },
    { title: "5. Look at the picture", earned: 0, possible: 3, classRate: 65 },
    { title: "6. Reading comprehension", earned: 1, possible: 3, classRate: 65 },
    { title: "7. Cloze passage", earned: 1, possible: 4, classRate: 45 },
    { title: "8. Match the questions with the answers", earned: 2, possible: 5, classRate: 65 },
  ],
  questions: [
    { position: 1, prompt: "We have Maths (1)___ Monday and Friday.", outcome: "CORRECT" as const, earnedLabel: "1/1", studentAnswer: "B. on", correctAnswer: "B. on" },
    { position: 2, prompt: "cat · hat · map · name", outcome: "INCORRECT" as const, earnedLabel: "0/1", studentAnswer: "C. map", correctAnswer: "D. name" },
    { position: 3, prompt: "Ha Noi is the capital city of Viet Nam.", outcome: "CORRECT" as const, earnedLabel: "1/1", studentAnswer: "A. True", correctAnswer: "A. True" },
    { position: 4, prompt: "There are eight days in a week.", outcome: "CORRECT" as const, earnedLabel: "1/1", studentAnswer: "B. False", correctAnswer: "B. False" },
    { position: 5, prompt: "Which of these are school subjects?", outcome: "PARTIAL" as const, earnedLabel: "0.7/1", studentAnswer: "A, C", correctAnswer: "A, B, C" },
  ] satisfies MockReviewQuestion[],
};
