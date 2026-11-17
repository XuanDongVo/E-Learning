import type {
  ActivitySessionQuestion,
  GuidedStepAnswerFeedback,
} from "@/types/student/activity-session";

export type GuidedStep = NonNullable<
  NonNullable<ActivitySessionQuestion["guided"]>["currentStep"]
>;

export type GuidedStepReview = {
  step: GuidedStep;
  feedback: GuidedStepAnswerFeedback;
  answer: string;
};

export type GuidedFinalReview = {
  feedback: { correct: boolean; retryAvailable: boolean };
  answer: string[];
};

export function isGuidedFinalDraftComplete(
  question: ActivitySessionQuestion,
  draft: string[],
) {
  if (question.type === "ORDERING") {
    return draft.length === (question.ordering?.items.length ?? 0);
  }
  return draft.length > 0 && (draft[0] ?? "").trim().length > 0;
}
