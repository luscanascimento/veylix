"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi } from "../lib/api-client";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const data = await fetchApi<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Redirect to login if unauthenticated on protected routes
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  const logout = async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, logout, refreshUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
