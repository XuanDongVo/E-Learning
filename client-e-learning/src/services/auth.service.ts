import type { ApiResponse, AuthUser, LoginRequest } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    throw new Error(body.message || "Request failed");
  }

  return body;
}

export const authService = {
  login(credentials: LoginRequest) {
    return request<AuthUser>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  me() {
    return request<AuthUser>("/v1/auth/me");
  },

  refresh() {
    return request<null>("/v1/auth/refresh", { method: "POST" });
  },

  logout() {
    return request<null>("/v1/auth/logout", { method: "POST" });
  },
};