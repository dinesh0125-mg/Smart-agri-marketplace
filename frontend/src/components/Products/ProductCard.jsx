import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { cart, addItem } = useCart();
  const { isAuthenticated, isBuyer } = useAuth();

  const [added, setAdded] = useState(false);
  // Wishlist is UI-only (no backend endpoint); persisted per-session in component state
  const [inWishlist, setInWishlist] = useState(false);

  // Support both backend shape (productId, productName, imageUrl) and
  // frontend/local shape (id, name, img)
  const productId   = product.productId   ?? product.id;
  const productName = product.productName ?? product.name;
  const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80';
  const productImg  = product.image ?? product.imageUrl ?? product.img ?? PLACEHOLDER_IMG;
  const isOrganic   = product.organicCertified ?? product.organic;
  const inStock     = product.stock !== 0 && product.stock !== false;

  // Derive in-cart status from the live cart array
  const inCart = Array.isArray(cart) && cart.some(
    (item) => (item.productId ?? item.id) === productId
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!inStock) return;

    if (isAuthenticated && isBuyer && isBuyer()) {
      addItem(productId, 1);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    setInWishlist((prev) => !prev);
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.floor(rating ?? 0) ? '#F9A825' : '#ddd'} stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ));

  return (
    <Link to={`/shop/${productId}`} className="product-card">
      <div className="product-img-wrap">
        <img src={productImg} alt={productName} className="product-img" loading="lazy" />

        {isOrganic && (
          <span className="organic-badge">Organic</span>
        )}
        {product.discount > 0 && (
          <span className="discount-badge">-{product.discount}%</span>
        )}

        <button
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? '\u2665' : '\u2661'}
        </button>

        {!inStock && (
          <div className="out-of-stock-overlay">Out of Stock</div>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name">{productName}</h3>

        <div className="product-farmer">
          <span className="farmer-avatar" style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{(product.farmer ?? product.farmerName ?? 'F').charAt(0)}</span>
          <div>
            <div className="farmer-name">{product.farmer ?? product.farmerName ?? ''}</div>
            <div className="farmer-loc">{product.location ?? product.farmLocation ?? ''}</div>
          </div>
        </div>

        <div className="product-rating">
          {renderStars(product.rating)}
          <span className="rating-num">{product.rating ?? '—'}</span>
          <span className="rating-count">({product.reviews ?? product.reviewCount ?? 0})</span>
        </div>

        <div className="product-footer">
          <div>
            <div className="product-price">
              ₹{product.price}
              <span className="product-unit"> / {product.unit}</span>
            </div>
            <div className={`product-stock ${inStock ? 'in' : 'out'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>

          <button
            className={`add-cart-btn ${added ? 'success' : ''} ${!inStock ? 'disabled' : ''} ${inCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label={inCart ? 'Already in cart' : 'Add to cart'}
          >
            {added ? '\u2713' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}
