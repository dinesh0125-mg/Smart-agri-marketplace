import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const stats = [
  { value: '10,000+', label: 'Farmers' },
  { value: '50,000+', label: 'Products' },
  { value: '100+', label: 'Cities Served' },
  { value: '98%', label: 'Customer Satisfaction' },
];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const num = parseInt(target.replace(/[^0-9]/g, ''));
    if (!num) return;
    const step = num / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [start]);
  const suffix = target.replace(/[0-9,]/g, '');
  return count.toLocaleString() + suffix;
}

function StatCard({ stat, animate }) {
  const displayed = useCountUp(stat.value, 2000, animate);
  return (
    <div className="stat-card">
      <div>
        <div className="stat-value">{animate ? displayed : stat.value}</div>
        <div className="stat-label">{stat.label}</div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [animate, setAnimate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero">
      {/* Background */}
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=85"
          alt="Smart Farm"
          className="hero-bg-img"
        />
        <div className="hero-overlay" />
      </div>

      

      
      

      {/* Content */}
      <div className="hero-content container">
        <div className="hero-text">
          <div className="hero-badge animate-fade-up" style={{ animationDelay: '0.1s' }}>
            India's #1 Agriculture Marketplace
          </div>
          <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Connecting Farmers<br />
            Directly to <span className="highlight">Buyers</span>
          </h1>
          <p className="hero-desc animate-fade-up" style={{ animationDelay: '0.35s' }}>
            Buy fresh farm products directly from trusted farmers across India.<br />
            Farm to table, guaranteed fresh.
          </p>

          {/* Search */}
          <div className="hero-search animate-fade-up" style={{ animationDelay: '0.45s' }}>
            <span className="search-prefix"></span>
            <input
              type="text"
              placeholder="Search products, crops, seeds, fertilizers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Link to={`/shop${search ? `?q=${search}` : ''}`} className="search-submit">Search</Link>
          </div>

          {/* CTA */}
          <div className="hero-cta animate-fade-up" style={{ animationDelay: '0.55s' }}>
            <Link to="/shop" className="btn-hero-primary">
              Shop Now
            </Link>
            <Link to="/about" className="btn-hero-secondary">
              Become a Seller
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges animate-fade-up" style={{ animationDelay: '0.65s' }}>
            <span className="trust-badge">Verified Farmers</span>
            <span className="trust-badge">Secure Payments</span>
            <span className="trust-badge">Pan India Delivery</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="container stats-inner">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} animate={animate} />
          ))}
        </div>
      </div>
    </section>
  );
}
