import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DamageReportForm.css';

const DamageReportForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [location, setLocation] = useState('');
  const [autoLocation, setAutoLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
      );
      const data = await response.json();
      setAutoLocation(data.display_name);
      setLocation(data.display_name);
    } catch (error) {
      console.error('Konum alınamadı:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const compressImage = async (imageFile, maxWidth = 800) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL(imageFile.type, 0.7));
        };
      };
    });
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressedImage = await compressImage(file);
          resolve({
            url: compressedImage,
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
      alert('Lütfen en az bir fotoğraf ekleyin');
      return;
    }

    const damageReport = {
      id: Date.now(),
      images: selectedImages,
      location,
      coordinates: {
        lat: autoLocation?.lat || 39.0,
        lng: autoLocation?.lon || 35.0
      },
      description,
      timestamp: new Date().toISOString(),
    };

    try {
      await onSubmit(damageReport);
      navigate('/damage-reports');
    } catch (error) {
      console.error('Rapor gönderilirken hata:', error);
      alert('Rapor gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="damage-report-form">
      <div className="form-container">
        <h2>Hasar Bildirimi</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Fotoğraflar</h3>
            <div className="image-upload-area">
              <label className="upload-button" htmlFor="imageInput">
                📸 Fotoğraf Ekle
              </label>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="images-preview">
              {selectedImages.map((image, index) => (
                <div key={index} className="image-preview-container">
                  <img src={image.url} alt={`Seçilen fotoğraf ${index + 1}`} />
                  <button 
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Konum Bilgisi</h3>
            <div className="location-input-group">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Örn: Kadıköy, İstanbul"
                required
              />
              <button 
                type="button"
                className="auto-location-button"
                onClick={getLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? '...' : '📍'}
              </button>
            </div>
          </div>

          <div className="form-section">
            <h3>Hasar Açıklaması</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hasar durumunu detaylı bir şekilde açıklayın..."
              required
              rows={5}
            />
          </div>

          <div className="button-group">
            <button type="submit" className="submit-button">
              Raporu Gönder
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DamageReportForm; 