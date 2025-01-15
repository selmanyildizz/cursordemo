import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Slider from 'react-slick';
import 'leaflet/dist/leaflet.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import L from 'leaflet';
import './DamageReports.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DamageReports = ({ reports, isLoading }) => {
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const mapSettings = useMemo(() => {
    if (reports.length === 0) {
      return { center: [39.0, 35.0], zoom: 6 };
    }

    const lats = reports.map(r => r.coordinates.lat);
    const lngs = reports.map(r => r.coordinates.lng);

    const center = [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2
    ];

    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 6;
    if (maxDiff < 0.1) zoom = 13;
    else if (maxDiff < 0.5) zoom = 11;
    else if (maxDiff < 1) zoom = 10;
    else if (maxDiff < 2) zoom = 9;
    else if (maxDiff < 4) zoom = 8;
    else if (maxDiff < 8) zoom = 7;

    return { center, zoom };
  }, [reports]);

  if (isLoading) {
    return (
      <div className="damage-reports">
        <div className="loading">
          <p>Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="damage-reports">
        <div className="no-reports">
          <h2>Henüz hasar raporu bulunmuyor</h2>
          <p>Hasar bildirimi yapmak için üst menüdeki "Hasar Bildir" butonunu kullanabilirsiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="damage-reports">
      <div className="map-section">
        <h2>Hasar Bildirim Haritası</h2>
        <div className="map-container">
          <MapContainer 
            center={mapSettings.center}
            zoom={mapSettings.zoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {reports.map((report) => (
              <Marker 
                key={report.id}
                position={[report.coordinates.lat, report.coordinates.lng]}
              >
                <Popup>
                  <div className="report-popup">
                    <img src={report.images[0].url} alt="Hasar fotoğrafı" />
                    <p>{report.description}</p>
                    <small>{new Date(report.timestamp).toLocaleString()}</small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="reports-section">
        <h2>Hasar Raporları</h2>
        <div className="reports-carousel">
          <Slider {...sliderSettings}>
            {reports.map((report) => (
              <div key={report.id} className="report-slide">
                <div className={`report-card ${report.pending ? 'pending' : ''}`}>
                  {report.pending && (
                    <div className="pending-badge">
                      Gönderim Bekliyor
                    </div>
                  )}
                  <div className="report-images">
                    {report.images.map((image, imgIndex) => (
                      <img 
                        key={imgIndex} 
                        src={image.url} 
                        alt={`Hasar fotoğrafı ${imgIndex + 1}`} 
                      />
                    ))}
                  </div>
                  <div className="report-info">
                    <p className="location">{report.location}</p>
                    <p className="description">{report.description}</p>
                    <p className="timestamp">
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default DamageReports; 