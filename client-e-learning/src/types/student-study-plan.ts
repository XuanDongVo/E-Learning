export interface StudentStudyTask {
  id: number;
  title: string;
  notes: string | null;
  plannedDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTaskInput {
  title: string;
  notes: string | null;
  plannedDate: string | null;
}
