import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import authService, { AuthUser } from '../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string, newPassword: string, confirmPassword: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const defaultContextValue: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  checkAuth: async () => {},
  error: null,
  clearError: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth on app load
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedToken = await authService.getToken();
      const savedUser = await authService.getUser();

      if (savedToken && savedUser) {
        // Verify token is still valid
        const isValid = await authService.verifyToken();
        if (isValid) {
          setToken(savedToken);
          setUser(savedUser);
        } else {
          // Token expired
          await authService.logout();
          setToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(email, password);
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.signup(fullName, email, password);
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setToken(null);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string, confirmPassword: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.resetPassword(email, newPassword, confirmPassword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isLoggedIn: !!token && !!user,
    login,
    signup,
    logout,
    resetPassword,
    checkAuth,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
