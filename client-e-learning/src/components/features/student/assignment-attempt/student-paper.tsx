"use client";

import {
  Fragment,
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type {
  AttemptAnswerPayload,
  JsonRecord,
  AttemptRuntimeQuestionResponse,
  AttemptRuntimeResponse,
  StudentQuestionSnapshot,
  CompositionItemSnapshot,
  CompositionSectionSnapshot,
  PoolOption,
} from "@/types/student/assignment-attempt";

const QuestionTotalContext = createContext(0);

export function hasMeaningfulAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some(hasMeaningfulAnswer);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(
      hasMeaningfulAnswer,
    );
  }
  return false;
}

// FILE_INCOMPLETE_RESTORE_NEEDED
export function StudentPaper() {
  return null;
}
