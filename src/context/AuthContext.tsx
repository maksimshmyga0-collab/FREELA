import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, spec?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string, newPass: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loginAsDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    let mounted = true;
    authService
      .getCurrentSession()
      .then((user) => {
        if (mounted) {
          setCurrentUser(user);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setCurrentUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const user = await authService.login(email, pass);
    setCurrentUser(user);
  };

  const register = async (email: string, pass: string, name: string, spec?: string) => {
    const user = await authService.register(email, pass, name, spec);
    setCurrentUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const resetPassword = async (email: string, newPass: string) => {
    return await authService.resetPassword(email, newPass);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = await authService.updateProfile(currentUser.uid, updates);
    setCurrentUser(updated);
  };

  const loginAsDemo = async () => {
    const user = await authService.loginDemoUser();
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
