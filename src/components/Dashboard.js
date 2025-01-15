import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { formatDate } from '../utils/dateUtils';

// Deprem şiddetine göre renk belirleme fonksiyonu
const getCardColor = (magnitude) => {
  if (magnitude >= 5.0) return 'earthquake-card-severe';
  if (magnitude >= 4.0) return 'earthquake-card-moderate';
  return 'earthquake-card-mild';
};

const emergencyServices = [
  {
    name: "AFAD",
    description: "Afet ve Acil Durum Yönetimi Başkanlığı",
    link: "https://www.afad.gov.tr/",
    icon: "🏛️"
  },
  {
    name: "Kızılay",
    description: "Türk Kızılayı Resmi Web Sitesi",
    link: "https://www.kizilay.org.tr/",
    icon: "🌙"
  },
  {
    name: "112 Acil",
    description: "Acil Yardım Hattı",
    link: "tel:112",
    icon: "🚑"
  },
  // Daha fazla servis eklenebilir
];

function Dashboard({ earthquakes, onEarthquakeSelect, setView }) {
  const recentEarthquakes = earthquakes.slice(0, 10);

  const handleEarthquakeClick = (earthquake) => {
    onEarthquakeSelect(earthquake);
    setView('map');
  };

  return (
    <div className="dashboard-content">
      <div className="services-section">
        <h2>Acil Durum Servisleri</h2>
        <div className="services-grid">
          {emergencyServices.map((service, index) => (
            <a 
              key={index} 
              href={service.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="service-card"
            >
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="recent-earthquakes">
        <div className="recent-header">
          <h2>Son Depremler</h2>
          <Link to="/allEarthquakes" className="see-all-link">
            Hepsini Gör →
          </Link>
        </div>
        <div className="earthquakes-list">
          {recentEarthquakes.map((quake, index) => (
            <div 
              key={index} 
              className={`earthquake-mini-card ${getCardColor(quake.mag)}`}
              onClick={() => handleEarthquakeClick(quake)}
            >
              <h3>{quake.title}</h3>
              <div className="mini-card-info">
                <p><strong>Büyüklük:</strong> {quake.mag}</p>
                <p><strong>Derinlik:</strong> {quake.depth} km</p>
                <p><strong>Tarih:</strong> {formatDate(quake.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 