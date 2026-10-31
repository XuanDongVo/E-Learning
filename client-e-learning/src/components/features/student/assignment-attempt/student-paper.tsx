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

// ============================================================================
// 2. HELPER UTILITIES
// ============================================================================

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

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
