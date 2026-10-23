export type AppErrorSource = "api" | "network" | "http" | "unknown";

export interface AppErrorPayload {
  code?: unknown;
  message?: unknown;
  details?: unknown;
}

interface AppErrorOptions {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
  source: AppErrorSource;
  cause?: unknown;
}

const DEFAULT_ERROR_MESSAGE = "Request failed";
const LEGACY_CODE_PATTERN = /^\[([A-Z0-9_]+)\]\s*(.*)$/;

export class AppError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details: unknown;
  readonly source: AppErrorSource;

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
    this.source = options.source;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

/** Normalize unknown and legacy errors at the UI boundary. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isRecord(error)) {
    const code = nonEmptyString(error.code);
    const message = nonEmptyString(error.message);
    const status = typeof error.status === "number" ? error.status : undefined;

    if (code || message) {
      return new AppError({
        code: code ?? "UNKNOWN_ERROR",
        message: message ?? DEFAULT_ERROR_MESSAGE,
        status,
        details: error.details,
        source: "api",
        cause: error,
      });
    }
  }

  const message = error instanceof Error
    ? error.message
    : nonEmptyString(error) ?? DEFAULT_ERROR_MESSAGE;
  const legacyMatch = LEGACY_CODE_PATTERN.exec(message);

  if (legacyMatch) {
    return new AppError({
      code: legacyMatch[1],
      message,
      source: "unknown",
      cause: error,
    });
  }

  return new AppError({
    code: "UNKNOWN_ERROR",
    message,
    source: error instanceof TypeError ? "network" : "unknown",
    cause: error,
  });
}

/**
 * Explicit exceptions are listed first; naming conventions provide a stable
 * fallback for codes that have not yet received a dedicated translation key.
 */
const explicitMessageKeys: Readonly<Record<string, string>> = {
  INVALID_REQUEST: "invalidRequest",
  INTERNAL_ERROR: "server",
  UNAUTHORIZED: "authentication",
  AUTHENTICATION_FAILED: "authentication",
  INVALID_TOKEN: "authentication",
  FORBIDDEN: "forbidden",
  VALIDATION_FAILED: "validation",
  USER_NOT_FOUND: "userNotFound",
  STUDENT_NOT_FOUND: "userNotFound",
  CLASS_NOT_FOUND: "classNotFound",
  EMAIL_ALREADY_EXISTS: "emailAlreadyExists",
  CLASS_ALREADY_EXISTS: "conflict",
  STUDENT_ALREADY_IN_CLASS: "conflict",
  ACTIVITY_NOT_READY: "notReady",
  ASSIGNMENT_NOT_READY: "notReady",
  ASSIGNMENT_TIME_LIMIT_INVALID: "validation",
  ACTIVITY_SESSION_ANSWER_INVALID: "validation",
  STUDENT_NOT_IN_ACTIVE_CLASS: "forbidden",
  ACTIVITY_SESSION_NOT_ACCESSIBLE: "forbidden",
  ACTIVITY_SESSION_NOT_ACTIVE: "conflict",
  MEDIA_NOT_READY: "conflict",
};

function inferMessageKey(code: string): string {
  if (code.startsWith("HTTP_") || code === "UNKNOWN_ERROR") return "server";
  if (code.endsWith("_NOT_FOUND")) return "notFound";
  if (
    code.includes("INVALID") ||
    code.includes("REQUIRED") ||
    code.includes("EXCEEDED") ||
    code.includes("OUTSIDE") ||
    code.includes("EMPTY") ||
    code.includes("UNSUPPORTED") ||
    code.includes("DETECTION_FAILED") ||
    code.startsWith("MEDIA_FILE_") ||
    code.startsWith("MEDIA_TYPE_") ||
    code.startsWith("MEDIA_CONTENT_") ||
    code === "QUESTION_NOT_IN_BANK"
  ) return "validation";
  if (
    code.endsWith("_ALREADY_EXISTS") ||
    code.endsWith("_LOCKED") ||
    code.endsWith("_NOT_READY") ||
    code.endsWith("_IN_USE") ||
    code.endsWith("_EXHAUSTED") ||
    code.endsWith("_UNAVAILABLE")
  ) return "conflict";
  return "generic";
}

export function appErrorMessageKey(code: string): string {
  return explicitMessageKeys[code] ?? inferMessageKey(code);
}

/**
 * Prefer localized, code-based copy. Preserve the original message when the
 * error is unknown or the translation key is unavailable.
 */
export function getAppErrorMessage(
  error: unknown,
  translate: (key: string) => string,
): string {
  const normalized = toAppError(error);
  if (normalized.code === "UNKNOWN_ERROR") return normalized.message;

  try {
    const translated = translate(appErrorMessageKey(normalized.code));
    return translated || normalized.message;
  } catch {
    return normalized.message;
  }
}
