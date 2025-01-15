import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Statistics.css';

const Statistics = ({ earthquakes }) => {
  const stats = useMemo(() => {
    if (!earthquakes || earthquakes.length === 0) {
      return {
        last24Hours: 0,
        maxMagnitude: 0,
        avgDepth: 0,
        magnitudeDistribution: []
      };
    }

    // Son 24 saat içindeki depremler
    const now = new Date();
    const last24Hours = earthquakes.filter(eq => {
      const eqDate = new Date(eq.date);
      const hoursDiff = (now - eqDate) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    }).length;

    // En büyük deprem
    const maxMagnitude = Math.max(...earthquakes.map(eq => eq.mag));

    // Ortalama derinlik
    const avgDepth = earthquakes.reduce((sum, eq) => sum + eq.depth, 0) / earthquakes.length;

    // Büyüklük dağılımı
    const magnitudeRanges = [
      { range: '0-2', count: 0 },
      { range: '2-3', count: 0 },
      { range: '3-4', count: 0 },
      { range: '4-5', count: 0 },
      { range: '5+', count: 0 }
    ];

    earthquakes.forEach(eq => {
      if (eq.mag < 2) magnitudeRanges[0].count++;
      else if (eq.mag < 3) magnitudeRanges[1].count++;
      else if (eq.mag < 4) magnitudeRanges[2].count++;
      else if (eq.mag < 5) magnitudeRanges[3].count++;
      else magnitudeRanges[4].count++;
    });

    return {
      last24Hours,
      maxMagnitude,
      avgDepth,
      magnitudeDistribution: magnitudeRanges
    };
  }, [earthquakes]);

  return (
    <div className="statistics">
      <h2>Deprem İstatistikleri</h2>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Son 24 Saat</h3>
          <div className="stat-value">{stats.last24Hours}</div>
          <div className="stat-label">Deprem</div>
        </div>

        <div className="stat-card">
          <h3>En Büyük Deprem</h3>
          <div className="stat-value">{stats.maxMagnitude.toFixed(1)}</div>
          <div className="stat-label">Magnitude</div>
        </div>

        <div className="stat-card">
          <h3>Ortalama Derinlik</h3>
          <div className="stat-value">{stats.avgDepth.toFixed(1)}</div>
          <div className="stat-label">km</div>
        </div>
      </div>

      <div className="magnitude-distribution">
        <h3>Büyüklük Dağılımı</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.magnitudeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#48bb78" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 