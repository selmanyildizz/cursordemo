import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DamageReportForm.css';
import { toast } from 'react-toastify';

const DamageReportForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [location, setLocation] = useState('');
  const [autoLocation, setAutoLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const initLocation = async () => {
      try {
        await getLocation();
      } catch (error) {
        console.error('Başlangıç konumu alınamadı:', error);
      }
    };

    initLocation();
  }, []);

  const getLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      setAutoLocation({
        lat: lat,
        lng: lng
      });

      setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (error) {
      console.error('Konum alınamadı:', error);
      alert('Konum alınamadı. Lütfen konum izinlerini kontrol edin veya konumu manuel girin.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            url: reader.result,
            name: file.name,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newImages = await Promise.all(imagePromises);
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      toast.warning('Lütfen en az bir fotoğraf ekleyin', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    const damageReport = {
      images: selectedImages,
      location,
      coordinates: autoLocation || { lat: 39.0, lng: 35.0 },
      description,
      timestamp: new Date().toISOString()
    };

    try {
      await onSubmit(damageReport);
      navigate('/damage-reports');
    } catch (error) {
      console.error('Rapor gönderilirken hata:', error);
      toast.error('Rapor gönderilirken bir hata oluştu. Lütfen tekrar deneyin.', {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  return (
    <div className="damage-report-form">
      <div className="form-container">
        <h2>Hasar Bildirimi</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fotoğraflar</label>
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="image-input"
              />
              <div className="selected-images">
                {selectedImages.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img src={image.url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Konum</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Konum bilgisi"
              required
            />
            <button
              type="button"
              onClick={getLocation}
              className="get-location-button"
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? 'Konum Alınıyor...' : 'Konumumu Bul'}
            </button>
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hasar hakkında detaylı bilgi"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Raporu Gönder
          </button>
        </form>
      </div>
    </div>
  );
};

export default DamageReportForm; 