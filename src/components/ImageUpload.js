import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ImageUpload.css';

const ImageUpload = () => {
  const navigate = useNavigate();

  return (
    <button 
      className="upload-button" 
      onClick={() => navigate('/damage-reports/new')}
    >
      📸 Hasar Bildir
    </button>
  );
};

export default ImageUpload; 