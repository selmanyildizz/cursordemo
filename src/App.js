import React, { useState, useEffect } from 'react';
import './App.css';
import EarthquakeList from './components/EarthquakeList';
import EarthquakeMap from './components/EarthquakeMap';

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('a');

  useEffect(() => {
    fetchEarthquakes();
  }, []);

  const fetchEarthquakes = async () => {
    try {
      const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live');
      const data = await response.json();
      
      // API yanıtını kontrol et
      console.log('API response:', data);
      
      if (data && data.result) {
        setEarthquakes(data.result);
      }
      setLoading(false);
    } catch (error) {
      console.error('Veri çekerken hata oluştu:', error);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Türkiye Deprem Takip</h1>
        <div className="view-buttons">
          <button 
            className={view === 'list' ? 'active' : ''} 
            onClick={() => setView('list')}
          >
            Liste Görünümü
          </button>
          <button 
            className={view === 'map' ? 'active' : ''} 
            onClick={() => setView('map')}
          >
            Harita Görünümü
          </button>
        </div>
      </header>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          {view === 'map' ? (
            <EarthquakeMap earthquakes={earthquakes} />
          ) : (
            <EarthquakeList earthquakes={earthquakes} />
          )}
        </>
      )}
    </div>
  );
}

export default App; 