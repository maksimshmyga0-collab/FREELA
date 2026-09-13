import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  reload,
  applyActionCode,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { workspaceDb } from './db/workspaceDb';
import { UserProfile } from '../types';

export function mapFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Пользователь с таким email уже зарегистрирован. Пожалуйста, войдите.';
    case 'auth/invalid-email':
      return 'Некорректный адрес электронной почты.';
    case 'auth/operation-not-allowed':
      return 'Вход с помощью email и пароля не включен.';
    case 'auth/weak-password':
      return 'Пароль слишком простой. Используйте не менее 6 символов.';
    case 'auth/user-disabled':
      return 'Данная учетная запись была отключена администратором.';
    case 'auth/user-not-found':
      return 'Пользователь с таким email не найден.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Неверный адрес email или пароль.';
    case 'auth/too-many-requests':
      return 'Слишком много неудачных попыток. Пожалуйста, подождите немного перед повтором.';
    case 'auth/invalid-action-code':
      return 'Неверный или устаревший код ссылки подтверждения.';
    case 'auth/expired-action-code':
      return 'Срок действия ссылки подтверждения истек. Запросите новое письмо.';
    default:
      return err?.message || 'Произошла ошибка авторизации Firebase.';
  }
}

export class UnverifiedEmailError extends Error {
  public email: string;
  constructor(email: string) {
    super('Email не подтвержден. Пожалуйста, подтвердите вашу почту по ссылке из письма.');
    this.name = 'UnverifiedEmailError';
    this.email = email;
  }
}

export const authService = {
  // Check current session from Firebase Auth
  async getCurrentSession(): Promise<UserProfile | null> {
    workspaceDb.ensureCleanLocalAuth();

    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        unsubscribe();
        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          // If unverified, user needs to verify first
          if (!firebaseUser.emailVerified) {
            resolve(null);
            return;
          }

          const profile = await workspaceDb.ensureUserInitialized(firebaseUser);
          resolve(profile);
        } catch {
          resolve(null);
        }
      });
    });
  },

  // Initiate registration via Firebase Authentication and send real verification email
  async prepareRegistration(
    email: string,
    password: string,
    displayName: string,
    specialization?: string
  ): Promise<{ email: string; expiresAt: number; resendCooldown: number }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Укажите корректный адрес электронной почты');
    }
    if (!cleanName) {
      throw new Error('Пожалуйста, укажите ваше имя');
    }
    if (!password || password.length < 6) {
      throw new Error('Пароль должен содержать минимум 6 символов');
    }

    try {
      // 1. Create account in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCred.user;

      // 2. Set Firebase displayName
      if (cleanName) {
        await updateFirebaseProfile(user, { displayName: cleanName });
      }

      // 3. Send real Firebase verification email
      await sendEmailVerification(user);

      // 4. Create isolated User Profile in Firestore
      const now = new Date().toISOString();
      const profile: UserProfile = {
        uid: user.uid,
        email: cleanEmail,
        displayName: cleanName,
        specialization: specialization?.trim() || 'Фрилансер & Креатор',
        hourlyRate: 3500,
        currency: 'RUB',
        plan: 'free',
        status: 'active',
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      };

      try {
        await workspaceDb.saveUserProfile(profile);

        // 5. Initialize 100% EMPTY isolated workspace in Firestore
        await workspaceDb.saveWorkspace(user.uid, {
          clients: [],
          projects: [],
          tasks: [],
          finance: [],
          ideas: [],
          content: [],
          results: [],
          boards: [],
          boardItems: [],
        });
      } catch (dbErr) {
        console.warn('Initial Firestore provisioning deferred to verification:', dbErr);
      }

      return {
        email: cleanEmail,
        expiresAt: Date.now() + 15 * 60 * 1000,
        resendCooldown: 60,
      };
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err));
    }
  },

  // Check if current authenticated user has verified their email in Firebase
  async checkEmailVerified(): Promise<UserProfile | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      await reload(currentUser);
      if (currentUser.emailVerified) {
        const profile = await workspaceDb.ensureUserInitialized(currentUser);
        return profile;
      }
      return null;
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err));
    }
  },

  // Resend real Firebase verification email
  async resendVerificationEmail(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Пользовательская сессия не найдена. Пожалуйста, начните регистрацию заново.');
    }
    try {
      await sendEmailVerification(currentUser);
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err));
    }
  },

  // Apply action code if user pasted link/code from email
  async applyVerificationActionCode(codeOrUrl: string): Promise<UserProfile> {
    let oobCode = codeOrUrl.trim();
    // If user pasted the full URL from email
    if (oobCode.includes('oobCode=')) {
      try {
        const parsed = new URL(oobCode);
        oobCode = parsed.searchParams.get('oobCode') || oobCode;
      } catch {
        // fallback regex
        const match = oobCode.match(/oobCode=([a-zA-Z0-9_\-]+)/);
        if (match && match[1]) oobCode = match[1];
      }
    }

    try {
      await applyActionCode(auth, oobCode);
      if (auth.currentUser) {
        await reload(auth.currentUser);
        const profile = await workspaceDb.ensureUserInitialized(auth.currentUser);
        return profile;
      }
      throw new Error('Код подтвержден. Пожалуйста, войдите в аккаунт.');
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err));
    }
  },

  // Login with Firebase Authentication
  async login(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const user = cred.user;

      // Reload to ensure freshest emailVerified status
      await reload(user);

      if (!user.emailVerified) {
        // Automatically trigger a fresh verification email so user can easily verify
        try {
          await sendEmailVerification(user);
        } catch {
          // ignore rate limits on resend
        }
        throw new UnverifiedEmailError(cleanEmail);
      }

      // Order: Firebase Auth -> UID -> create/ensure document in Firestore -> load workspace
      const profile = await workspaceDb.ensureUserInitialized(user);
      return profile;
    } catch (err: any) {
      if (err instanceof UnverifiedEmailError) {
        throw err;
      }
      throw new Error(mapFirebaseAuthError(err));
    }
  },

  // Reset password via Firebase Authentication
  async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Укажите корректный адрес электронной почты');
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err));
    }
  },

  // Update profile
  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const updated = await workspaceDb.updateUserProfile(uid, updates);
    if (!updated) {
      throw new Error('Не удалось обновить профиль в Firestore');
    }
    return updated;
  },

  // Logout from Firebase
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      workspaceDb.ensureCleanLocalAuth();
    } catch (err: any) {
      console.warn('Sign out error:', err);
    }
  },
};
