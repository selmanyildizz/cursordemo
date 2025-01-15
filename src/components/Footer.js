import React from 'react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Faydalı Linkler</h4>
          <ul>
            <li><a href="https://deprem.afad.gov.tr/" target="_blank" rel="noopener noreferrer">AFAD Deprem</a></li>
            <li><a href="http://www.koeri.boun.edu.tr/" target="_blank" rel="noopener noreferrer">Kandilli Rasathanesi</a></li>
            <li><a href="https://deprem.gov.tr/" target="_blank" rel="noopener noreferrer">E-Devlet Deprem</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>İletişim</h4>
          <ul>
            <li><a href="https://github.com/selmanyildizz" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://linkedin.com/in/selman-yıldız-121206173/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Acil Numaralar</h4>
          <ul>
            <li>AFAD: 122</li>
            <li>Acil Çağrı: 112</li>
            <li>İtfaiye: 110</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {year} Deprem Takip. Designed by <a href="https://github.com/selmanyildiz" target="_blank" rel="noopener noreferrer">Selman Yıldız</a></p>
      </div>
    </footer>
  );
};

export default Footer; 