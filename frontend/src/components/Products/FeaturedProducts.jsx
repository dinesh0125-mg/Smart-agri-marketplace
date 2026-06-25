import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useProducts } from '../../context/ProductsContext';
import './FeaturedProducts.css';

const tabs = ['All', 'Vegetables', 'Fruits', 'Organic', 'Seeds'];

export default function FeaturedProducts() {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState('All');

  // Ensure products is always an array
  const productList = Array.isArray(products)
    ? products
    : Array.isArray(products?.data)
    ? products.data
    : [];

  const filtered =
    activeTab === 'All'
      ? productList.slice(0, 8)
      : productList
          .filter(
            (p) =>
              (p?.categoryName ?? p?.category ?? '')
                ?.toLowerCase()
                .includes(activeTab.toLowerCase()) ||
              (activeTab === 'Organic' && (p?.organicCertified ?? p?.organic))
          )
          .slice(0, 8);

  return (
    <section className="section featured-section">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-pre">Handpicked for You</p>
            <h2 className="section-title">
              Featured <span>Products</span>
            </h2>
          </div>

          <Link to="/shop" className="view-all-btn">
            View All Products →
          </Link>
        </div>

        <div className="product-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${
                activeTab === tab ? 'active' : ''
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filtered.length > 0 ? (
            filtered.map((product, i) => (
              <div
                key={product.id || i}
                style={{
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="no-products">
              <p>No products available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}