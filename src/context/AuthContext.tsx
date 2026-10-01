'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, UserProfile, getStoredToken, clearStoredToken } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(storedToken);
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        clearStoredToken();
        setUser(null);
        setToken(null);
      }
    } catch {
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.success || !res.data?.accessToken || !res.data?.user) {
      clearStoredToken();
      throw new Error(res.message || 'Authentication failed. Please verify credentials.');
    }

    setToken(res.data.accessToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Always clear local session even if the API call fails
    } finally {
      clearStoredToken();
      setUser(null);
      setToken(null);
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
