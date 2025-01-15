import { openDB } from 'idb';
import { saveDamageReport } from './localDatabase';

const SYNC_DB_NAME = 'syncDB';
const SYNC_STORE_NAME = 'syncStore';

const initSyncDB = async () => {
  return openDB(SYNC_DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(SYNC_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    },
  });
};

// Senkronizasyon kuyruğuna ekle
export const addToSyncQueue = async (action, data) => {
  const db = await initSyncDB();
  await db.add(SYNC_STORE_NAME, {
    action,
    data,
    timestamp: Date.now()
  });
};

// Bekleyen senkronizasyonları işle
export const processSyncQueue = async () => {
  const db = await initSyncDB();
  const queue = await db.getAll(SYNC_STORE_NAME);

  for (const item of queue) {
    try {
      switch (item.action) {
        case 'ADD_DAMAGE_REPORT':
          await saveDamageReport(item.data);
          break;
        // Diğer action'lar eklenebilir
      }
      await db.delete(SYNC_STORE_NAME, item.id);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
};

// Online durumu dinle ve senkronize et
export const initSync = () => {
  window.addEventListener('online', async () => {
    await processSyncQueue();
  });
}; 