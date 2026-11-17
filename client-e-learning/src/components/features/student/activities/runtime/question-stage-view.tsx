"use client";

import type { ReactNode } from "react";
import {
  AnswerControls,
  type AnswerOptionState,
  type RuntimeQuestionType,
} from "./question-stage/answer-controls";
import { QuestionMedia } from "./question-stage/question-media";
import { QuestionPrompt } from "./question-stage/question-prompt";
import type { RuntimeOrdering } from "./ordering/ordering-types";

type Props = {
  type: RuntimeQuestionType;
  prompt?: string | null;
  options: { key: string; content: string }[];
  ordering?: RuntimeOrdering | null;
  draft: string[];
  disabled?: boolean;
  inputLabel: string;
  inputPlaceholder: string;
  onDraftChange: (next: string[]) => void;
  optionState?: (key: string) => AnswerOptionState;
  media?: ReactNode;
  guidedProgress?: ReactNode;
  feedback?: ReactNode;
  actions?: ReactNode;
};

/** Shared visual composition for Classic Final, Guided Step and Guided Final. */
export function QuestionStageView({
  type,
  prompt,
  options,
  ordering,
  draft,
  disabled,
  inputLabel,
  inputPlaceholder,
  onDraftChange,
  optionState,
  media,
  guidedProgress,
  feedback,
  actions,
}: Props) {
  return (
    <div className="space-y-4">
      {guidedProgress}
      <QuestionPrompt prompt={prompt} />
      <QuestionMedia>{media}</QuestionMedia>
      <AnswerControls
        type={type}
        options={options}
        ordering={ordering}
        draft={draft}
        disabled={disabled}
        inputLabel={inputLabel}
        inputPlaceholder={inputPlaceholder}
        onDraftChange={onDraftChange}
        optionState={optionState}
      />
      {feedback}
      {actions}
    </div>
  );
}
