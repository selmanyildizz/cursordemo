import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import EarthquakeList from './components/EarthquakeList';
import EarthquakeMap from './components/EarthquakeMap';
import Dashboard from './components/Dashboard';
import { requestNotificationPermission, calculateDistance } from './utils/notificationUtils';
import Logo from './components/Logo';
import Statistics from './components/Statistics';
import Footer from './components/Footer';
import ImageUpload from './components/ImageUpload';
import DamageReports from './components/DamageReports';
import { addDamageReport, getDamageReports } from './services/damageReportService';
import DamageReportForm from './components/DamageReportForm';
import * as localDB from './services/localDatabase';
import { initSync } from './services/syncService';
import { subscribeUserToPush, sendNotification } from './services/notificationService';

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [userLocation, setUserLocation] = useState(null);
  const [lastCheckedEarthquake, setLastCheckedEarthquake] = useState(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [damageReports, setDamageReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

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

  // Deprem verilerini çeken fonksiyon
  const fetchEarthquakes = async () => {
    try {
      const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live');
      const data = await response.json();
      
      if (data.status) {
        // Depremleri tarih sırasına göre sırala
        const sortedEarthquakes = data.result.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        // Son 100 depremi al
        return sortedEarthquakes.slice(0, 100);
      }
      return [];
    } catch (error) {
      console.error('Deprem verileri alınamadı:', error);
      return [];
    }
  };

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

  // Hasar raporlarını yükle
  useEffect(() => {
    const loadReports = async () => {
      try {
        const reports = await getDamageReports();
        setDamageReports(reports);
      } catch (error) {
        console.error('Raporlar yüklenirken hata:', error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    loadReports();
  }, []);

  // Hasar raporu ekleme fonksiyonu
  const handleAddDamageReport = async (report) => {
    try {
      const newReport = await addDamageReport(report);
      setDamageReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error('Rapor eklenirken hata:', error);
      // Burada kullanıcıya hata mesajı gösterilebilir
    }
  };

  // Offline veri senkronizasyonu
  useEffect(() => {
    const syncData = async () => {
      try {
        // Online ise verileri çek ve lokale kaydet
        if (navigator.onLine) {
          const earthquakes = await fetchEarthquakes();
          await localDB.saveEarthquakes(earthquakes);
          setEarthquakes(earthquakes);
        } else {
          // Offline ise lokal verileri kullan
          const localEarthquakes = await localDB.getEarthquakes();
          setEarthquakes(localEarthquakes);
        }
      } catch (error) {
        console.error('Veri senkronizasyonu hatası:', error);
      }
    };

    syncData();
  }, []);

  // Online/Offline durumu dinle
  useEffect(() => {
    const handleOnline = () => {
      console.log('Online moda geçildi');
      // Online olunca verileri güncelle
    };

    const handleOffline = () => {
      console.log('Offline moda geçildi');
      // Offline durumunu kullanıcıya bildir
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service worker ve sync başlatma
  useEffect(() => {
    const initApp = async () => {
      try {
        // Push notification'a abone ol
        await subscribeUserToPush();
        
        // Senkronizasyonu başlat
        initSync();
        
        // Offline durumu kontrol et
        if (!navigator.onLine) {
          sendNotification('Çevrimdışı Mod', {
            body: 'Şu anda çevrimdışı moddasınız. Veriler önbelleğe alınacak.'
          });
        }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initApp();
  }, []);

  return (
    <Router>
      <AppContent 
        earthquakes={earthquakes}
        loading={loading}
        view={view}
        setView={setView}
        userLocation={userLocation}
        selectedEarthquake={selectedEarthquake}
        setSelectedEarthquake={setSelectedEarthquake}
        damageReports={damageReports}
        addDamageReport={handleAddDamageReport}
        isLoadingReports={isLoadingReports}
      />
    </Router>
  );
}

// AppContent bileşeni
function AppContent({ 
  earthquakes, 
  loading, 
  view, 
  setView, 
  userLocation, 
  selectedEarthquake, 
  setSelectedEarthquake,
  damageReports,
  addDamageReport,
  isLoadingReports
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    setView('list');
    navigate('/');
  };

  const handleBackToHome = () => {
    setView('list');
    setSelectedEarthquake(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo-container" onClick={handleLogoClick}>
            <Logo />
          </div>
          <h1>Türkiye Deprem Takip</h1>
          <div className="view-buttons">
            <ImageUpload onSubmit={addDamageReport} />
            {location.pathname === '/' ? (
              view === 'map' ? (
                <button 
                  onClick={handleBackToHome}
                  className="back-button"
                >
                  ← Ana Sayfa
                </button>
              ) : null
            ) : (
              <button 
                className={location.pathname === '/statistics' ? '' : 'active'} 
                onClick={() => {
                  setView('list');
                  navigate('/');
                }}
              >
                Ana Sayfa
              </button>
            )}
            <button 
              className={location.pathname === '/statistics' ? 'active' : ''} 
              onClick={() => navigate('/statistics')}
            >
              İstatistikler
            </button>
            <button 
              className={location.pathname === '/damage-reports' ? 'active' : ''} 
              onClick={() => navigate('/damage-reports')}
            >
              Hasar Raporları
            </button>
          </div>
        </div>
      </header>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              view === 'map' ? (
                <EarthquakeMap 
                  earthquakes={earthquakes} 
                  userLocation={userLocation}
                  selectedEarthquake={selectedEarthquake}
                />
              ) : (
                <Dashboard 
                  earthquakes={earthquakes} 
                  userLocation={userLocation}
                  onEarthquakeSelect={setSelectedEarthquake}
                  setView={setView}
                />
              )
            } />
            <Route 
              path="/statistics" 
              element={<Statistics earthquakes={earthquakes} />} 
            />
            <Route 
              path="/allEarthquakes" 
              element={
                view === 'map' ? (
                  <EarthquakeMap 
                    earthquakes={earthquakes} 
                    userLocation={userLocation}
                    selectedEarthquake={selectedEarthquake}
                  />
                ) : (
                  <EarthquakeList 
                    earthquakes={earthquakes} 
                    userLocation={userLocation}
                  />
                )
              } 
            />
            <Route 
              path="/damage-reports" 
              element={<DamageReports reports={damageReports} />} 
            />
            <Route 
              path="/damage-reports/new" 
              element={<DamageReportForm onSubmit={addDamageReport} />} 
            />
          </Routes>
        </main>
      )}
      <Footer />
    </div>
  );
}

export default App; 