import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
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

export const workspaceDb = {
  // Ensure user profile and workspace exist in Firestore in the exact required order:
  // Firebase Auth -> get UID -> create user document in Firestore -> create/load workspace
  // Guarantees document creation happens BEFORE getDoc() is ever called.
  async ensureUserInitialized(
    firebaseUser: { uid: string; email?: string | null; displayName?: string | null; emailVerified?: boolean },
    extra?: { displayName?: string; specialization?: string }
  ): Promise<UserProfile> {
    const uid = firebaseUser.uid;
    const now = new Date().toISOString();

    const initialProfile: UserProfile = {
      uid,
      email: firebaseUser.email || '',
      displayName: extra?.displayName || firebaseUser.displayName || 'Пользователь CLARYFE',
      specialization: extra?.specialization || 'Фрилансер & Креатор',
      hourlyRate: 3500,
      currency: 'RUB',
      plan: 'free',
      status: 'active',
      emailVerified: !!firebaseUser.emailVerified,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Create/merge user document in Firestore FIRST before any getDoc
    const userRef = doc(db, 'users', uid);
    try {
      await setDoc(
        userRef,
        {
          ...initialProfile,
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Initial write to users document:', err);
    }

    // 2. Create/merge workspace document in Firestore
    const wsRef = doc(db, 'workspaces', uid);
    try {
      await setDoc(
        wsRef,
        {
          userId: uid,
          clients: [],
          projects: [],
          tasks: [],
          finance: [],
          ideas: [],
          content: [],
          results: [],
          boards: [],
          boardItems: [],
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Initial write to workspaces document:', err);
    }

    // 3. Document is now created, safely read back current data
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('Safely reading created profile from users document:', err);
    }

    return initialProfile;
  },

  // Get private user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!uid) return null;
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        return null;
      }
      return snap.data() as UserProfile;
    } catch (error) {
      console.warn(`Could not read profile for users/${uid}:`, error);
      return null;
    }
  },

  // Save or create user profile in Firestore
  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (!profile?.uid) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(
        userRef,
        {
          ...profile,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn(`Could not save user profile for users/${profile.uid}:`, error);
    }
  },

  // Update profile fields in Firestore
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!uid) return null;
    try {
      const userRef = doc(db, 'users', uid);
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, updatedData, { merge: true });
      const snap = await getDoc(userRef);
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch (error) {
      console.warn(`Could not update user profile for users/${uid}:`, error);
      return null;
    }
  },

  // Get user workspace from Firestore
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

    if (!userId) return emptyWorkspace;

    try {
      const wsRef = doc(db, 'workspaces', userId);
      const snap = await getDoc(wsRef);
      if (!snap.exists()) {
        // Initialize 100% empty workspace in Firestore for this new user
        await setDoc(wsRef, {
          userId,
          ...emptyWorkspace,
          updatedAt: new Date().toISOString(),
        });
        return emptyWorkspace;
      }
      const data = snap.data();
      return {
        clients: Array.isArray(data?.clients) ? data.clients : [],
        projects: Array.isArray(data?.projects) ? data.projects : [],
        tasks: Array.isArray(data?.tasks) ? data.tasks : [],
        finance: Array.isArray(data?.finance) ? data.finance : [],
        ideas: Array.isArray(data?.ideas) ? data.ideas : [],
        content: Array.isArray(data?.content) ? data.content : [],
        results: Array.isArray(data?.results) ? data.results : [],
        boards: Array.isArray(data?.boards) ? data.boards : [],
        boardItems: Array.isArray(data?.boardItems) ? data.boardItems : [],
      };
    } catch (error) {
      console.warn(`Could not read workspace for workspaces/${userId}:`, error);
      return emptyWorkspace;
    }
  },

  // Save workspace data into Firestore
  async saveWorkspace(userId: string, data: UserWorkspaceData): Promise<void> {
    if (!userId) return;
    try {
      const wsRef = doc(db, 'workspaces', userId);
      await setDoc(
        wsRef,
        {
          userId,
          clients: data.clients || [],
          projects: data.projects || [],
          tasks: data.tasks || [],
          finance: data.finance || [],
          ideas: data.ideas || [],
          content: data.content || [],
          results: data.results || [],
          boards: data.boards || [],
          boardItems: data.boardItems || [],
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn(`Could not write workspace for workspaces/${userId}:`, error);
    }
  },

  // Purge any lingering legacy local storage keys so auth is purely in Firebase
  ensureCleanLocalAuth(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem('freela_auth_session');
      localStorage.removeItem('freela_sec_users');
      localStorage.removeItem('freela_sec_pending');
      localStorage.removeItem('freela_pending_verification');
    } catch {
      // ignore
    }
  },
};
