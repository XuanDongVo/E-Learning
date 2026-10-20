import type { ApiResponse } from "@/types/auth";

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
      // Fall through to a useful HTTP-level error below.
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

export async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await parseApiResponse<T>(response);
  if (!response.ok || !body.success) {
    throw new Error(`[${body.code}] ${body.message || "Request failed"}`);
  }

  return body;
}

export async function requestMultipart<T>(path: string, body: FormData): Promise<ApiResponse<T>> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    body,
  });

  const result = await parseApiResponse<T>(response);
  if (!response.ok || !result.success) {
    throw new Error(`[${result.code}] ${result.message || "Request failed"}`);
  }

  return result;
}

export async function requestBlob(path: string, init?: RequestInit): Promise<Blob> {
  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await parseApiResponse<unknown>(response);
    throw new Error(`[${body.code}] ${body.message || "Request failed"}`);
  }

  return response.blob();
}
