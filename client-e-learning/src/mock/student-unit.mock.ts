import type { StudentActivity, StudentSection, StudentUnitSummary } from "@/types/student-unit";

export const MOCK_UNITS: StudentUnitSummary[] = [
  { id: 1, code: "U1", name: "Getting started", description: "Build your English foundations with grammar, vocabulary and short reading practice.", coverUrl: null, displayOrder: 1, sectionCount: 3, activityCount: 5 },
  { id: 2, code: "U2", name: "Daily life", description: "Talk about your day, your home and the things you do every week.", coverUrl: null, displayOrder: 2, sectionCount: 4, activityCount: 6 },
  { id: 3, code: "U3", name: "Around town", description: "Ask for directions and describe places in your neighbourhood.", coverUrl: null, displayOrder: 3, sectionCount: 3, activityCount: 4 },
  { id: 4, code: "U4", name: "Food and drink", description: "Order a meal, talk about likes and dislikes, and plan a menu.", coverUrl: null, displayOrder: 4, sectionCount: 2, activityCount: 3 },
];

export const MOCK_UNIT_CONTENT: { sections: StudentSection[]; activities: StudentActivity[] } = {
  sections: [
    { id: 1, name: "Grammar", topics: [{ id: 11, name: "Present simple" }, { id: 12, name: "Past simple" }] },
    { id: 2, name: "Vocabulary", topics: [{ id: 21, name: "Greetings" }, { id: 22, name: "Family" }] },
    { id: 3, name: "Reading", topics: [{ id: 31, name: "Short stories" }] },
  ],
  activities: [
    { id: 101, name: "Present simple practice", description: "Use present simple for habits, facts and routines.", mode: "BOTH", totalQuestions: 15, timeLimitSeconds: 15, lives: 3, topicIds: [11] },
    { id: 102, name: "Past simple challenge", description: "Race through regular and irregular past forms.", mode: "TRY_HARD", totalQuestions: 10, timeLimitSeconds: 15, lives: 3, topicIds: [12] },
    { id: 103, name: "Greetings and introductions", description: "Say hello, introduce yourself and your family.", mode: "BOTH", totalQuestions: 20, timeLimitSeconds: 20, lives: 3, topicIds: [21, 22] },
    { id: 104, name: "Grammar mix", description: "Switch between present and past in short sentences.", mode: "LEARNING", totalQuestions: 12, topicIds: [11, 12] },
    { id: 105, name: "Mixed review", description: "A bit of everything from the whole unit.", mode: "BOTH", totalQuestions: 25, timeLimitSeconds: 15, lives: 3, topicIds: [12, 21, 31] },
  ],
};
