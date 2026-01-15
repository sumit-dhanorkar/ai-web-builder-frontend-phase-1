'use client';

/**
 * Authentication context for managing user authentication state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from './api-client';
import { jobStateManager } from './job-state';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  phone?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name?: string;
    company_name?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = apiClient['getToken']();
        if (!token) {
          setLoading(false);
          return;
        }

        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Verify token is still valid
        try {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error: any) {
          // Token expired or invalid
          if (error.status === 401) {
            // Try to refresh token
            try {
              await apiClient.refreshToken();
              const currentUser = await apiClient.getCurrentUser();
              setUser(currentUser);
              localStorage.setItem('user', JSON.stringify(currentUser));
            } catch (refreshError) {
              // Refresh failed, clear auth
              apiClient.clearToken();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);

      // Stay on current page after login (typically home page)
      // Users can navigate to builder or admin dashboard using nav buttons
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name?: string;
    company_name?: string;
    phone?: string;
  }) => {
    setLoading(true);
    try {
      await apiClient.register(data);
      // Auto-login after registration
      await login(data.email, data.password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      // Clear active job state from localStorage
      jobStateManager.clearActiveJob();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Higher-order component to protect routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Higher-order component to protect admin-only routes
 */
export function withAdmin<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function AdminComponent(props: P) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          // Not authenticated, redirect to login
          router.push('/login');
        } else if (!user?.is_admin) {
          // Authenticated but not admin, redirect to builder
          router.push('/builder');
        }
      }
    }, [isAuthenticated, loading, user, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated || !user?.is_admin) {
      return null;
    }

    return <Component {...props} />;
  };
}