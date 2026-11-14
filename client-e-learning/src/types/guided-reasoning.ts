import type { QuestionMatchingMode, QuestionType } from "@/types/question";

export type GuidedDefinitionStatus = "DRAFT" | "READY";
export type GuidedStepType = Extract<
  QuestionType,
  "SINGLE_CHOICE" | "TRUE_FALSE" | "TYPE_ANSWER"
>;

export type GuidedChoice = { key: string; content: string };

export type GuidedStep = {
  stepKey: string;
  position: number;
  type: GuidedStepType;
  prompt: string | null;
  options: GuidedChoice[];
  correctKey: string | null;
  expected: boolean | null;
  acceptedAnswers: string[];
  matchingMode: QuestionMatchingMode | null;
  explanation: string | null;
  hintEnabled: boolean;
  hint: string | null;
  retryEnabled: boolean;
};

export type GuidedDefinition = {
  questionId: number;
  schemaVersion: number;
  version: number;
  status: GuidedDefinitionStatus;
  sourceQuestionRevision: number | null;
  introContent: string | null;
  steps: GuidedStep[];
};

export type GuidedDefinitionIssue = { path: string; code: string };

export type GuidedDefinitionValidation = {
  ready: boolean;
  issues: GuidedDefinitionIssue[];
  definition: GuidedDefinition;
};

export type GuidedCapabilities = {
  supportedStepTypes: GuidedStepType[];
  hintEnabledByDefault: boolean;
  retryEnabledByDefault: boolean;
  maxAttemptsWhenRetryEnabled: number;
};

export type GuidedDefinitionDraft = Pick<GuidedDefinition, "introContent" | "steps"> & {
  expectedVersion: number;
};

/** Local authoring state used before a Bulk Question has a server ID. */
export type GuidedDefinitionDraftState = {
  enabled: boolean;
  introContent: string;
  steps: GuidedStep[];
};
