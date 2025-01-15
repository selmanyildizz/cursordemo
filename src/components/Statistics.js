import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './Statistics.css';

function Statistics({ earthquakes }) {
  // Son 24 saat içindeki depremleri filtrele
  const last24Hours = earthquakes.filter(quake => {
    const quakeTime = new Date(quake.date);
    const now = new Date();
    const diff = now - quakeTime;
    return diff <= 24 * 60 * 60 * 1000;
  });

  // Büyüklük dağılımını hesapla
  const magnitudeDistribution = earthquakes.reduce((acc, quake) => {
    const mag = Math.floor(quake.mag);
    acc[mag] = (acc[mag] || 0) + 1;
    return acc;
  }, {});

  const magnitudeData = Object.entries(magnitudeDistribution).map(([mag, count]) => ({
    magnitude: `${mag}.0-${mag}.9`,
    count: count
  }));

  // Derinlik dağılımını hesapla
  const depthRanges = [
    { range: '0-10', count: 0 },
    { range: '10-30', count: 0 },
    { range: '30-50', count: 0 },
    { range: '50+', count: 0 }
  ];

  earthquakes.forEach(quake => {
    const depth = quake.depth;
    if (depth <= 10) depthRanges[0].count++;
    else if (depth <= 30) depthRanges[1].count++;
    else if (depth <= 50) depthRanges[2].count++;
    else depthRanges[3].count++;
  });

  return (
    <div className="statistics-container">
      <h2>Deprem İstatistikleri</h2>
      
      <div className="stat-cards">
        <div className="stat-card">
          <h3>Son 24 Saat</h3>
          <p className="stat-number">{last24Hours.length}</p>
          <p>Deprem</p>
        </div>
        <div className="stat-card">
          <h3>En Büyük Deprem</h3>
          <p className="stat-number">
            {Math.max(...earthquakes.map(q => q.mag)).toFixed(1)}
          </p>
          <p>Magnitude</p>
        </div>
        <div className="stat-card">
          <h3>Ortalama Derinlik</h3>
          <p className="stat-number">
            {(earthquakes.reduce((acc, q) => acc + q.depth, 0) / earthquakes.length).toFixed(1)}
          </p>
          <p>km</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <h3>Büyüklük Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={magnitudeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="magnitude" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#48bb78" name="Deprem Sayısı" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Derinlik Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={depthRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4299e1" name="Deprem Sayısı" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Statistics; 