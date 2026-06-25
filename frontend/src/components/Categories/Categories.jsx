import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data';
import './Categories.css';

export default function Categories() {
  return (
    <section className="section categories-section">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-pre">Explore Our Range</p>
            <h2 className="section-title">Shop By <span>Categories</span></h2>
          </div>
          <Link to="/shop" className="view-all-btn">View All Categories →</Link>
        </div>

        <div className="categories-grid">
          {categories.map((cat, i) => (
            <Link
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="category-card"
              key={cat.id}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="cat-img-wrap">
                <img src={cat.img} alt={cat.name} className="cat-img" loading="lazy" />
                <div className="cat-overlay" />
                <button className="cat-wishlist"></button>
              </div>
              <div className="cat-info">
                <span className="cat-emoji">{cat.emoji}</span>
                <h3 className="cat-name">{cat.name}</h3>
                <p className="cat-count">{cat.count} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
