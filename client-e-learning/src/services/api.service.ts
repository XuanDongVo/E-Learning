import type { ApiResponse } from "@/types/auth";
import { AppError } from "@/lib/errors/app-error";
import { endSession, getSessionVersion } from "@/services/auth-session";

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
// In production, route /v1/* through the same-origin reverse proxy.
// Development continues to use the local Spring Boot server unless overridden.
export const API_BASE_URL = (
  configuredBaseUrl ??
  (process.env.NODE_ENV === "development" ? "http://localhost:8080" : "")
).replace(/\/+$/, "");

function buildUrl(path: string) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as ApiResponse<T>;
    } catch {
      // Fall through to the HTTP-level error below.
    }
  }
  const text = await response.text().catch(() => "");
  return {
    success: false,
    code: `HTTP_${response.status}`,
    message: text.trim() || `${response.status} ${response.statusText}` || "Request failed",
    data: null,
  };
}

async function fetchOrThrow(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (cause) {
    throw new AppError({
      code: "NETWORK_ERROR",
      message: "Network request failed",
      source: "network",
      cause,
    });
  }
}

const AUTH_RECOVERY_EXCLUDED_PATHS = new Set([
  "/v1/auth/login",
  "/v1/auth/refresh",
  "/v1/auth/logout",
]);
const REFRESH_LOCK_NAME = "learnup-auth-refresh";
let refreshPromise: Promise<void> | null = null;

function normalizedPath(path: string) {
  return `/${path.replace(/^\/+/, "").split("?", 1)[0]}`;
}

function isAuthRecoveryExcluded(path: string) {
  return AUTH_RECOVERY_EXCLUDED_PATHS.has(normalizedPath(path));
}

function throwApiError(
  body: ApiResponse<unknown>,
  status: number,
  source: "api" | "http" = "api",
): never {
  const code = body.code || `HTTP_${status}`;
  const serverMessage = body.message || "Request failed";
  throw new AppError({
    code,
    status,
    details: body.details,
    // Show the server's business message as-is; structured code stays in AppError.code.
    message: serverMessage,
    source: code.startsWith("HTTP_") ? "http" : source,
  });
}

async function parseError(response: Response) {
  return parseApiResponse<unknown>(response);
}

function sessionReason(body: ApiResponse<unknown>) {
  return body.code === "ACCOUNT_INACTIVE"
    ? "account_inactive"
    : "session_expired";
}

async function rawAuthRequest(path: string, init?: RequestInit) {
  return fetchOrThrow(buildUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

async function refreshInsideLock() {
  const probe = await rawAuthRequest("/v1/auth/me");
  if (probe.ok) return;

  const probeError = await parseError(probe);
  if (probe.status === 403 && probeError.code === "ACCOUNT_INACTIVE") {
    endSession("account_inactive");
    throwApiError(probeError, probe.status);
  }
  if (probe.status !== 401) {
    throwApiError(probeError, probe.status);
  }

  const refresh = await rawAuthRequest("/v1/auth/refresh", { method: "POST" });
  if (refresh.ok) return;

  const refreshError = await parseError(refresh);
  if (
    (refresh.status >= 400 && refresh.status < 500) ||
    refreshError.code === "ACCOUNT_INACTIVE"
  ) {
    endSession(sessionReason(refreshError));
  }
  throwApiError(refreshError, refresh.status);
}

async function coordinateRefresh() {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    await navigator.locks.request(
      REFRESH_LOCK_NAME,
      { mode: "exclusive" },
      () => refreshInsideLock(),
    );
    return;
  }
  await refreshInsideLock();
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = coordinateRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function executeWithRecovery<T>(
  path: string,
  operation: () => Promise<Response>,
  decodeSuccess: (response: Response) => Promise<T>,
  retried = false,
  version = getSessionVersion(),
): Promise<T> {
  const response = await operation();
  if (version !== getSessionVersion()) {
    throw new AppError({
      code: "SESSION_ENDED",
      message: "The authentication session ended before the request completed",
      source: "api",
    });
  }
  if (response.ok) {
    const result = await decodeSuccess(response);
    if (version !== getSessionVersion()) {
      throw new AppError({
        code: "SESSION_ENDED",
        message: "The authentication session ended before the request completed",
        source: "api",
      });
    }
    return result;
  }

  const body = await parseError(response);
  if (version !== getSessionVersion()) {
    throw new AppError({
      code: "SESSION_ENDED",
      message: "The authentication session ended before the request completed",
      source: "api",
    });
  }
  if (response.status === 403 && body.code === "ACCOUNT_INACTIVE") {
    endSession("account_inactive");
    throwApiError(body, response.status);
  }

  if (
    response.status === 401 &&
    !retried &&
    !isAuthRecoveryExcluded(path)
  ) {
    await refreshAccessToken();
    return executeWithRecovery(path, operation, decodeSuccess, true, version);
  }

  if (response.status === 401 && retried) {
    endSession("session_expired");
  }
  throwApiError(body, response.status);
}

export async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  return executeWithRecovery(
    path,
    () =>
      fetchOrThrow(buildUrl(path), {
        ...init,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...init?.headers,
        },
      }),
    async (response) => {
      const body = await parseApiResponse<T>(response);
      if (!body.success) throwApiError(body, response.status);
      return body;
    },
  );
}

export async function requestMultipart<T>(path: string, body: FormData): Promise<ApiResponse<T>> {
  return executeWithRecovery(
    path,
    () =>
      fetchOrThrow(buildUrl(path), {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
        body,
      }),
    async (response) => {
      const result = await parseApiResponse<T>(response);
      if (!result.success) throwApiError(result, response.status);
      return result;
    },
  );
}

export async function requestBlob(path: string, init?: RequestInit): Promise<Blob> {
  return executeWithRecovery(
    path,
    () =>
      fetchOrThrow(buildUrl(path), {
        ...init,
        credentials: "include",
        headers: { ...init?.headers },
      }),
    (response) => response.blob(),
  );
}
