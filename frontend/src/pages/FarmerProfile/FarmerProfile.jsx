import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { farmers, products } from '../../data';
import ProductCard from '../../components/Products/ProductCard';
import './FarmerProfile.css';

export default function FarmerProfile() {
  const { id } = useParams();
  const farmer = farmers.find(f => f.id === parseInt(id)) || farmers[0];
  const farmerProducts = products.filter(p => p.farmer === farmer.name).slice(0, 4);
  const displayProducts = farmerProducts.length > 0 ? farmerProducts : products.slice(0, 4);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? '#F9A825' : '#ddd', fontSize: '1rem' }}></span>
    ));

  const farmImages = [
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  ];

  return (
    <div className="farmer-page">
      <div className="breadcrumb-bar">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span>
            <span>Farmers</span> <span>/</span>
            <span>{farmer.name}</span>
          </nav>
        </div>
      </div>

      {/* Cover Banner */}
      <div className="farmer-cover">
        <img
          src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1400&q=80"
          alt="Farm"
          className="cover-img"
        />
        <div className="cover-overlay" />
      </div>

      <div className="container">
        {/* Profile Card */}
        <div className="farmer-profile-card">
          <div className="farmer-profile-left">
            <div className="farmer-photo-wrap">
              <img src={farmer.img} alt={farmer.name} className="farmer-photo" />
              {farmer.verified && <span className="verified-ring"></span>}
            </div>
            <div>
              <div className="farmer-profile-name">{farmer.name}</div>
              <div className="farmer-profile-specialty"> {farmer.specialty}</div>
              <div className="farmer-profile-loc"> {farmer.location}</div>
              <div className="farmer-profile-rating">
                {renderStars(farmer.rating)}
                <span>{farmer.rating} rating</span>
              </div>
            </div>
          </div>

          <div className="farmer-stats">
            <div className="fstat">
              <div className="fstat-value">{farmer.experience}</div>
              <div className="fstat-label">Experience</div>
            </div>
            <div className="fstat">
              <div className="fstat-value">{farmer.products}+</div>
              <div className="fstat-label">Products</div>
            </div>
            <div className="fstat">
              <div className="fstat-value">4.2K+</div>
              <div className="fstat-label">Happy Buyers</div>
            </div>
            <div className="fstat">
              <div className="fstat-value">₹8.5L</div>
              <div className="fstat-label">Annual Revenue</div>
            </div>
          </div>

          <div className="farmer-actions">
            {farmer.verified && (
              <div className="verified-tag">
                <span> Verified Farmer</span>
                <span> Top Seller</span>
              </div>
            )}
            <button className="btn-primary">Contact Farmer</button>
            <button className="btn-outline">Follow</button>
          </div>
        </div>

        {/* About + Farm Images */}
        <div className="farmer-body">
          <div className="farmer-about">
            <h3 className="section-sub-title">About the Farmer</h3>
            <p>
              {farmer.name} is a passionate and experienced farmer from {farmer.location} with {farmer.experience} of experience in {farmer.specialty.toLowerCase()}.
              Using modern sustainable techniques combined with traditional wisdom, they deliver the finest quality produce directly from their certified organic farm.
            </p>
            <p style={{ marginTop: 12 }}>
              Joined Smart Agriculture Marketplace in 2022 and has since built a reputation for consistent quality, timely delivery, and honest pricing. Their farm spans over 15 acres with fully automated irrigation and soil monitoring systems.
            </p>

            <div className="farmer-certifications">
              <div className="cert-card"> Organic Certified</div>
              <div className="cert-card"> FSSAI Approved</div>
              <div className="cert-card"> Award Winner 2023</div>
              <div className="cert-card"> Water Smart</div>
            </div>
          </div>

          <div className="farm-images">
            <h3 className="section-sub-title">Farm Gallery</h3>
            <div className="farm-gallery">
              {farmImages.map((img, i) => (
                <img key={i} src={img} alt={`Farm ${i + 1}`} className="farm-gallery-img" />
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="farmer-products-section">
          <div className="section-header">
            <h2 className="section-title">{farmer.name.split(' ')[0]}'s <span>Products</span></h2>
            <Link to="/shop" className="view-all-btn">View All →</Link>
          </div>
          <div className="farmer-products-grid">
            {displayProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
