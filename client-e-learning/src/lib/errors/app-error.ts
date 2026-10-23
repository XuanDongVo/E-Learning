export type AppErrorSource = "api" | "network" | "http" | "unknown";

export interface AppErrorPayload {
  code?: unknown;
  message?: unknown;
  details?: unknown;
}

export class AppError extends Error {
  readonly code: string;
  readonly status: number | undefined;
  readonly details: unknown;
  readonly source: AppErrorSource;

  constructor(args: {
    code: string;
    message: string;
    status?: number;
    details?: unknown;
    source: AppErrorSource;
    cause?: unknown;
  }) {
    super(args.message, { cause: args.cause });
    this.name = "AppError";
    this.code = args.code;
    this.status = args.status;
    this.details = args.details;
    this.source = args.source;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError({
      code: "UNKNOWN_ERROR",
      message: error.message,
      source: "unknown",
      cause: error,
    });
  }
  return new AppError({
    code: "UNKNOWN_ERROR",
    message: "Request failed",
    source: "unknown",
    cause: error,
  });
}

export function appErrorMessageKey(code: string): string {
  if (["UNAUTHORIZED", "AUTHENTICATION_FAILED", "INVALID_TOKEN"].includes(code)) return "authentication";
  if (["FORBIDDEN", "STUDENT_NOT_IN_ACTIVE_CLASS", "ACTIVITY_SESSION_NOT_ACCESSIBLE"].includes(code)) return "forbidden";
  if (code === "VALIDATION_FAILED" || code === "INVALID_REQUEST" || code.includes("INVALID") || code.includes("REQUIRED") || code.includes("EXCEEDED") || code.includes("OUTSIDE") || code.includes("EMPTY") || code.includes("UNSUPPORTED") || code.includes("DETECTION_FAILED") || code === "QUESTION_NOT_IN_BANK") return "validation";
  if (code.endsWith("_NOT_FOUND")) return "notFound";
  if (code.endsWith("_ALREADY_EXISTS") || code.endsWith("_LOCKED") || code.endsWith("_NOT_READY") || code.endsWith("_IN_USE") || code.endsWith("_EXHAUSTED") || code.endsWith("_UNAVAILABLE") || code === "STUDENT_ALREADY_IN_CLASS" || code === "MEDIA_NOT_READY" || code === "ACTIVITY_SESSION_NOT_ACTIVE") return "conflict";
  if (code.startsWith("HTTP_") || code === "INTERNAL_ERROR" || code === "UNKNOWN_ERROR") return "server";
  return "generic";
}

/**
 * Prefer localized code-based messages. Preserve the server message as a
 * fallback for legacy/unmapped codes while the UI migrates incrementally.
 */
export function getAppErrorMessage(
  error: unknown,
  translate: (key: string) => string,
): string {
  const normalized = toAppError(error);
  try {
    return translate(Object.prototype.hasOwnProperty.call(errorCodeMessageKeys, normalized.code)
      ? errorCodeMessageKeys[normalized.code]
      : appErrorMessageKey(normalized.code));
  } catch {
    return normalized.message;
  }
}

const errorCodeMessageKeys: Record<string, string> = {
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
  GRADE_NOT_FOUND: "notFound",
  UNIT_NOT_FOUND: "notFound",
  SECTION_NOT_FOUND: "notFound",
  TOPIC_NOT_FOUND: "notFound",
  QUESTION_BANK_NOT_FOUND: "notFound",
  QUESTION_NOT_FOUND: "notFound",
  ACTIVITY_NOT_FOUND: "notFound",
  ASSIGNMENT_NOT_FOUND: "notFound",
  EMAIL_ALREADY_EXISTS: "emailAlreadyExists",
  CLASS_ALREADY_EXISTS: "conflict",
  STUDENT_ALREADY_IN_CLASS: "conflict",
  ACTIVITY_NOT_READY: "notReady",
  ASSIGNMENT_NOT_READY: "notReady",
  ASSIGNMENT_TIME_LIMIT_INVALID: "validation",
  ACTIVITY_SESSION_ANSWER_INVALID: "validation",
};
