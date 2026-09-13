import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, reload } from 'firebase/auth';
import { auth, testConnection } from '../services/firebase';
import { UserProfile } from '../types';
import { authService, UnverifiedEmailError } from '../services/authService';
import { workspaceDb } from '../services/db/workspaceDb';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, spec?: string) => Promise<void>;
  prepareRegistration: (
    email: string,
    pass: string,
    name: string,
    spec?: string
  ) => Promise<{ email: string; expiresAt: number; resendCooldown: number }>;
  completeRegistration: (codeOrUrl?: string) => Promise<void>;
  checkEmailVerified: () => Promise<UserProfile | null>;
  resendVerificationCode: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loginAsDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('claryfe_pending_email') || sessionStorage.getItem('freela_pending_email');
    } catch {
      return null;
    }
  });

  // Track pendingEmail in sessionStorage for page refresh survival
  const updatePendingEmail = (email: string | null) => {
    setPendingEmail(email);
    try {
      if (email) {
        sessionStorage.setItem('claryfe_pending_email', email);
      } else {
        sessionStorage.removeItem('claryfe_pending_email');
        sessionStorage.removeItem('freela_pending_email');
      }
    } catch {
      // ignore
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    // Purge legacy storage
    workspaceDb.ensureCleanLocalAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // If email is not yet verified, do not allow full access to workspace
        if (!firebaseUser.emailVerified) {
          updatePendingEmail(firebaseUser.email || null);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        // Email is verified! Initialize or load user profile in guaranteed order:
        // Auth -> UID -> create/ensure document in Firestore -> load workspace
        const profile = await workspaceDb.ensureUserInitialized(firebaseUser);

        updatePendingEmail(null);
        setCurrentUser(profile);
        testConnection().catch(() => {});
      } catch (err) {
        console.error('Error synchronizing Firebase user:', err);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const user = await authService.login(email, pass);
    updatePendingEmail(null);
    setCurrentUser(user);
  };

  const register = async (email: string, pass: string, name: string, spec?: string) => {
    await prepareRegistration(email, pass, name, spec);
  };

  const prepareRegistration = async (
    email: string,
    pass: string,
    name: string,
    spec?: string
  ) => {
    const res = await authService.prepareRegistration(email, pass, name, spec);
    updatePendingEmail(res.email);
    return res;
  };

  const checkEmailVerified = async (): Promise<UserProfile | null> => {
    const profile = await authService.checkEmailVerified();
    if (profile) {
      updatePendingEmail(null);
      setCurrentUser(profile);
    }
    return profile;
  };

  const completeRegistration = async (codeOrUrl?: string) => {
    if (codeOrUrl && codeOrUrl.trim()) {
      const profile = await authService.applyVerificationActionCode(codeOrUrl);
      updatePendingEmail(null);
      setCurrentUser(profile);
      return;
    }

    const verifiedProfile = await checkEmailVerified();
    if (!verifiedProfile) {
      throw new Error('Письмо пока не подтверждено. Пожалуйста, откройте письмо и перейдите по ссылке.');
    }
  };

  const resendVerificationCode = async () => {
    await authService.resendVerificationEmail();
  };

  const logout = async () => {
    await authService.logout();
    updatePendingEmail(null);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = await authService.updateProfile(currentUser.uid, updates);
    setCurrentUser(updated);
  };

  const loginAsDemo = async () => {
    // For demo/sandbox testing, if demo credentials exist or sign in
    // Note: User specified not to automatically copy mock data to users
    try {
      await login('demo@freela.app', 'demo123456');
    } catch {
      // If demo account doesn't exist in Firebase yet, create it
      await authService.prepareRegistration('demo@freela.app', 'demo123456', 'Демо Пользователь', 'Product & Brand Designer');
      await checkEmailVerified();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        pendingEmail,
        setPendingEmail: updatePendingEmail,
        login,
        register,
        prepareRegistration,
        completeRegistration,
        checkEmailVerified,
        resendVerificationCode,
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
