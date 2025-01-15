import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import EarthquakeList from './components/EarthquakeList';
import EarthquakeMap from './components/EarthquakeMap';
import Dashboard from './components/Dashboard';
import { requestNotificationPermission, calculateDistance, sendNotification } from './utils/notificationUtils';
import Logo from './components/Logo';
import Statistics from './components/Statistics';
import Footer from './components/Footer';
import ImageUpload from './components/ImageUpload';
import DamageReports from './components/DamageReports';
import { addDamageReport, getDamageReports } from './services/damageReportService';
import DamageReportForm from './components/DamageReportForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  // Deprem verilerini çekme ve kontrol etme
  useEffect(() => {
    const checkEarthquakes = async () => {
      try {
        // Kandilli API'si
        const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.result) {
          const sortedEarthquakes = data.result
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 500); // Son 500 depremi al
          
          console.log('Deprem verileri başarıyla alındı:', sortedEarthquakes.length);
          setEarthquakes(sortedEarthquakes);

          // Yeni deprem kontrolü
          if (userLocation && sortedEarthquakes.length > 0) {
            const latestEarthquake = sortedEarthquakes[0];
            
            if (!lastCheckedEarthquake || lastCheckedEarthquake.date !== latestEarthquake.date) {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                latestEarthquake.geojson.coordinates[1],
                latestEarthquake.geojson.coordinates[0]
              );

              if (distance <= 100 && latestEarthquake.mag >= 3) {
                sendNotification(
                  "Yakınınızda Deprem!",
                  {
                    body: `${latestEarthquake.title}\nBüyüklük: ${latestEarthquake.mag}\nUzaklık: ${Math.round(distance)} km`,
                    icon: "/earthquake-icon.png",
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
        setEarthquakes([]);
        setLoading(false);
      }
    };

    checkEarthquakes();
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
        setDamageReports([]);
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
      toast.success('Rapor başarıyla gönderildi!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (error) {
      console.error('Rapor eklenirken hata:', error);
      toast.error('Rapor gönderilirken bir hata oluştu. Lütfen tekrar deneyin.', {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

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
      <ToastContainer />
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