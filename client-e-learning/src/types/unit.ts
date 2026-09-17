export type SkillType = "vocabulary" | "grammar" | "reading" | "listening";

export interface TopicItem {
  id: string;
  title: string;
  skill: SkillType;
  activitiesCount: number;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed";
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  grade: string;
  isLocked: boolean;
  coverEmoji?: string;
  coverImage?: string;
  totalTopicsCount: number;
  totalActivitiesCount: number;
  completedActivitiesCount: number;
  progressPercent: number;
  topics: TopicItem[];
}
