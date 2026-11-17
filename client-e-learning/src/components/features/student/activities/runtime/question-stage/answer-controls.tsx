"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderingAnswer } from "../ordering/OrderingAnswer";
import type { RuntimeOrdering } from "../ordering/ordering-types";

export type RuntimeQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_IN_BLANK"
  | "TYPE_ANSWER"
  | "ORDERING";

export type AnswerOptionState =
  | "correct"
  | "wrong"
  | "selected"
  | undefined;

const truthOptions = [
  { key: "TRUE", content: "Đúng" },
  { key: "FALSE", content: "Sai" },
];

export function AnswerControls({
  type,
  options,
  ordering,
  draft,
  disabled,
  inputLabel,
  inputPlaceholder,
  onDraftChange,
  optionState,
}: {
  type: RuntimeQuestionType;
  options: { key: string; content: string }[];
  ordering?: RuntimeOrdering | null;
  draft: string[];
  disabled?: boolean;
  inputLabel: string;
  inputPlaceholder: string;
  onDraftChange: (next: string[]) => void;
  optionState?: (key: string) => AnswerOptionState;
}) {
  if (type === "ORDERING") {
    return ordering ? (
      <OrderingAnswer
        ordering={ordering}
        draft={draft}
        disabled={disabled}
        onChange={onDraftChange}
      />
    ) : null;
  }

  const choices =
    type === "SINGLE_CHOICE" ||
    type === "MULTIPLE_CHOICE" ||
    type === "TRUE_FALSE";
  const visibleOptions = type === "TRUE_FALSE" ? truthOptions : options;
  const toggle = (key: string) => {
    onDraftChange(
      type === "MULTIPLE_CHOICE"
        ? draft.includes(key)
          ? draft.filter((value) => value !== key)
          : [...draft, key]
        : [key],
    );
  };

  if (!choices) {
    return (
      <input
        className="student-field"
        value={draft[0] ?? ""}
        disabled={disabled}
        onChange={(event) => onDraftChange([event.target.value])}
        aria-label={inputLabel}
        placeholder={inputPlaceholder}
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visibleOptions.map((option, index) => {
        const state =
          optionState?.(option.key) ??
          (draft.includes(option.key) ? "selected" : undefined);
        return (
          <Button
            key={option.key}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-pressed={draft.includes(option.key)}
            onClick={() => toggle(option.key)}
            className={
              "student-control p-2 h-auto min-h-14 justify-start whitespace-normal text-left " +
              (state === "correct"
                ? "!border-success !bg-success-soft !opacity-100"
                : state === "wrong"
                  ? "!border-destructive !bg-destructive-soft !opacity-100"
                  : state === "selected"
                    ? "!border-learning !bg-learning-soft !opacity-100"
                    : "")
            }
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-background text-sm text-muted-foreground">
              {state === "correct" ? (
                <Check size={16} />
              ) : state === "wrong" ? (
                <X size={16} />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </span>
            {option.content}
          </Button>
        );
      })}
    </div>
  );
}
