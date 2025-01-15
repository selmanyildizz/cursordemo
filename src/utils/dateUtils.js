export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}; 