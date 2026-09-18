import type { AuthUser, LoginRequest } from "@/types/auth";
import { request } from "@/services/api.service";

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