import type {
  ContentQuestion,
  ContentQuestionBank,
  ContentSection,
  ContentTopic,
  ContentUnit,
} from "@/types/content";

export const contentGrades = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

export const contentUnits: ContentUnit[] = [
  {
    id: 1,
    name: "My School",
    code: "U1",
    grade: "Grade 6",
    sections: 5,
    topics: 8,
    tone: "mint",
    progress: 72,
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    topicNames: ["School things", "Present Simple", "School announcement"],
  },
  {
    id: 2,
    name: "Travel & Holiday",
    code: "U2",
    grade: "Grade 6",
    sections: 6,
    topics: 12,
    tone: "violet",
    progress: 45,
    imageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80",
    topicNames: ["Past Simple", "Travel words", "Holiday activities"],
  },
  {
    id: 3,
    name: "School Life",
    code: "U3",
    grade: "Grade 7",
    sections: 5,
    topics: 10,
    tone: "blue",
    progress: 28,
    topicNames: ["Daily routines", "School subjects"],
  },
  {
    id: 4,
    name: "My Future",
    code: "U4",
    grade: "Grade 8",
    sections: 4,
    topics: 8,
    tone: "orange",
    progress: 0,
    topicNames: ["Future plans", "Jobs", "Ambitions"],
  },
];

export const contentSections: ContentSection[] = [
  { name: "Grammar", topics: 3, tone: "violet" },
  { name: "Vocabulary", topics: 3, tone: "mint" },
  { name: "Reading", topics: 2, tone: "blue" },
  { name: "Listening", topics: 2, tone: "orange" },
  { name: "Speaking", topics: 1, tone: "teal" },
  { name: "Writing", topics: 1, tone: "pink" },
];

export const contentTopics: ContentTopic[] = [
  { name: "Past Simple", banks: 3, questions: 200, tone: "pink" },
  { name: "Comparative", banks: 1, questions: 100, tone: "blue" },
  { name: "Superlative", banks: 1, questions: 100, tone: "mint" },
];

export const contentQuestionBanks: ContentQuestionBank[] = [
  { name: "Past Simple - Basic", type: "Mixed", questions: 100, difficulty: "Easy" },
  { name: "Past Simple - Review", type: "Mixed", questions: 100, difficulty: "Medium" },
  { name: "Past Simple - Advanced", type: "Mixed", questions: 100, difficulty: "Hard" },
];

export const contentQuestions: ContentQuestion[] = [
  { text: "She ____ to school yesterday.", type: "Multiple Choice", difficulty: "Easy" },
  { text: "I ____ my homework last night.", type: "Multiple Choice", difficulty: "Easy" },
  { text: "They ____ to the beach.", type: "Fill in the Blank", difficulty: "Medium" },
  { text: "What did he do yesterday?", type: "Type Answer", difficulty: "Medium" },
  { text: "We ____ at 7 p.m.", type: "Multiple Choice", difficulty: "Easy" },
];