export const formatDate = (dateString) => {
  try {
    // Safari için tarih formatını düzenleme
    const formattedDateString = dateString.replace(/-/g, '/');
    const date = new Date(formattedDateString);
    
    if (isNaN(date.getTime())) {
      // Alternatif parsing yöntemi
      const [datePart, timePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-');
      const [hour, minute, second] = timePart.split(':');
      
      // Manuel tarih oluşturma
      const manualDate = new Date(year, month - 1, day, hour, minute, second.split('.')[0]);
      
      if (isNaN(manualDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      return manualDate.toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
    
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Tarih dönüştürme hatası:', error);
    // API'den gelen orijinal tarihi göster
    return dateString;
  }
}; 