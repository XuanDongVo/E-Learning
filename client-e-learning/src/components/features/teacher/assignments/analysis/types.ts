export type AnalysisTab =
  | "overview"
  | "questions"
  | "sections"
  | "students"
  | "classes";

export const ANALYSIS_TABS: AnalysisTab[] = [
  "overview",
  "questions",
  "sections",
  "students",
  "classes",
];

export type OutcomeMix = {
  correct: number;
  partial: number;
  incorrect: number;
  blank: number;
};
