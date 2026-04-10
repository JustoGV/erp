"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiClient, tokenStore } from "@/lib/api-client";
import { clearQueryCache } from "@/components/providers/QueryProvider";
import type { AuthUser, AuthTokens } from "@/lib/api-types";

export type { UserRole } from "@/lib/api-types";
export type { AuthUser as User } from "@/lib/api-types";

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al montar: restaurar usuario desde localStorage y el access token
  useEffect(() => {
    const storedUser = localStorage.getItem("erp_user");
    const storedAccess = localStorage.getItem("erp_access_token");

    if (storedUser) {
      try {
        const savedUser: AuthUser = JSON.parse(storedUser);
        setUser(savedUser);
      } catch {
        localStorage.removeItem("erp_user");
      }
    }

    if (storedAccess && storedAccess !== "null" && storedAccess !== "undefined") {
      tokenStore.set(storedAccess);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", { email, password });

    const accessToken =
      (data as { accessToken?: string }).accessToken ??
      (data as { data?: { accessToken?: string } }).data?.accessToken;
    const authUser =
      (data as { user?: AuthTokens["user"] }).user ??
      (data as { data?: { user?: AuthTokens["user"] } }).data?.user;

    if (!accessToken || !authUser) {
      throw new Error("Login response missing token or user");
    }

    tokenStore.set(accessToken);
    localStorage.setItem("erp_access_token", accessToken);
    localStorage.setItem("erp_user", JSON.stringify(authUser));
    localStorage.removeItem("selectedLocalId");
    localStorage.removeItem("selectedLocal");
    clearQueryCache(); // limpiar datos del usuario anterior
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignorar errores de logout en el backend
    } finally {
      tokenStore.clear();
      localStorage.removeItem("erp_access_token");
      localStorage.removeItem("erp_user");
      localStorage.removeItem("selectedLocalId");
      localStorage.removeItem("selectedLocal");
      // Hard redirect: limpia todo el estado de React Query y de memoria
      window.location.href = "/login";
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
