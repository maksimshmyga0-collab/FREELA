import { UserProfile } from '../types';
import { workspaceDb, StoredUser } from './db/workspaceDb';

const SESSION_STORAGE_KEY = 'freela_auth_session';

// Secure Password Hashing with SHA-256 and Salt
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + ':::' + salt);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback hash for environments without subtle crypto
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const authService = {
  // Check current session
  async getCurrentSession(): Promise<UserProfile | null> {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { uid: string };
      if (!parsed?.uid) return null;

      const user = await workspaceDb.findUserById(parsed.uid);
      if (user) {
        return user.profile;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Register a new user with empty workspace
  async register(
    email: string,
    password: string,
    displayName: string,
    specialization?: string
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Укажите корректный адрес электронной почты');
    }
    if (!password || password.length < 6) {
      throw new Error('Пароль должен содержать минимум 6 символов');
    }
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Пожалуйста, укажите ваше имя');
    }

    const existing = await workspaceDb.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('Пользователь с таким email уже зарегистрирован');
    }

    const uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const now = new Date().toISOString();

    const profile: UserProfile = {
      uid,
      email: cleanEmail,
      displayName: displayName.trim(),
      specialization: specialization?.trim() || 'Фрилансер & Креатор',
      hourlyRate: 3500,
      currency: 'RUB',
      plan: 'free',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const storedUser: StoredUser = {
      uid,
      email: cleanEmail,
      passwordHash,
      salt,
      profile,
    };

    // Save user record
    await workspaceDb.saveUser(storedUser);

    // Initialize 100% EMPTY workspace for new user
    await workspaceDb.saveWorkspace(uid, {
      clients: [],
      projects: [],
      tasks: [],
      finance: [],
      ideas: [],
      content: [],
      results: [],
    });

    // Set active session
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ uid }));

    return profile;
  },

  // Login existing user
  async login(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await workspaceDb.findUserByEmail(cleanEmail);

    if (!user) {
      throw new Error('Неверный адрес email или пароль');
    }

    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      throw new Error('Неверный адрес email или пароль');
    }

    // Set active session
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ uid: user.uid }));
    return user.profile;
  },

  // Reset password
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await workspaceDb.findUserByEmail(cleanEmail);

    if (!user) {
      throw new Error('Пользователь с таким адресом email не найден');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Новый пароль должен содержать минимум 6 символов');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);

    user.salt = salt;
    user.passwordHash = passwordHash;
    await workspaceDb.saveUser(user);

    return true;
  },

  // Update profile
  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const updated = await workspaceDb.updateUserProfile(uid, updates);
    if (!updated) {
      throw new Error('Не удалось обновить профиль');
    }
    return updated;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  // Demo user for testing (optional sandbox without replacing personal registrations)
  async loginDemoUser(): Promise<UserProfile> {
    const demoEmail = 'demo@freela.app';
    let user = await workspaceDb.findUserByEmail(demoEmail);

    if (!user) {
      const uid = 'usr_demo_freela';
      const salt = generateSalt();
      const passwordHash = await hashPassword('demo123', salt);
      const now = new Date().toISOString();

      const profile: UserProfile = {
        uid,
        email: demoEmail,
        displayName: 'Демо Пользователь',
        specialization: 'Product & Brand Designer',
        hourlyRate: 3750,
        currency: 'RUB',
        plan: 'pro',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      user = {
        uid,
        email: demoEmail,
        passwordHash,
        salt,
        profile,
      };

      await workspaceDb.saveUser(user);

      // Import initial demo mock data ONLY for the demo account
      const {
        initialClients,
        initialProjects,
        initialTasks,
        initialFinance,
        initialIdeas,
        initialContent,
        initialResults,
      } = await import('../data/mockData');

      await workspaceDb.saveWorkspace(uid, {
        clients: initialClients.map((c) => ({ ...c, userId: uid })),
        projects: initialProjects.map((p) => ({ ...p, userId: uid })),
        tasks: initialTasks.map((t) => ({ ...t, userId: uid })),
        finance: initialFinance.map((f) => ({ ...f, userId: uid })),
        ideas: initialIdeas.map((i) => ({ ...i, userId: uid })),
        content: initialContent.map((c) => ({ ...c, userId: uid })),
        results: initialResults.map((r) => ({ ...r, userId: uid })),
      });
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ uid: user.uid }));
    return user.profile;
  },
};
