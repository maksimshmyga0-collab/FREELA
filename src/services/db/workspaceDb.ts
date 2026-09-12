import {
  Client,
  Project,
  Task,
  FinanceRecord,
  Idea,
  ContentItem,
  ResultItem,
  UserProfile,
  Board,
  BoardItem,
} from '../../types';

export interface UserWorkspaceData {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  finance: FinanceRecord[];
  ideas: Idea[];
  content: ContentItem[];
  results: ResultItem[];
  boards?: Board[];
  boardItems?: BoardItem[];
}

export interface StoredUser {
  uid: string;
  email: string;
  passwordHash: string;
  salt: string;
  profile: UserProfile;
}

const DB_NAME = 'freela_saas_db';
const DB_VERSION = 1;
const STORE_USERS = 'users';
const STORE_WORKSPACES = 'workspaces';

// IndexedDB Helper with safety and fallback
class WorkspaceDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isIndexedDBAvailable: boolean = typeof window !== 'undefined' && 'indexedDB' in window;

  private async getDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable) {
      throw new Error('IndexedDB not supported in this environment');
    }

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_USERS)) {
            db.createObjectStore(STORE_USERS, { keyPath: 'uid' });
          }
          if (!db.objectStoreNames.contains(STORE_WORKSPACES)) {
            db.createObjectStore(STORE_WORKSPACES, { keyPath: 'userId' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.warn('IndexedDB open error, using fallback storage:', request.error);
          reject(request.error);
        };
      } catch (err) {
        reject(err);
      }
    });

    return this.dbPromise;
  }

  // Fallback to local storage namespace if IndexedDB is blocked
  private getFallbackStorage<T>(key: string, defaultVal: T): T {
    try {
      const raw = localStorage.getItem('freela_sec_' + key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setFallbackStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem('freela_sec_' + key, JSON.stringify(val));
    } catch {
      // ignore
    }
  }

  // --- USERS MANAGEMENT ---
  async getAllUsers(): Promise<StoredUser[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_USERS, 'readonly');
        const store = tx.objectStore(STORE_USERS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this.getFallbackStorage<StoredUser[]>('users', []));
      });
    } catch {
      return this.getFallbackStorage<StoredUser[]>('users', []);
    }
  }

  async findUserByEmail(email: string): Promise<StoredUser | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(uid: string): Promise<StoredUser | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.uid === uid) || null;
  }

  async saveUser(user: StoredUser): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_USERS, 'readwrite');
        const store = tx.objectStore(STORE_USERS);
        const req = store.put(user);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
      const users = this.getFallbackStorage<StoredUser[]>('users', []);
      const idx = users.findIndex((u) => u.uid === user.uid);
      if (idx >= 0) users[idx] = user;
      else users.push(user);
      this.setFallbackStorage('users', users);
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const user = await this.findUserById(uid);
    if (!user) return null;

    user.profile = {
      ...user.profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveUser(user);
    return user.profile;
  }

  // --- WORKSPACE DATA ISOLATION (ZERO DATA LEAKAGE) ---
  async getWorkspace(userId: string): Promise<UserWorkspaceData> {
    const emptyWorkspace: UserWorkspaceData = {
      clients: [],
      projects: [],
      tasks: [],
      finance: [],
      ideas: [],
      content: [],
      results: [],
      boards: [],
      boardItems: [],
    };

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_WORKSPACES, 'readonly');
        const store = tx.objectStore(STORE_WORKSPACES);
        const req = store.get(userId);
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            resolve(emptyWorkspace);
          }
        };
        req.onerror = () => {
          resolve(this.getFallbackStorage<UserWorkspaceData>(`ws_${userId}`, emptyWorkspace));
        };
      });
    } catch {
      return this.getFallbackStorage<UserWorkspaceData>(`ws_${userId}`, emptyWorkspace);
    }
  }

  async saveWorkspace(userId: string, data: UserWorkspaceData): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_WORKSPACES, 'readwrite');
        const store = tx.objectStore(STORE_WORKSPACES);
        const req = store.put({ userId, data, updatedAt: new Date().toISOString() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
      this.setFallbackStorage(`ws_${userId}`, data);
    }
  }
}

export const workspaceDb = new WorkspaceDatabase();
