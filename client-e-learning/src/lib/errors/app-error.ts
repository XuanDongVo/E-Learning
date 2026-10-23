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

const DEFAULT_ERROR_CODE = "UNKNOWN_ERROR";
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
        code: code ?? DEFAULT_ERROR_CODE,
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
    code: DEFAULT_ERROR_CODE,
    message,
    source: "unknown",
    cause: error,
  });
}

/**
 * Resolve the backend error code directly against the error translation
 * namespace. Business-specific code mapping does not belong in this layer.
 */
export function getAppErrorMessage(
  error: unknown,
  translate: (key: string) => string,
): string {
  const normalized = toAppError(error);

  try {
    const translated = translate(`errors.${normalized.code}`);
    return translated || normalized.message;
  } catch {
    return normalized.message;
  }
}
