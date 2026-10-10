import { ActivityDifficulty, ActivityMode } from "./activity";

export interface StudentUnitSummary {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  displayOrder: number;
  sectionCount: number;
  activityCount: number;
}

export interface StudentTopic {
  id: number;
  name: string;
}

export interface StudentSection {
  id: number;
  name: string;
  description?: string | null;
  topics: StudentTopic[];
}

export interface StudentActivity {
  id: number;
  name: string;
  description?: string | null;
  mode: ActivityMode;
  questionDifficulty: ActivityDifficulty;
  totalQuestions: number;
  timeLimitSeconds?: number | null;
  lives?: number | null;
  topicIds: number[];
}

export interface StudentUnitDetail extends StudentUnitSummary {
  sections: StudentSection[];
  activities: StudentActivity[];
}
