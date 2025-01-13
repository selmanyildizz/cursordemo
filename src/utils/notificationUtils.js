// Bildirim izni isteme
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("Bu tarayıcı bildirim desteği sunmuyor");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

// Bildirim gönderme
export const sendNotification = (title, options) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};

// İki nokta arasındaki mesafeyi hesaplama (km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}; 