import React from 'react';
import './EarthquakeList.css';

function EarthquakeList({ earthquakes }) {
  // Deprem şiddetine göre renk belirleme fonksiyonu
  const getCardColor = (magnitude) => {
    if (magnitude >= 5.0) return 'earthquake-card-severe';
    if (magnitude >= 4.0) return 'earthquake-card-moderate';
    return 'earthquake-card-mild';
  };

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
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
      return dateString; // Hata durumunda orijinal string'i göster
    }
  };

  return (
    <div className="earthquake-list">
      {earthquakes.map((quake, index) => {
        const lat = quake.geojson?.coordinates[1];
        const lng = quake.geojson?.coordinates[0];

        return (
          <div key={index} className={`earthquake-card ${getCardColor(quake.mag)}`}>
            <h3>{quake.title}</h3>
            <div className="earthquake-info">
              <p><strong>Büyüklük:</strong> {quake.mag}</p>
              <p><strong>Derinlik:</strong> {quake.depth} km</p>
              <p><strong>Tarih:</strong> {formatDate(quake.date)}</p>
              <p><strong>Koordinatlar:</strong> {lat}, {lng}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EarthquakeList; 