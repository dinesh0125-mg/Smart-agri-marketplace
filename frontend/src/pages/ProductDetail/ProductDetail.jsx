import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductsContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/Products/ProductCard';
import ProductFormModal from '../../components/Products/ProductFormModal';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, deleteProduct } = useProducts();
  const { cart, addItem } = useCart();
  const { isAdmin, isFarmer, isBuyer, user } = useAuth();

  const product = products.find(p => (p.id ?? p.productId) === parseInt(id)) || products[0];
  const related = products
    .filter(p => p.category === product?.category && (p.id ?? p.productId) !== (product?.id ?? product?.productId))
    .slice(0, 4);

  const [qty, setQty]             = useState(1);
  const [added, setAdded]         = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [showEdit, setShowEdit]   = useState(false);
  // Wishlist is UI-only — no backend endpoint exists for it
  const [inWishlist, setInWishlist] = useState(false);

  if (!product) return <div className="container" style={{ padding: '4rem 0' }}>Product not found.</div>;

  // Normalise field access for both backend and local data shapes
  const productId   = product.productId   ?? product.id;
  const productName = product.productName ?? product.name;
  const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80';
  const productImg  = product.image ?? product.imageUrl ?? product.img ?? PLACEHOLDER_IMG;
  const isOrganic   = product.organicCertified ?? product.organic;
  const inStock     = product.stock !== 0 && product.stock !== false;
  const farmerName  = product.farmerName  ?? product.farmer  ?? '';
  const location    = product.farmerLocation ?? product.location ?? '';

  const imgs = [productImg, ...related.slice(0, 3).map(r => r.image ?? r.imageUrl ?? r.img)].filter(Boolean);

  const canEdit = isAdmin?.() || (isFarmer?.() && product.farmer === user?.name);

  const handleAddCart = () => {
    if (isBuyer?.()) addItem(productId, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating||0) ? '#F9A825' : '#ddd', fontSize:'1.1rem' }}></span>
    ));

  return (
    <div className="detail-page">
      <div className="breadcrumb-bar">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span>
            <Link to="/shop">Shop</Link> <span>/</span>
            <span>{productName}</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="detail-grid">
          {/* ── Gallery ── */}
          <div className="detail-gallery">
            <div className="main-img-wrap">
              <img src={imgs[activeImg]} alt={productName} className="main-img" />
              <button
                className={`detail-wishlist ${inWishlist ? 'active' : ''}`}
                onClick={() => setInWishlist(w => !w)}
              >
                {inWishlist ? '' : ''}
              </button>
              {isOrganic && (
                <span className="organic-badge"> Organic</span>
              )}
              {/* Owner / Admin quick-edit button */}
              {canEdit && (
                <button
                  className="detail-edit-btn"
                  onClick={() => setShowEdit(true)}
                  title="Edit this product"
                > Edit</button>
              )}
            </div>
            <div className="thumb-gallery">
              {imgs.map((img, i) => (
                <img key={i} src={img} alt=""
                  className={`thumb-img ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)} />
              ))}
            </div>
          </div>

          {/* ── Info ── */}
          <div className="detail-info">
            <div className="detail-top">
              <h1 className="detail-name">{productName}</h1>
              {isOrganic && <span className="badge-organic">Organic</span>}
            </div>

            <div className="detail-rating">
              {renderStars(product.rating)}
              <span className="rating-num">{product.rating || 'New'}</span>
              {(product.reviews ?? product.reviewCount) > 0 &&
                <span className="rating-count">({product.reviews ?? product.reviewCount} reviews)</span>}
            </div>

            <div className="detail-price">
              ₹{product.discount > 0
                  ? (Number(product.price) * (1 - product.discount / 100)).toFixed(0)
                  : product.price}
              <span> / {product.unit}</span>
              {product.discount > 0 && (
                <span className="detail-original-price">₹{product.price}</span>
              )}
            </div>

            {/* Farmer Card */}
            <div className="farmer-card">
              <div className="farmer-avatar-lg"></div>
              <div>
                <div className="farmer-name-lg">{farmerName}</div>
                <div className="farmer-loc-lg"> {location}</div>
              </div>
              <span className="verified-badge"> Verified Farmer</span>
            </div>

            <p className="detail-desc">
              {product.description ||
                `Fresh and organic ${productName.toLowerCase()} grown naturally without chemicals. Rich in vitamins and perfect for cooking. Directly harvested from certified organic farms.`}
            </p>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Harvest Date</span>
                <span className="meta-value">15 May 2024</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Organic Certified</span>
                <span className="meta-value">{isOrganic ? 'Yes ' : 'No'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Available Stock</span>
                <span className="meta-value">{inStock ? (product.stock > 1 ? `${product.stock} ${product.unit}` : 'In Stock') : 'Out of Stock'}</span>
              </div>
            </div>

            {inStock && (
              <div className="detail-actions">
                <div className="qty-control">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}>+</button>
                </div>
                <button
                  className={`btn-primary ${added ? 'btn-success' : ''}`}
                  onClick={handleAddCart}
                >
                  {added ? ' Added to Cart' : ' Add to Cart'}
                </button>
                <Link to="/cart" className="btn-outline">Buy Now</Link>
              </div>
            )}

            {!inStock && (
              <div className="out-of-stock-msg"> This product is currently out of stock.</div>
            )}

            {/* Admin/Farmer management strip */}
            {canEdit && (
              <div className="owner-actions-strip">
                <span className="owner-tag">
                  {isAdmin() ? ' Admin Controls' : ' Your Product'}
                </span>
                <button className="owner-edit-btn" onClick={() => setShowEdit(true)}>
                   Edit Product
                </button>
                <button
                  className="owner-delete-btn"
                  onClick={() => {
                    if (window.confirm('Delete this product?')) {
                      deleteProduct(product.id);
                      window.history.back();
                    }
                  }}
                >
                   Delete
                </button>
                <Link to="/my-products" className="owner-manage-btn">
                   Manage All
                </Link>
              </div>
            )}

            <div className="detail-badges">
              <span className="detail-badge"> Free Delivery above ₹500</span>
              <span className="detail-badge">↩ 7-day returns</span>
              <span className="detail-badge"> Secure payment</span>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-section">
            <h2 className="section-title">Related <span>Products</span></h2>
            <div className="related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <ProductFormModal
          editProduct={product}
          onClose={() => setShowEdit(false)}
          onSuccess={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
