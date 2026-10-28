import type { StudentAssignmentItem } from "./types";

export const STUDENT_ASSIGNMENTS_MOCK: StudentAssignmentItem[] = [
  {
    id: 1,
    title: "Grammar & vocabulary",
    dueInDays: 2,
    questionCount: 20,
    timeLimitMinutes: 20,
    status: "TODO",
    description:
      "Show what you've learned about grammar, quantities and everyday English. Read each question carefully and take your time.",
    teacherName: "Ms. Linh",
    dueLabel: "Wed, 28 Oct · 8:00 PM",
    instructions: [
      "Read each question carefully before answering.",
      "You can move between questions and check your answers before submitting.",
      "No hints or answer feedback are shown during the assignment.",
    ],
    samplePaper: true,
  },
  {
    id: 2,
    title: "My daily routine",
    dueInDays: 5,
    questionCount: 15,
    timeLimitMinutes: 20,
    status: "IN_PROGRESS",
    description:
      "Use time expressions and the present simple to talk about a typical day.",
    teacherName: "Ms. Linh",
    dueLabel: "Sat, 31 Oct · 8:00 PM",
    instructions: [
      "Read the time expressions in each question carefully.",
      "Check your answers before submitting.",
    ],
    samplePaper: false,
  },
  {
    id: 3,
    title: "Family & friends",
    dueInDays: 7,
    questionCount: 12,
    timeLimitMinutes: 15,
    status: "TODO",
    description:
      "Review family vocabulary and possessives in everyday sentences.",
    teacherName: "Ms. Linh",
    dueLabel: "Mon, 2 Nov · 8:00 PM",
    instructions: [
      "Read each sentence carefully.",
      "Check spelling in your written answers.",
    ],
    samplePaper: false,
  },
  {
    id: 4,
    title: "A week in my life",
    dueInDays: -3,
    questionCount: 15,
    timeLimitMinutes: 20,
    status: "SUBMITTED",
    description:
      "An assignment about everyday activities and frequency expressions.",
    teacherName: "Ms. Linh",
    dueLabel: "Fri, 23 Oct · 8:00 PM",
    instructions: [],
    samplePaper: false,
  },
  {
    id: 5,
    title: "Meet my family",
    dueInDays: -7,
    questionCount: 10,
    timeLimitMinutes: 15,
    status: "SUBMITTED",
    description: "Introduce your family using vocabulary from previous lessons.",
    teacherName: "Ms. Linh",
    dueLabel: "Mon, 19 Oct · 8:00 PM",
    instructions: [],
    samplePaper: false,
  },
];

