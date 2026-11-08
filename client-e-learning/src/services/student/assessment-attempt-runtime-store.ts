import type { AttemptRuntimeResponse } from "@/types/student/assignment-attempt";

function runtimeStorageKey(studentId: number, assignmentId: number): string {
  return `student-assignment-runtime:${studentId}:${assignmentId}`;
}

/** Best-effort handoff; the paper route can recover through the backend if storage is unavailable. */
export function storeAttemptRuntime(
  studentId: number,
  assignmentId: number,
  runtime: AttemptRuntimeResponse,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      runtimeStorageKey(studentId, assignmentId),
      JSON.stringify(runtime),
    );
  } catch {
    // Do not block a successful Start/Resume response; paper route will resume from the server.
  }
}

/** Consume once so a later refresh will request an authoritative resume snapshot. */
export function consumeAttemptRuntime(
  studentId: number,
  assignmentId: number,
): AttemptRuntimeResponse | null {
  if (typeof window === "undefined") return null;
  const key = runtimeStorageKey(studentId, assignmentId);
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    window.sessionStorage.removeItem(key);
    return JSON.parse(raw) as AttemptRuntimeResponse;
  } catch {
    return null;
  }
}

export function clearAttemptRuntimeStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const keys = Array.from(
      { length: window.sessionStorage.length },
      (_, index) => window.sessionStorage.key(index),
    );
    keys.forEach((key) => {
      if (key?.startsWith("student-assignment-runtime:")) {
        window.sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Session cleanup remains best-effort when browser storage is unavailable.
  }
}
