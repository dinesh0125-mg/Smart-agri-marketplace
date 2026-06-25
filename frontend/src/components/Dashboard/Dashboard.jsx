import React from 'react';
import { dashboardCards } from '../../data';
import './Dashboard.css';

const cardIcons = {
  1: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"/></svg>,
  2: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  3: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8 6 4 10 4 14c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-4-8-8-12z"/><path d="M12 22V12"/><path d="M8 16l4-4 4 4"/></svg>,
  4: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 110 20 10 10 0 010-20z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  5: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  6: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
};

export default function Dashboard() {
  return (
    <section className="section dashboard-section">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <p className="section-pre">Smart Farming Tools</p>
            <h2 className="section-title">Agriculture <span>Dashboard</span></h2>
          </div>
          <p className="dashboard-sub">Real-time insights powered by AI and IoT sensors</p>
        </div>

        <div className="dashboard-grid">
          {dashboardCards.map((card, i) => (
            <div
              className="dash-card"
              key={card.id}
              style={{ animationDelay: `${i * 0.1}s`, background: card.bg }}
            >
              <div className="dash-top">
                <div className="dash-icon">{cardIcons[card.id]}</div>
                <span className="dash-trend">{card.trend}</span>
              </div>
              <div className="dash-value">{card.value}</div>
              <div className="dash-title">{card.title}</div>
              <div className="dash-desc">{card.desc}</div>
              <div className="dash-bar">
                <div className="dash-bar-fill" style={{ width: `${60 + i * 8}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* AI Banner */}
        <div className="ai-banner">
          <div className="ai-banner-left">
            <span className="ai-badge">AI Powered</span>
            <h3>Smart Crop Recommendations and Disease Detection</h3>
            <p>Get personalized farming advice based on soil data, weather forecasts, and market trends.</p>
            <button className="btn-primary" onClick={() => window.location.href='/ai-assistant'}>
              Chat with AI Assistant
            </button>
          </div>
          <div className="ai-banner-right">
            <div className="ai-robot">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="11"/>
                <circle cx="8" cy="16" r="1" fill="#2E7D32"/><circle cx="16" cy="16" r="1" fill="#2E7D32"/>
              </svg>
            </div>
            <div className="ai-features">
              {['Crop Recommendation', 'Disease Detection', 'Weather Forecast', 'Fertilizer Guide'].map(f => (
                <div key={f} className="ai-feature">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {' '}{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
