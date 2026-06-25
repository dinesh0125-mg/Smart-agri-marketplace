import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setEmail(''); }
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Logo size="small" variant="light" />
            </Link>
            <p className="footer-brand-desc">
              Connecting farmers directly to buyers. Building a better agriculture future together across India.
            </p>
            <div className="footer-social">
              {['FB', 'IG', 'TW', 'LI', 'YT'].map((icon, i) => (
                <a key={i} href="#" className="social-icon">{icon}</a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              {[['Home', '/'], ['Shop', '/shop'], ['About Us', '/about'], ['Contact Us', '/contact'], ['Terms & Conditions', '/']].map(([label, path]) => (
                <li key={label}><Link to={path}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-links">
              {['Vegetables', 'Fruits', 'Organic Products', 'Seeds', 'Fertilizers'].map(cat => (
                <li key={cat}><Link to={`/shop?category=${cat}`}>{cat}</Link></li>
              ))}
            </ul>
          </div>

          {/* For Farmers */}
          <div className="footer-col">
            <h4 className="footer-col-title">For Farmers</h4>
            <ul className="footer-links">
              {[['Become a Seller', '/about'], ['Farmer Dashboard', '/'], ['Seller Guide', '/'], ['Resources', '/'], ['Success Stories', '/']].map(([label, path]) => (
                <li key={label}><Link to={path}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col">
            <h4 className="footer-col-title">Newsletter</h4>
            <p className="footer-newsletter-desc">Subscribe to get updates and offers from our marketplace.</p>
            <form className="footer-newsletter" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="subscribe-btn">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2024 Smart Agriculture Marketplace. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
