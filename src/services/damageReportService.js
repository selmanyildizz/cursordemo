import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

// Hasar raporu ekle
export const addDamageReport = async (report) => {
  try {
    // Resimleri Firebase Storage'a yükle
    const uploadedImages = await Promise.all(
      report.images.map(async (image) => {
        try {
          // Base64 string'i Blob'a çevir
          const base64Response = await fetch(image.url);
          const blob = await base64Response.blob();

          // Storage'a yükle
          const fileName = `${Date.now()}-${image.name}`;
          const storageRef = ref(storage, `damage-reports/${fileName}`);
          await uploadBytes(storageRef, blob);
          const downloadUrl = await getDownloadURL(storageRef);

          return {
            url: downloadUrl,
            name: image.name
          };
        } catch (error) {
          console.error('Resim yükleme hatası:', error);
          throw error;
        }
      })
    );

    // Firestore'a sadece URL'leri kaydet
    const docRef = await addDoc(collection(db, 'damageReports'), {
      location: report.location,
      coordinates: report.coordinates,
      description: report.description,
      timestamp: new Date().toISOString(),
      images: uploadedImages.map(img => ({
        url: img.url,
        name: img.name
      }))
    });

    return {
      id: docRef.id,
      location: report.location,
      coordinates: report.coordinates,
      description: report.description,
      timestamp: new Date().toISOString(),
      images: uploadedImages
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