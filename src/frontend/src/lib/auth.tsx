import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useGetCallerRole, useGetCallerUserProfile } from "../hooks/useBackend";
import type { UserRole } from "../types";

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  role: UserRole;
  roleLoading: boolean;
  profileName: string | null;
  profileLoading: boolean;
  profileFetched: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { login, clear, isAuthenticated, isInitializing, loginStatus } =
    useInternetIdentity();
  const queryClient = useQueryClient();

  const roleQuery = useGetCallerRole();
  const profileQuery = useGetCallerUserProfile();

  const role: UserRole = useMemo(() => {
    const raw = roleQuery.data ?? "guest";
    if (raw === "admin") return "admin";
    if (raw === "user" || raw === "partner") return "partner";
    return "guest";
  }, [roleQuery.data]);

  const profileName: string | null = useMemo(() => {
    if (profileQuery.data && "name" in profileQuery.data) {
      return profileQuery.data.name ?? null;
    }
    return null;
  }, [profileQuery.data]);

  const logout = () => {
    clear();
    queryClient.clear();
  };

  const value: AuthContextValue = {
    isAuthenticated,
    isInitializing,
    isLoggingIn: loginStatus === "logging-in",
    role,
    roleLoading: roleQuery.isLoading,
    profileName,
    profileLoading: profileQuery.isLoading,
    profileFetched: profileQuery.isFetched,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
