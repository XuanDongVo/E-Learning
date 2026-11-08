"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import {
  endSession,
  subscribeToSessionEnd,
  type SessionEndReason,
} from "@/services/auth-session";
import { clearAttemptRuntimeStorage } from "@/services/student/assessment-attempt-runtime-store";
import type { AuthUser, LoginRequest } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  sessionEndReason: SessionEndReason | null;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clearTeacherDraftStorage() {
  if (typeof window === "undefined") return;
  try {
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith("elearning_question_draft:")) {
        window.localStorage.removeItem(key);
      }
    });
  } catch {
    // Account cleanup remains best-effort when browser storage is unavailable.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionEndReason, setSessionEndReason] =
    useState<SessionEndReason | null>(null);
  const sessionVersion = useRef(0);

  const clearLocalSession = useCallback(
    (reason: SessionEndReason) => {
      sessionVersion.current += 1;
      void queryClient.cancelQueries();
      queryClient.clear();
      clearAttemptRuntimeStorage();
      clearTeacherDraftStorage();
      setUser(null);
      setSessionEndReason(reason);
      setIsLoading(false);
    },
    [queryClient],
  );

  useEffect(
    () => subscribeToSessionEnd(clearLocalSession),
    [clearLocalSession],
  );

  const refreshUser = async () => {
    const version = sessionVersion.current;
    try {
      const response = await authService.me();
      if (version !== sessionVersion.current) return null;
      setUser(response.data);
      setSessionEndReason(null);
      return response.data;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const version = sessionVersion.current;
      let sessionUser: AuthUser | null = null;
      try {
        const response = await authService.me();
        sessionUser = response.data;
      } catch {
        sessionUser = null;
      }

      if (active && version === sessionVersion.current) {
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
    const version = sessionVersion.current + 1;
    sessionVersion.current = version;
    const response = await authService.login(credentials);
    if (!response.data) {
      throw new Error("Login response did not include a user");
    }
    if (version !== sessionVersion.current) {
      throw new Error("The authentication state changed while signing in");
    }
    queryClient.clear();
    clearAttemptRuntimeStorage();
    clearTeacherDraftStorage();
    setSessionEndReason(null);
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      endSession("logged_out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sessionEndReason,
        login,
        logout,
        refreshUser,
      }}
    >
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
