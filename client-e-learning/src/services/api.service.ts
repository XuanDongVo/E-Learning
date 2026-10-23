import type { ApiResponse } from "@/types/auth";
import { AppError } from "@/lib/errors/app-error";

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
export const API_BASE_URL = (configuredBaseUrl || "http://localhost:8080").replace(/\/+$/, "");

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

function throwApiError(
  body: ApiResponse<unknown>,
  status: number,
  source: "api" | "http" = "api",
): never {
  const code = body.code || `HTTP_${status}`;
  const serverMessage = body.message || "Request failed";
  // Preserve the existing Error.message contract for consumers not migrated yet.
  throw new AppError({
    code,
    status,
    details: body.details,
    message: `[${code}] ${serverMessage}`,
    source: code.startsWith("HTTP_") ? "http" : source,
  });
}

export async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetchOrThrow(buildUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = await parseApiResponse<T>(response);
  if (!response.ok || !body.success) throwApiError(body, response.status);
  return body;
}

export async function requestMultipart<T>(path: string, body: FormData): Promise<ApiResponse<T>> {
  const response = await fetchOrThrow(buildUrl(path), {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
    body,
  });
  const result = await parseApiResponse<T>(response);
  if (!response.ok || !result.success) throwApiError(result, response.status);
  return result;
}

export async function requestBlob(path: string, init?: RequestInit): Promise<Blob> {
  const response = await fetchOrThrow(buildUrl(path), {
    ...init,
    credentials: "include",
    headers: { ...init?.headers },
  });
  if (!response.ok) {
    const body = await parseApiResponse<unknown>(response);
    throwApiError(body, response.status, "http");
  }
  return response.blob();
}
