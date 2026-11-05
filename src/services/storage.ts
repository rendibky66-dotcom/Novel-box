import { Novel, UserProfile, ReadingSettings } from '../types';
import { INITIAL_NOVELS, INITIAL_USER } from '../data/initialNovels';

const STORAGE_KEYS = {
  NOVELS: 'novelbox_novels_v1',
  USER: 'novelbox_user_v1',
  SETTINGS: 'novelbox_reader_settings_v1',
  THEME_MODE: 'novelbox_theme_mode_v1',
  FIREBASE_CONFIG: 'novelbox_custom_firebase_config_v1'
};

const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 18,
  fontFamily: 'serif',
  lineHeight: 1.8,
  theme: 'midnight',
  brightness: 100,
  autoScroll: false
};

// IndexedDB Helper for local offline caching of large files
const DB_NAME = 'NovelBoxDB';
const DB_VERSION = 1;
const STORE_NAME = 'novels_store';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export const StorageService = {
  // Current user helper
  getCurrentUserId(): string {
    const user = StorageService.getUser();
    return user?.id || 'user-rendy';
  },

  // Load all novels (Online Server Database first, then IndexedDB fallback)
  async getNovels(): Promise<Novel[]> {
    const userId = StorageService.getCurrentUserId();

    // 1. Try fetching from Online Server API
    try {
      const res = await fetch(`/api/novels?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.novels && Array.isArray(data.novels) && data.novels.length > 0) {
          // Cache in IndexedDB
          StorageService.cacheNovelsLocally(data.novels);
          return data.novels;
        } else if (data.isInitial) {
          // First time for this user: initialize with initial seed and sync online
          await StorageService.syncNovelsOnline(userId, INITIAL_NOVELS);
          StorageService.cacheNovelsLocally(INITIAL_NOVELS);
          return INITIAL_NOVELS;
        }
      }
    } catch (err) {
      console.warn('Server offline or network issue, using local database cache:', err);
    }

    // 2. Fallback to IndexedDB / localStorage
    return StorageService.getLocalNovels();
  },

  async getLocalNovels(): Promise<Novel[]> {
    try {
      const db = await openIndexedDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const list = request.result as Novel[];
          if (list && list.length > 0) {
            resolve(list);
          } else {
            const local = localStorage.getItem(STORAGE_KEYS.NOVELS);
            if (local) {
              try {
                const parsed = JSON.parse(local);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  return resolve(parsed);
                }
              } catch {}
            }
            resolve(INITIAL_NOVELS);
          }
        };
        request.onerror = () => resolve(INITIAL_NOVELS);
      });
    } catch {
      return INITIAL_NOVELS;
    }
  },

  async cacheNovelsLocally(novels: Novel[]): Promise<void> {
    try {
      const lightweight = novels.map(n => ({
        ...n,
        fileData: n.fileData && n.fileData.length > 200000 ? undefined : n.fileData
      }));
      localStorage.setItem(STORAGE_KEYS.NOVELS, JSON.stringify(lightweight));

      const db = await openIndexedDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      novels.forEach(novel => store.put(novel));
    } catch (e) {
      console.warn('Local cache update skipped:', e);
    }
  },

  // Save all novels (Sync Online + Local)
  async saveNovels(novels: Novel[]): Promise<void> {
    const userId = StorageService.getCurrentUserId();
    await StorageService.cacheNovelsLocally(novels);

    // Sync to Online Server
    await StorageService.syncNovelsOnline(userId, novels);
  },

  async syncNovelsOnline(userId: string, novels: Novel[]): Promise<void> {
    try {
      await fetch('/api/novels/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, novels })
      });
    } catch (err) {
      console.warn('Failed to sync novels online:', err);
    }
  },

  // Update a single novel (Sync Online + Local)
  async updateNovel(updatedNovel: Novel): Promise<Novel[]> {
    const userId = StorageService.getCurrentUserId();
    const list = await StorageService.getLocalNovels();
    const index = list.findIndex(n => n.id === updatedNovel.id);
    let newList: Novel[];
    if (index >= 0) {
      newList = [...list];
      newList[index] = updatedNovel;
    } else {
      newList = [updatedNovel, ...list];
    }

    await StorageService.cacheNovelsLocally(newList);

    // Sync single novel online
    try {
      await fetch(`/api/novels/${encodeURIComponent(updatedNovel.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, novel: updatedNovel })
      });
    } catch (err) {
      console.warn('Online sync failed for update:', err);
    }

    return newList;
  },

  // Add a novel (Sync Online + Local)
  async addNovel(novel: Novel): Promise<Novel[]> {
    const userId = StorageService.getCurrentUserId();
    const list = await StorageService.getLocalNovels();
    const newList = [novel, ...list];

    await StorageService.cacheNovelsLocally(newList);

    // Post to Online Server
    try {
      await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, novel })
      });
    } catch (err) {
      console.warn('Online sync failed for add:', err);
    }

    return newList;
  },

  // Delete a novel (Sync Online + Local)
  async deleteNovel(id: string): Promise<Novel[]> {
    const userId = StorageService.getCurrentUserId();
    const list = await StorageService.getLocalNovels();
    const newList = list.filter(n => n.id !== id);

    await StorageService.cacheNovelsLocally(newList);

    try {
      await fetch(`/api/novels/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Online sync failed for delete:', err);
    }

    return newList;
  },

  // Toggle Favorite
  async toggleFavorite(id: string): Promise<Novel[]> {
    const list = await StorageService.getLocalNovels();
    let updatedNovel: Novel | null = null;
    const newList = list.map(n => {
      if (n.id === id) {
        updatedNovel = { ...n, isFavorite: !n.isFavorite };
        return updatedNovel;
      }
      return n;
    });

    await StorageService.cacheNovelsLocally(newList);
    if (updatedNovel) {
      StorageService.updateNovel(updatedNovel);
    }
    return newList;
  },

  // User Profile
  getUser(): UserProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Budi Hartono' || !parsed.name) {
          parsed.name = 'Rendy Prayoga';
          parsed.email = 'rendibky66@gmail.com';
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}
    return INITIAL_USER;
  },

  saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Also sync profile online
    try {
      fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          bio: user.bio,
          readingGoalPerYear: user.readingGoalPerYear,
          avatar: user.avatar
        })
      }).catch(() => {});
    } catch {}
  },

  // Online Authentication (Works across HP and Laptop!)
  async loginUserOnline(email: string, pass: string): Promise<UserProfile> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal masuk akun.');
      }
      StorageService.saveUser(data.user);
      return data.user;
    } catch (err: any) {
      // Local fallback
      if (email.toLowerCase().includes('rendy') || email.toLowerCase().includes('budi')) {
        StorageService.saveUser(INITIAL_USER);
        return INITIAL_USER;
      }
      throw err;
    }
  },

  async registerUserOnline(name: string, email: string, pass: string): Promise<UserProfile> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat akun.');
      }
      StorageService.saveUser(data.user);
      return data.user;
    } catch (err: any) {
      throw err;
    }
  },

  // Reading Settings
  getReadingSettings(): ReadingSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  },

  saveReadingSettings(settings: ReadingSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // App Theme
  getThemeMode(): 'dark' | 'light' {
    return (localStorage.getItem(STORAGE_KEYS.THEME_MODE) as 'dark' | 'light') || 'dark';
  },

  saveThemeMode(mode: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  },

  // Export Library JSON
  async exportLibraryJSON(): Promise<string> {
    const novels = await StorageService.getNovels();
    const user = StorageService.getUser();
    const exportData = {
      app: 'NOVEL_BOX',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      novels
    };
    return JSON.stringify(exportData, null, 2);
  },

  // Import Library JSON
  async importLibraryJSON(jsonString: string): Promise<Novel[]> {
    try {
      const data = JSON.parse(jsonString);
      if (!data.novels || !Array.isArray(data.novels)) {
        throw new Error('Format file backup tidak valid.');
      }
      await StorageService.saveNovels(data.novels);
      if (data.user) {
        StorageService.saveUser(data.user);
      }
      return data.novels;
    } catch (err: any) {
      throw new Error(err.message || 'Gagal memproses file cadangan.');
    }
  },

  // Reset to default sample library
  async resetToDefaults(): Promise<Novel[]> {
    await StorageService.saveNovels(INITIAL_NOVELS);
    StorageService.saveUser(INITIAL_USER);
    return INITIAL_NOVELS;
  }
};
