import { openDB } from 'idb';

const dbName = 'earthquakeDB';
const dbVersion = 1;

const initDB = async () => {
  const db = await openDB(dbName, dbVersion, {
    upgrade(db) {
      // Depremler için store
      if (!db.objectStoreNames.contains('earthquakes')) {
        db.createObjectStore('earthquakes', { keyPath: 'id' });
      }
      // Hasar raporları için store
      if (!db.objectStoreNames.contains('damageReports')) {
        db.createObjectStore('damageReports', { keyPath: 'id' });
      }
    },
  });
  return db;
};

export const saveEarthquakes = async (earthquakes) => {
  const db = await initDB();
  const tx = db.transaction('earthquakes', 'readwrite');
  const store = tx.objectStore('earthquakes');
  await Promise.all(earthquakes.map(eq => store.put(eq)));
  await tx.done;
};

export const getEarthquakes = async () => {
  const db = await initDB();
  return db.getAll('earthquakes');
};

export const saveDamageReport = async (report) => {
  const db = await initDB();
  const tx = db.transaction('damageReports', 'readwrite');
  const store = tx.objectStore('damageReports');
  await store.put(report);
  await tx.done;
};

export const getDamageReports = async () => {
  const db = await initDB();
  return db.getAll('damageReports');
}; 