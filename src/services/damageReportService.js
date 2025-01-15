import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

// Hasar raporu ekle
export const addDamageReport = async (report) => {
  try {
    console.log('Gönderilen rapor:', report); // Debug için

    // Firestore'a raporu kaydet
    const docRef = await addDoc(collection(db, 'damageReports'), {
      location: report.location,
      coordinates: report.coordinates,
      description: report.description,
      timestamp: new Date().toISOString(),
      images: report.images
    });

    console.log('Rapor başarıyla kaydedildi:', docRef.id); // Debug için

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
    const q = query(collection(db, 'damageReports'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Hasar raporları alınırken hata:', error);
    throw error;
  }
}; 