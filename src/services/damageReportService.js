import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addToSyncQueue } from './syncService';
import { openDB } from 'idb';

// Hasar raporu ekle
export const addDamageReport = async (report) => {
  try {
    // Önce internet bağlantısını kontrol et
    if (!navigator.onLine) {
      // Offline ise raporu sync kuyruğuna ekle
      await addToSyncQueue('ADD_DAMAGE_REPORT', report);
      
      // Kullanıcıya bilgi ver
      alert('İnternet bağlantısı yok. Raporunuz kaydedildi ve internet bağlantısı sağlandığında otomatik olarak gönderilecek.');
      
      // Geçici bir ID ile raporu döndür
      return {
        id: `temp_${Date.now()}`,
        ...report,
        pending: true // Bekleyen bir rapor olduğunu belirt
      };
    }

    // Online ise normal şekilde Firestore'a kaydet
    const docRef = await addDoc(collection(db, 'damageReports'), {
      location: report.location,
      coordinates: report.coordinates,
      description: report.description,
      timestamp: new Date().toISOString(),
      images: report.images
    });

    return {
      id: docRef.id,
      ...report
    };
  } catch (error) {
    console.error('Hasar raporu eklenirken hata:', error);
    throw error;
  }
};

// Tüm hasar raporlarını getir
export const getDamageReports = async () => {
  try {
    // Önce local storage'dan bekleyen raporları al
    const pendingReports = await getPendingReports();
    
    // Online değilse sadece bekleyen raporları göster
    if (!navigator.onLine) {
      return pendingReports;
    }

    // Online ise Firestore'dan raporları al ve birleştir
    const q = query(
      collection(db, 'damageReports'), 
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const firestoreReports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      pending: false
    }));

    // Bekleyen ve mevcut raporları birleştir
    return [...pendingReports, ...firestoreReports];
  } catch (error) {
    console.error('Hasar raporları alınırken hata:', error);
    throw error;
  }
};

// Bekleyen raporları local storage'dan al
const getPendingReports = async () => {
  try {
    const db = await openDB('syncDB', 1);
    const tx = db.transaction('syncStore', 'readonly');
    const store = tx.objectStore('syncStore');
    const pendingItems = await store.getAll();
    
    return pendingItems
      .filter(item => item.action === 'ADD_DAMAGE_REPORT')
      .map(item => ({
        ...item.data,
        pending: true
      }));
  } catch (error) {
    console.error('Bekleyen raporlar alınırken hata:', error);
    return [];
  }
}; 