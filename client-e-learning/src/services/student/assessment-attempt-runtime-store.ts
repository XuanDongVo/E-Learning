import type { AttemptRuntimeResponse } from "@/types/student/assignment-attempt";

function runtimeStorageKey(studentId: string, assignmentId: number): string {
  return `student-assignment-runtime:${studentId}:${assignmentId}`;
}

/** Keeps the just-started safe runtime available across the Intro -> Paper route transition. */
export function storeAttemptRuntime(
  studentId: string,
  assignmentId: number,
  runtime: AttemptRuntimeResponse,
): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    runtimeStorageKey(studentId, assignmentId),
    JSON.stringify(runtime),
  );
}

/** Consume once so a later refresh will request an authoritative resume snapshot. */
export function consumeAttemptRuntime(
  studentId: string,
  assignmentId: number,
): AttemptRuntimeResponse | null {
  if (typeof window === "undefined") return null;
  const key = runtimeStorageKey(studentId, assignmentId);
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  window.sessionStorage.removeItem(key);
  try {
    return JSON.parse(raw) as AttemptRuntimeResponse;
  } catch {
    return null;
  }
}
