import React, { useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import ProductFormModal from '../../components/Products/ProductFormModal';
import './MyProducts.css';

const TABS = ['All', 'In Stock', 'Out of Stock', 'Organic'];

export default function MyProducts() {
  const { user, isAuthenticated, isAdmin, isFarmer } = useAuth();
  const { products, deleteProduct } = useProducts();
  const { addItem } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/my-products' }} replace />;
  if (!isAdmin() && !isFarmer()) return <Navigate to="/" replace />;

  // Filter products for farmer (only their own), admin sees all
  const myProducts = isAdmin()
    ? products
    : products.filter(p => (p.farmerName ?? p.farmer) === user?.name || (p.farmerName ?? p.farmer) === user?.fullName);

  const filtered = useMemo(() => {
    let list = [...myProducts];

    if (search) list = list.filter(p =>
      (p.productName ?? p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.categoryName ?? p.category ?? '').toLowerCase().includes(search.toLowerCase())
    );

    if (activeTab === 'In Stock') list = list.filter(p => p.stock !== 0 && p.stock !== false);
    else if (activeTab === 'Out of Stock') list = list.filter(p => p.stock === 0 || p.stock === false);
    else if (activeTab === 'Organic') list = list.filter(p => p.organicCertified ?? p.organic);

    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else list.sort((a, b) => (b.id || 0) - (a.id || 0)); // newest

    return list;
  }, [myProducts, search, activeTab, sortBy]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    showSuccess('Product deleted successfully.');
  };

  const handleToggleStock = (id) => {
    // TOGGLE_STOCK was a local-only dispatch; not available via backend API
    // For now just show info
    showSuccess('Use the Edit form to update stock.');
  };

  const handleAddToCart = (product) => {
    const pid = product.id ?? product.productId;
    addItem(pid, 1);
    showSuccess(`${product.productName ?? product.name} added to cart!`);
  };

  const stats = {
    total: myProducts.length,
    inStock: myProducts.filter(p => p.stock !== 0 && p.stock !== false).length,
    organic: myProducts.filter(p => p.organicCertified ?? p.organic).length,
    outOfStock: myProducts.filter(p => p.stock === 0 || p.stock === false).length,
  };

  return (
    <div className="my-products-page">
      {/* Page Header */}
      <div className="mp-page-header">
        <div className="container mp-header-inner">
          <div className="mp-header-left">
            <div className="mp-header-icon">{isAdmin() ? '' : ''}</div>
            <div>
              <h1 className="mp-title">
                {isAdmin() ? 'All Products' : 'My Products'}
              </h1>
              <p className="mp-sub">
                {isAdmin()
                  ? `Managing ${myProducts.length} products across all farmers`
                  : `Hello ${user?.name} — manage and list your farm products`}
              </p>
            </div>
          </div>
          <div className="mp-header-actions">
            <Link to="/shop" className="mp-view-store-btn"> View Store</Link>
            <button
              className="mp-add-btn"
              onClick={() => { setEditProduct(null); setShowModal(true); }}
            >
               Add New Product
            </button>
          </div>
        </div>
      </div>

      <div className="container mp-body">
        {/* Success Toast */}
        {successMsg && (
          <div className="mp-success-toast"> {successMsg}</div>
        )}

        {/* Stats Bar */}
        <div className="mp-stats-bar">
          {[
            { label: 'Total Products', value: stats.total, icon: '', color: '#E8F5E9' },
            { label: 'In Stock', value: stats.inStock, icon: '', color: '#E8F5E9' },
            { label: 'Out of Stock', value: stats.outOfStock, icon: '', color: '#FFF3E0' },
            { label: 'Organic', value: stats.organic, icon: '', color: '#F1F8E9' },
          ].map((s, i) => (
            <div key={i} className="mp-stat" style={{ background: s.color }}>
              <span className="mp-stat-icon">{s.icon}</span>
              <div>
                <div className="mp-stat-value">{s.value}</div>
                <div className="mp-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mp-controls">
          <div className="mp-controls-left">
            <div className="mp-search-box">
              <span></span>
              <input
                type="text"
                placeholder="Search your products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="mp-search-clear" onClick={() => setSearch('')}></button>}
            </div>
            <div className="mp-tabs">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`mp-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  <span className="mp-tab-count">
                    {tab === 'All' ? myProducts.length
                      : tab === 'In Stock' ? stats.inStock
                        : tab === 'Out of Stock' ? stats.outOfStock
                          : stats.organic}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mp-controls-right">
            <select
              className="mp-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="mp-view-toggle">
              <button
                className={`mp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >⊞</button>
              <button
                className={`mp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              ></button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="mp-empty">
            <div className="mp-empty-icon"></div>
            <h3>{search ? 'No products match your search' : 'No products yet'}</h3>
            <p>{search ? 'Try a different keyword.' : 'Start by adding your first farm product!'}</p>
            {!search && (
              <button
                className="mp-add-btn"
                onClick={() => { setEditProduct(null); setShowModal(true); }}
              >
                 Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* Grid View */}
        {filtered.length > 0 && viewMode === 'grid' && (
          <div className="mp-grid">
            {/* Add Product Card */}
            <button
              className="mp-add-card"
              onClick={() => { setEditProduct(null); setShowModal(true); }}
            >
              <div className="mp-add-card-icon"></div>
              <div className="mp-add-card-text">Add New Product</div>
              <div className="mp-add-card-sub">List your fresh produce</div>
            </button>

            {filtered.map((product, idx) => (
              <div key={product.id} className="mp-product-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                {/* Image */}
                <div className="mp-card-img-wrap">
                  <img src={product.image ?? product.img} alt={product.productName ?? product.name} className="mp-card-img" />

                  {(product.organicCertified ?? product.organic) && (
                    <span className="mp-organic-badge"> Organic</span>
                  )}
                  {product.discount > 0 && (
                    <span className="mp-discount-badge">-{product.discount}%</span>
                  )}
                  {(product.stock === 0 || product.stock === false) && (
                    <div className="mp-out-overlay">Out of Stock</div>
                  )}

                  {/* Hover Actions */}
                  <div className="mp-card-hover-actions">
                    <button
                      className="mp-hover-btn edit"
                      onClick={() => handleEdit(product)}
                      title="Edit Product"
                    > Edit</button>
                    <button
                      className="mp-hover-btn view"
                      title="View on Store"
                    >
                      <Link to={`/shop/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                         View
                      </Link>
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="mp-card-body">
                  <div className="mp-card-category">{product.categoryName ?? product.category}</div>
                  <h3 className="mp-card-name">{product.productName ?? product.name}</h3>

                  <div className="mp-card-farmer">
                    <span></span>
                    <div>
                      <div className="mp-card-farmer-name">{product.farmerName ?? product.farmer}</div>
                      <div className="mp-card-farmer-loc"> {product.farmerLocation ?? product.location}</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mp-card-rating">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= Math.floor(product.rating || 0) ? '#F9A825' : '#ddd', fontSize: '0.78rem' }}></span>
                    ))}
                    <span className="mp-rating-val">{product.averageRating ?? product.rating ?? 'New'}</span>
                    {(product.reviewCount ?? product.reviews ?? 0) > 0 && <span className="mp-rating-count">({product.reviewCount ?? product.reviews})</span>}
                  </div>

                  {/* Price Row */}
                  <div className="mp-card-price-row">
                    <div>
                      <div className="mp-card-price">
                        ₹{product.discount > 0
                          ? (product.price * (1 - product.discount / 100)).toFixed(0)
                          : product.price}
                        <span> / {product.unit}</span>
                      </div>
                      {product.discount > 0 && (
                        <div className="mp-card-original">₹{product.price}/{product.unit}</div>
                      )}
                    </div>
                    <button
                      className={`mp-cart-btn ${(product.stock === 0 || product.stock === false) ? 'disabled' : ''}`}
                      onClick={() => (product.stock !== 0 && product.stock !== false) && handleAddToCart(product)}
                      disabled={product.stock === 0 || product.stock === false}
                      title="Add to Cart"
                    ></button>
                  </div>

                  {/* Stock Toggle */}
                  <div className="mp-card-footer">
                    <button
                      className={`mp-stock-toggle ${(product.stock !== 0 && product.stock !== false) ? 'in-stock' : 'out-stock'}`}
                      onClick={() => handleToggleStock(product.id)}
                    >
                      {(product.stock !== 0 && product.stock !== false) ? ' In Stock' : ' Out of Stock'}
                    </button>

                    <div className="mp-card-actions">
                      <button
                        className="mp-action-btn"
                        onClick={() => handleEdit(product)}
                        title="Edit"
                      ></button>
                      <button
                        className="mp-action-btn delete"
                        onClick={() => setDeleteConfirmId(product.id)}
                        title="Delete"
                      ></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {filtered.length > 0 && viewMode === 'list' && (
          <div className="mp-list">
            <div className="mp-list-header">
              <span style={{ flex: 3 }}>Product</span>
              <span style={{ flex: 1 }}>Category</span>
              <span style={{ flex: 1 }}>Price</span>
              <span style={{ flex: 1 }}>Stock</span>
              <span style={{ flex: 1 }}>Rating</span>
              <span style={{ flex: 1 }}>Actions</span>
            </div>
            {filtered.map(product => (
              <div key={product.id} className="mp-list-row">
                <div className="mp-list-product" style={{ flex: 3 }}>
                  <img src={product.image ?? product.img} alt={product.productName ?? product.name} className="mp-list-thumb" />
                  <div>
                    <div className="mp-list-name">{product.productName ?? product.name}</div>
                    <div className="mp-list-farmer"> {product.farmerName ?? product.farmer} ·  {product.farmerLocation ?? product.location}</div>
                    {(product.organicCertified ?? product.organic) && <span className="badge-organic" style={{ fontSize: '0.65rem', marginTop: 4, display: 'inline-block' }}>Organic</span>}
                  </div>
                </div>
                <span style={{ flex: 1 }}>
                  <span className="mp-list-cat">{product.categoryName ?? product.category}</span>
                </span>
                <span style={{ flex: 1 }}>
                  <div className="mp-list-price">₹{product.price}<span>/{product.unit}</span></div>
                  {product.discount > 0 && <div className="mp-list-discount">-{product.discount}%</div>}
                </span>
                <span style={{ flex: 1 }}>
                  <button
                    className={`mp-stock-toggle ${(product.stock !== 0 && product.stock !== false) ? 'in-stock' : 'out-stock'}`}
                    onClick={() => handleToggleStock(product.id)}
                    style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                  >
                    {(product.stock !== 0 && product.stock !== false) ? ' In Stock' : ' Out of Stock'}
                  </button>
                </span>
                <span style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#F9A825', fontSize: '0.85rem' }}></span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{product.rating || '—'}</span>
                  </div>
                </span>
                <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                  <button className="mp-action-btn" onClick={() => handleEdit(product)} title="Edit"></button>
                  <button
                    className="mp-action-btn"
                    title="View"
                  >
                    <Link to={`/shop/${product.id}`} style={{ fontSize: '0.85rem' }}></Link>
                  </button>
                  <button className="mp-action-btn delete" onClick={() => setDeleteConfirmId(product.id)} title="Delete"></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {filtered.length > 0 && (
          <div className="mp-results-info">
            Showing {filtered.length} of {myProducts.length} products
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      {deleteConfirmId && (
        <div className="mp-confirm-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="mp-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="mp-confirm-icon"></div>
            <h3>Delete Product?</h3>
            <p>This action cannot be undone. The product will be permanently removed from the marketplace.</p>
            <div className="mp-confirm-btns">
              <button className="mp-confirm-cancel" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="mp-confirm-delete" onClick={() => handleDelete(deleteConfirmId)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showModal && (
        <ProductFormModal
          editProduct={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSuccess={() => showSuccess(editProduct ? 'Product updated!' : 'Product published successfully!')}
        />
      )}
    </div>
  );
}
