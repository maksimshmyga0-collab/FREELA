// IndexedDB-based local image storage for CLARYFE Boards
// Isolates user files, prevents localStorage size limit issues, and ensures persistent loading across sessions.

const DB_NAME = 'freela_canvas_images_db';
const DB_VERSION = 1;
const STORE_IMAGES = 'images';

interface StoredImageRecord {
  id: string;
  userId: string;
  blob: Blob;
  mimeType: string;
  createdAt: string;
}

const memoryUrlCache = new Map<string, string>();

class ImageStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB not available'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          const store = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('Could not open image storage IndexedDB, falling back to data URLs', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Compress & optimize large images before saving to ensure 60fps canvas performance
  async optimizeImage(file: File | Blob, maxWidth = 1920, maxHeight = 1920): Promise<Blob> {
    return new Promise((resolve) => {
      // If SVG or small gif, keep as is
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return resolve(file);
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/webp',
          0.88
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  }

  // Save image file, returns unique image ID or data URL
  async saveImage(file: File | Blob, userId: string): Promise<string> {
    const optimized = await this.optimizeImage(file);
    const id = 'img_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);

    try {
      const db = await this.getDB();
      const record: StoredImageRecord = {
        id,
        userId,
        blob: optimized,
        mimeType: optimized.type || 'image/png',
        createdAt: new Date().toISOString(),
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_IMAGES, 'readwrite');
        const store = tx.objectStore(STORE_IMAGES);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      const url = URL.createObjectURL(optimized);
      memoryUrlCache.set(id, url);
      return id;
    } catch {
      // Fallback to base64 dataUrl if IndexedDB fails
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          memoryUrlCache.set(id, result);
          resolve(result);
        };
        reader.readAsDataURL(optimized);
      });
    }
  }

  // Retrieve an image URL (Object URL or base64) for display
  async getImageUrl(idOrUrl: string): Promise<string> {
    if (!idOrUrl) return '';

    // If already a data url or http url, return directly
    if (idOrUrl.startsWith('data:') || idOrUrl.startsWith('http://') || idOrUrl.startsWith('https://') || idOrUrl.startsWith('blob:')) {
      return idOrUrl;
    }

    // Check memory cache
    if (memoryUrlCache.has(idOrUrl)) {
      return memoryUrlCache.get(idOrUrl)!;
    }

    try {
      const db = await this.getDB();
      return new Promise<string>((resolve) => {
        const tx = db.transaction(STORE_IMAGES, 'readonly');
        const store = tx.objectStore(STORE_IMAGES);
        const req = store.get(idOrUrl);
        req.onsuccess = () => {
          const record = req.result as StoredImageRecord | undefined;
          if (record && record.blob) {
            const url = URL.createObjectURL(record.blob);
            memoryUrlCache.set(idOrUrl, url);
            resolve(url);
          } else {
            resolve('');
          }
        };
        req.onerror = () => resolve('');
      });
    } catch {
      return '';
    }
  }

  // Delete image
  async deleteImage(idOrUrl: string): Promise<void> {
    if (!idOrUrl || idOrUrl.startsWith('data:') || idOrUrl.startsWith('http')) return;

    if (memoryUrlCache.has(idOrUrl)) {
      const url = memoryUrlCache.get(idOrUrl);
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      memoryUrlCache.delete(idOrUrl);
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      const store = tx.objectStore(STORE_IMAGES);
      store.delete(idOrUrl);
    } catch {
      // ignore
    }
  }
}

export const imageStorage = new ImageStorage();
