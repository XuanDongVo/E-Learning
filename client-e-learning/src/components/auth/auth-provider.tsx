"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginRequest } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await authService.me();
      setUser(response.data);
      return response.data;
    } catch {
      try {
        await authService.refresh();
        const response = await authService.me();
        setUser(response.data);
        return response.data;
      } catch {
        setUser(null);
        return null;
      }
    }
  };

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      let sessionUser: AuthUser | null = null;
      try {
        const response = await authService.me();
        sessionUser = response.data;
      } catch {
        try {
          await authService.refresh();
          const response = await authService.me();
          sessionUser = response.data;
        } catch {
          sessionUser = null;
        }
      }

      if (active) {
        setUser(sessionUser);
        setIsLoading(false);
      }
    };

    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    if (!response.data) {
      throw new Error("Login response did not include a user");
    }
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}