"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiClient, tokenStore } from "@/lib/api-client";
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
    const storedRefresh = localStorage.getItem("erp_refresh_token");

    if (
      storedUser &&
      storedRefresh &&
      storedRefresh !== "null" &&
      storedRefresh !== "undefined"
    ) {
      const savedUser: AuthUser = JSON.parse(storedUser);
      setUser(savedUser);

      apiClient
        .post<{ success: boolean; data: { accessToken: string } }>(
          "/auth/refresh",
          null,
          { headers: { Authorization: `Bearer ${storedRefresh}` } },
        )
        .then(({ data }) => {
          tokenStore.set(data.data.accessToken);
        })
        .catch(() => {
          // Refresh expirado, limpiar sesión
          setUser(null);
          tokenStore.clear();
          localStorage.removeItem("erp_user");
          localStorage.removeItem("erp_refresh_token");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: AuthTokens;
    }>("/auth/login", { email, password });

    const { accessToken, refreshToken, user: authUser } = data.data;

    tokenStore.set(accessToken);
    localStorage.setItem("erp_refresh_token", refreshToken);
    localStorage.setItem("erp_user", JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignorar errores de logout en el backend
    } finally {
      tokenStore.clear();
      localStorage.removeItem("erp_refresh_token");
      localStorage.removeItem("erp_user");
      setUser(null);
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
