"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, AuthUser, LoginRequest, RegisterRequest } from "./api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage keys
const ACCESS_TOKEN_KEY = "managepost_access_token";
const REFRESH_TOKEN_KEY = "managepost_refresh_token";

// Get tokens from localStorage
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Save tokens to localStorage
function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

// Clear tokens
function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        return;
      }

      try {
        const userData = await authApi.getProfile();
        setUser(userData);
      } catch {
        clearTokens();
      }
    };

    checkAuth().finally(() => setLoading(false));
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    saveTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    saveTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  };

  const logout = () => {
    authApi.logout();
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return default values when not within AuthProvider (e.g., auth pages)
    return {
      user: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      isAuthenticated: false,
    } as AuthContextType;
  }
  return context;
}
