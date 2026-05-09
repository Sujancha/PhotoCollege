const DB_NAME = 'carousel-studio-photos';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => { dbPromise = null; reject(e.target.error); };
    });
  }
  return dbPromise;
}

export async function loadSavedPhotos() {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = (e) => {
        const records = e.target.result || [];
        const photos = records
          .filter(r => r.blob instanceof Blob)
          .map(r => ({
            id: r.id,
            name: r.name,
            w: r.w,
            h: r.h,
            flipH: r.flipH || false,
            url: URL.createObjectURL(r.blob),
          }));
        resolve(photos);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function savePhoto(photo) {
  try {
    const blob = await fetch(photo.url).then(r => r.blob()).catch(() => null);
    if (!blob) return;
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      id: photo.id,
      name: photo.name,
      w: photo.w,
      h: photo.h,
      flipH: photo.flipH || false,
      blob,
    });
  } catch (e) {
    console.warn('Photo save failed:', e);
  }
}

export async function updatePhotoFlip(id, flipH) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = await new Promise((res) => {
      const req = store.get(id);
      req.onsuccess = e => res(e.target.result);
      req.onerror = () => res(null);
    });
    if (record) store.put({ ...record, flipH });
  } catch (e) {
    console.warn('Photo flip update failed:', e);
  }
}

export async function deletePhoto(id) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch (e) {
    console.warn('Photo delete failed:', e);
  }
}
