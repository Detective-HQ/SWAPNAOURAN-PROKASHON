"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: clerkLoaded, user: clerkUser } = useUser();
  const { getToken } = useClerkAuth();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const url = `${BASE_URL}/auth/me`;
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setUser(data?.data || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [clerkUser, getToken]);

  useEffect(() => {
    if (!clerkLoaded) return;
    void refreshUser();
  }, [clerkLoaded, clerkUser?.id, refreshUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading: !clerkLoaded || isLoading,
      refreshUser
    }),
    [user, isLoading, clerkLoaded, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
