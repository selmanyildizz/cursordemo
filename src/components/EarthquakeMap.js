import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EarthquakeMap.css';
import { calculateDistance } from '../utils/notificationUtils';
import { formatDate } from '../utils/dateUtils';

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

// Kullanıcı konumu için özel ikon
const userLocationIcon = L.divIcon({
  html: `
    <div style="
      background-color: #3182ce;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 4px;
      "></div>
    </div>
  `,
  className: 'user-location-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function EarthquakeMap({ earthquakes, userLocation, selectedEarthquake }) {
  const mapCenter = selectedEarthquake 
    ? [parseFloat(selectedEarthquake.geojson.coordinates[1]), parseFloat(selectedEarthquake.geojson.coordinates[0])]
    : userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : [39.0, 35.0];

  const validEarthquakes = earthquakes.filter(quake => {
    const lat = parseFloat(quake.geojson.coordinates[1]);
    const lng = parseFloat(quake.geojson.coordinates[0]);
    return !isNaN(lat) && !isNaN(lng);
  });

  console.log('Raw earthquakes data:', earthquakes);
  console.log('Valid earthquakes:', validEarthquakes);

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={selectedEarthquake ? 8 : 6} 
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Kullanıcı konumu */}
      {userLocation && (
        <>
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div>
                <h3>Konumunuz</h3>
                <p>Burası şu anki konumunuz</p>
              </div>
            </Popup>
          </Marker>
          {/* 100km yarıçaplı daire */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={100000} // 100km (metre cinsinden)
            pathOptions={{
              color: '#3182ce',
              fillColor: '#3182ce',
              fillOpacity: 0.1
            }}
          />
        </>
      )}

      {/* Deprem işaretleri */}
      {validEarthquakes.map((quake, index) => {
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
                {userLocation && (
                  <p><strong>Uzaklık:</strong> {Math.round(calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    lat,
                    lng
                  ))} km</p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default EarthquakeMap; 