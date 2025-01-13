import React, { useState, useEffect } from 'react';
import './App.css';
import EarthquakeList from './components/EarthquakeList';
import EarthquakeMap from './components/EarthquakeMap';
import { requestNotificationPermission, sendNotification, calculateDistance } from './utils/notificationUtils';

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [userLocation, setUserLocation] = useState(null);
  const [lastCheckedEarthquake, setLastCheckedEarthquake] = useState(null);

  // Konum izni ve bildirim izni alma
  useEffect(() => {
    const setupPermissions = async () => {
      // Bildirim izni
      await requestNotificationPermission();
      
      // Konum izni
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error("Konum alınamadı:", error);
          }
        );
      }
    };

    setupPermissions();
  }, []);

  // Deprem verilerini çekme ve kontrol etme
  useEffect(() => {
    const checkEarthquakes = async () => {
      try {
        const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live');
        const data = await response.json();
        
        if (data && data.result) {
          setEarthquakes(data.result);

          // Yeni deprem kontrolü
          if (userLocation && data.result.length > 0) {
            const latestEarthquake = data.result[0];
            
            // Son kontrol edilen depremden farklı mı?
            if (!lastCheckedEarthquake || lastCheckedEarthquake.date !== latestEarthquake.date) {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                latestEarthquake.geojson.coordinates[1],
                latestEarthquake.geojson.coordinates[0]
              );

              // Kullanıcıya 100km yakınında ve 3+ büyüklüğünde deprem olduysa bildirim gönder
              if (distance <= 100 && latestEarthquake.mag >= 3) {
                sendNotification(
                  "Yakınınızda Deprem!",
                  {
                    body: `${latestEarthquake.title}\nBüyüklük: ${latestEarthquake.mag}\nUzaklık: ${Math.round(distance)} km`,
                    icon: "/earthquake-icon.png", // İkon ekleyebilirsiniz
                    vibrate: [200, 100, 200]
                  }
                );
              }

              setLastCheckedEarthquake(latestEarthquake);
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Veri çekerken hata oluştu:', error);
        setLoading(false);
      }
    };

    // İlk kontrol
    checkEarthquakes();

    // Her 5 dakikada bir kontrol et
    const interval = setInterval(checkEarthquakes, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userLocation, lastCheckedEarthquake]);

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
            <EarthquakeMap earthquakes={earthquakes} userLocation={userLocation} />
          ) : (
            <EarthquakeList earthquakes={earthquakes} userLocation={userLocation} />
          )}
        </>
      )}
    </div>
  );
}

export default App; 