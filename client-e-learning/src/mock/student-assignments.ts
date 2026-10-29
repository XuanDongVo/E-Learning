export type StudentAssignmentStatus = "TODO" | "IN_PROGRESS" | "SUBMITTED";

export interface StudentAssignmentPreview {
  id: number;
  title: string;
  unitName: string;
  dueAt: string;
  questionCount: number;
  timeLimitMinutes: number;
  status: StudentAssignmentStatus;
  progressPercent?: number;
}

function daysFromNow(days: number, hour = 20): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const STUDENT_ASSIGNMENTS: StudentAssignmentPreview[] = [
  {
    id: 1,
    title: "Grammar & vocabulary",
    unitName: "Food & Drink",
    dueAt: daysFromNow(0),
    questionCount: 20,
    timeLimitMinutes: 20,
    status: "TODO",
  },
  {
    id: 2,
    title: "My daily routine",
    unitName: "Daily Routines",
    dueAt: daysFromNow(3),
    questionCount: 15,
    timeLimitMinutes: 20,
    status: "IN_PROGRESS",
    progressPercent: 65,
  },
  {
    id: 3,
    title: "Family & friends",
    unitName: "My Family",
    dueAt: daysFromNow(5),
    questionCount: 12,
    timeLimitMinutes: 15,
    status: "TODO",
  },
  {
    id: 4,
    title: "A week in my life",
    unitName: "Daily Routines",
    dueAt: daysFromNow(-2),
    questionCount: 15,
    timeLimitMinutes: 20,
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Meet my family",
    unitName: "My Family",
    dueAt: daysFromNow(-5),
    questionCount: 10,
    timeLimitMinutes: 15,
    status: "SUBMITTED",
  },
];
