import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EarthquakeMap.css';

const getMarkerIcon = (magnitude) => {
  let color = '#48bb78'; // yeşil (küçük depremler)
  if (magnitude >= 4.0) color = '#ecc94b'; // sarı
  if (magnitude >= 5.0) color = '#f56565'; // kırmızı

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 12px;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${magnitude}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

function EarthquakeMap({ earthquakes }) {
  const turkeyCenter = [39.0, 35.0];

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
      return dateString;
    }
  };

  // API verilerini kontrol et
  console.log('Raw earthquakes data:', earthquakes);

  // Koordinatları kontrol et ve geçerli olanları filtrele
  const validEarthquakes = earthquakes.filter(quake => {
    // Koordinatları kontrol et
    const lat = parseFloat(quake.geojson.coordinates[1]);
    const lng = parseFloat(quake.geojson.coordinates[0]);
    return !isNaN(lat) && !isNaN(lng);
  });

  console.log('Valid earthquakes:', validEarthquakes);

  return (
    <MapContainer center={turkeyCenter} zoom={6} className="map-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validEarthquakes.map((quake, index) => {
        // GeoJSON formatında koordinatlar [longitude, latitude] şeklinde gelir
        const lat = parseFloat(quake.geojson.coordinates[1]);
        const lng = parseFloat(quake.geojson.coordinates[0]);
        
        return (
          <Marker
            key={index}
            position={[lat, lng]}
            icon={getMarkerIcon(quake.mag)}
          >
            <Popup>
              <div>
                <h3>{quake.title}</h3>
                <p><strong>Büyüklük:</strong> {quake.mag}</p>
                <p><strong>Derinlik:</strong> {quake.depth} km</p>
                <p><strong>Tarih:</strong> {formatDate(quake.date)}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default EarthquakeMap; 