import type { CsvValidationResult } from "@/types/question-import";

const PREFIX = "elearning:question-bank-csv-handoff:";
const SCHEMA_VERSION = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type QuestionImportHandoff = {
  version: 1;
  importId: string;
  bankId: number;
  userId: number;
  createdAt: number;
  status: "pending" | "applied";
  result: CsvValidationResult;
};

function storageKey(importId: string): string {
  return PREFIX + importId;
}

export function createQuestionImportHandoff(
  bankId: number,
  userId: number,
  result: CsvValidationResult,
): string {
  if (!result.validQuestions.length || result.validCount === 0) {
    throw new Error("Không có câu hỏi hợp lệ để chuyển vào trình chỉnh sửa.");
  }
  const importId = crypto.randomUUID();
  const payload: QuestionImportHandoff = {
    version: SCHEMA_VERSION,
    importId,
    bankId,
    userId,
    createdAt: Date.now(),
    status: "pending",
    result,
  };
  // Deliberately session-scoped: no draft payload in the URL or server database.
  sessionStorage.setItem(storageKey(importId), JSON.stringify(payload));
  return importId;
}

export function getQuestionImportHandoff(
  importId: string,
  bankId: number,
  userId: number,
): QuestionImportHandoff | null {
  if (!/^[0-9a-f-]{36}$/i.test(importId)) return null;
  try {
    const value = sessionStorage.getItem(storageKey(importId));
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null) return null;
    const entry = parsed as Partial<QuestionImportHandoff>;
    if (
      entry.version !== SCHEMA_VERSION ||
      entry.importId !== importId ||
      entry.bankId !== bankId ||
      entry.userId !== userId ||
      typeof entry.createdAt !== "number" ||
      !Number.isFinite(entry.createdAt) ||
      entry.createdAt > Date.now() ||
      Date.now() - entry.createdAt > MAX_AGE_MS ||
      (entry.status !== "pending" && entry.status !== "applied") ||
      !entry.result ||
      !Array.isArray(entry.result.errors) ||
      !Array.isArray(entry.result.validQuestions)
    ) {
      return null;
    }
    return entry as QuestionImportHandoff;
  } catch {
    return null;
  }
}

export function markQuestionImportApplied(
  entry: QuestionImportHandoff,
): void {
  const updated: QuestionImportHandoff = {
    ...entry,
    status: "applied",
    // The real drafts now live in the existing editor's localStorage.
    // Keep the validation report, but not a duplicate copy of all questions.
    result: { ...entry.result, validQuestions: [] },
  };
  sessionStorage.setItem(storageKey(entry.importId), JSON.stringify(updated));
}

export function clearQuestionImportHandoff(importId: string): void {
  if (/^[0-9a-f-]{36}$/i.test(importId)) {
    try {
      sessionStorage.removeItem(storageKey(importId));
    } catch {
      // Cleanup is best-effort if browser storage is unavailable.
    }
  }
}
