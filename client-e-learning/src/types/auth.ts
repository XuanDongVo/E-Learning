export type UserRole = "TEACHER" | "STUDENT";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}