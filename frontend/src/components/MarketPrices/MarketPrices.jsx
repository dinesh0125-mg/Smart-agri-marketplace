import React, { useState, useEffect } from 'react';
import { marketPrices } from '../../data';
import './MarketPrices.css';

function MiniTrendChart({ data, positive }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32, pts = data.length;
  const points = data.map((v, i) => {
    const x = (i / (pts - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="mini-chart">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#2E7D32' : '#E53935'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MarketPrices() {
  const [prices, setPrices] = useState(marketPrices);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        price: +(p.price + (Math.random() - 0.5) * 2).toFixed(1),
        change: +(p.change + (Math.random() - 0.5) * 0.3).toFixed(1),
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section market-section" id="market">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-pre">Live Data</p>
            <h2 className="section-title">Market <span>Prices</span></h2>
          </div>
          <div className="live-indicator">
            <span className="live-dot" />
            <span className="live-text">Live Updates</span>
          </div>
        </div>

        <div className="market-grid">
          {prices.map((item, i) => (
            <div className="market-card" key={item.id} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="market-top">
                <div className="market-name-wrap">
                  <span className="market-emoji">{item.emoji}</span>
                  <span className="market-name">{item.name}</span>
                </div>
                <span className={`price-change ${item.change >= 0 ? 'up' : 'down'}`}>
                  {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                </span>
              </div>
              <div className="market-price-row">
                <div>
                  <div className="market-price">₹{item.price}</div>
                  <div className="market-unit">per {item.unit}</div>
                </div>
                <MiniTrendChart data={item.trend} positive={item.change >= 0} />
              </div>
            </div>
          ))}
        </div>

        <div className="market-cta">
          <button className="btn-primary" style={{ margin: '0 auto', display: 'flex' }}>
            View All Prices
          </button>
        </div>
      </div>
    </section>
  );
}
