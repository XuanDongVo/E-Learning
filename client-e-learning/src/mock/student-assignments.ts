export type StudentAssignmentStatus = "TODO" | "IN_PROGRESS" | "SUBMITTED";

export interface StudentAssignmentPreview {
  id: number;
  title: string;
  unitName: string;
  dueAt: string;
  questionCount: number;
  timeLimitMinutes: number;
  status: StudentAssignmentStatus;
}

export const STUDENT_ASSIGNMENT_PREVIEWS: StudentAssignmentPreview[] = [
  {
    id: 1,
    title: "Grammar & vocabulary",
    unitName: "Food & Drink",
    dueAt: "2026-10-28T20:00:00+07:00",
    questionCount: 20,
    timeLimitMinutes: 20,
    status: "TODO",
  },
  {
    id: 2,
    title: "My daily routine",
    unitName: "Daily Routines",
    dueAt: "2026-10-31T20:00:00+07:00",
    questionCount: 15,
    timeLimitMinutes: 20,
    status: "IN_PROGRESS",
  },
  {
    id: 3,
    title: "Family & friends",
    unitName: "My Family",
    dueAt: "2026-11-02T20:00:00+07:00",
    questionCount: 12,
    timeLimitMinutes: 15,
    status: "TODO",
  },
  {
    id: 4,
    title: "A week in my life",
    unitName: "Daily Routines",
    dueAt: "2026-10-23T20:00:00+07:00",
    questionCount: 15,
    timeLimitMinutes: 20,
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Meet my family",
    unitName: "My Family",
    dueAt: "2026-10-19T20:00:00+07:00",
    questionCount: 10,
    timeLimitMinutes: 15,
    status: "SUBMITTED",
  },
];
