import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

// Resmi storage'a yükle
const uploadImage = async (imageFile) => {
  const storageRef = ref(storage, `damage-reports/${Date.now()}-${imageFile.name}`);
  await uploadBytes(storageRef, imageFile);
  return await getDownloadURL(storageRef);
};

// Hasar raporu ekle (Base64 ile)
export const addDamageReport = async (report) => {
  try {
    // Base64 formatında direkt olarak resimleri sakla
    const docRef = await addDoc(collection(db, 'damageReports'), {
      location: report.location,
      coordinates: report.coordinates,
      description: report.description,
      timestamp: new Date().toISOString(),
      images: report.images // Base64 formatında direkt sakla
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
    const q = query(
      collection(db, 'damageReports'), 
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      images: doc.data().images
    }));
  } catch (error) {
    console.error('Hasar raporları alınırken hata:', error);
    throw error;
  }
}; 