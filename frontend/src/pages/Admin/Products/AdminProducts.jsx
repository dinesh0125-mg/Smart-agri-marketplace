import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { useProducts } from '../../../context/ProductsContext';
import { categories } from '../../../data';
import ProductFormModal from '../../../components/Products/ProductFormModal';
import './AdminProducts.css';

export default function AdminProducts() {
  const { products, deleteProduct } = useProducts();
  const [search,         setSearch]         = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy,         setSortBy]         = useState('newest');
  const [selectedIds,    setSelectedIds]    = useState([]);
  const [showModal,      setShowModal]      = useState(false);
  const [editProduct,    setEditProduct]    = useState(null);
  const [deleteId,       setDeleteId]       = useState(null);
  const [successMsg,     setSuccessMsg]     = useState('');

  const cats = ['All', ...categories.map(c => c.name)];

  const filtered = products.filter(p => {
    const matchSearch = (p.productName ?? p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.farmerName ?? p.farmer ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || (p.categoryName ?? p.category) === filterCategory;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sortBy === 'price-asc')  return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating')     return (b.rating||0) - (a.rating||0);
    return (b.id||0) - (a.id||0);
  });

  const toggleSelect  = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleAll     = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(p => p.id));
  const showSuccess   = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const bulkDelete = () => {
    if (!window.confirm(`Delete ${selectedIds.length} products?`)) return;
    selectedIds.forEach(id => deleteProduct(id));
    setSelectedIds([]);
    showSuccess(`${selectedIds.length} products deleted.`);
  };

  return (
    <AdminLayout>
      <div className="admin-products-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Products Management</h1>
            <p className="admin-page-sub">{filtered.length} products found</p>
          </div>
          <button className="export-btn" onClick={() => { setEditProduct(null); setShowModal(true); }}>
            + Add Product
          </button>
        </div>

        {successMsg && (
          <div style={{ background:'#E8F5E9', border:'1.5px solid #4CAF50', color:'#2E7D32', padding:'12px 18px', borderRadius:12, fontWeight:600, fontSize:'0.875rem' }}>
            {successMsg}
          </div>
        )}

        {/* Filters */}
        <div className="admin-card filters-bar">
          <div className="filters-left">
            <div className="admin-search-input">
              <input type="text" placeholder="Search products or farmers..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="cat-filter-tabs">
              {cats.map(cat => (
                <button key={cat}
                  className={`cat-tab ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <select className="period-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar">
            <span>{selectedIds.length} selected</span>
            <button className="bulk-btn delete"  onClick={bulkDelete}>Delete</button>
            <button className="bulk-btn clear"   onClick={() => setSelectedIds([])}>Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="admin-card table-card">
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll} />
                  </th>
                  <th>Product</th>
                  <th>Farmer</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Stock</th>
                  <th>Organic</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className={selectedIds.includes(product.id) ? 'selected-row' : ''}>
                    <td>
                      <input type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)} />
                    </td>
                    <td>
                      <div className="product-cell">
                        <img src={product.image ?? product.img} alt={product.productName ?? product.name} className="product-thumb" />
                        <div>
                          <div className="product-cell-name">{product.productName ?? product.name}</div>
                          <div className="product-cell-id">ID #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="farmer-cell">
                        <div>
                          <div className="farmer-cell-name">{product.farmerName ?? product.farmer}</div>
                          <div className="farmer-cell-loc">{product.farmerLocation ?? product.location}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="category-tag">{product.categoryName ?? product.category}</span></td>
                    <td><span className="price-cell">Rs.{product.price}/{product.unit}</span></td>
                    <td>
                      <div className="rating-cell">
                        <span className="star-icon">&#9733;</span>
                        <span>{product.averageRating ?? product.rating ?? '—'}</span>
                        {(product.reviewCount ?? product.reviews ?? 0) > 0 && <span className="reviews-count">({product.reviewCount ?? product.reviews})</span>}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`stock-badge ${(product.stock !== 0 && product.stock !== false) ? 'in' : 'out'}`}
                      >
                        {(product.stock !== 0 && product.stock !== false) ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <span className={`organic-flag ${(product.organicCertified ?? product.organic) ? 'yes' : 'no'}`}>
                        {(product.organicCertified ?? product.organic) ? 'Yes' : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit" title="Edit"
                          onClick={() => { setEditProduct(product); setShowModal(true); }}>Edit</button>
                        <button className="action-btn delete" title="Delete"
                          onClick={() => setDeleteId(product.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span className="table-info">
              Showing {filtered.length} of {products.length} products
            </span>
            <div className="pagination">
              <button className="page-btn">&lsaquo;</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">&rsaquo;</button>
            </div>
          </div>
        </div>

        {/* Delete confirm */}
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth:380, textAlign:'center', padding:36 }}>
              <h3 style={{ marginBottom:10, fontFamily:'Playfair Display, serif' }}>Delete Product?</h3>
              <p style={{ color:'#888', fontSize:'0.875rem', marginBottom:24 }}>
                This will permanently remove the product from the marketplace.
              </p>
              <div style={{ display:'flex', gap:12 }}>
                <button className="modal-cancel" onClick={() => setDeleteId(null)} style={{ flex:1, padding:12 }}>Cancel</button>
                <button
                  style={{ flex:1, background:'#E53935', color:'white', border:'none', padding:12, borderRadius:12, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}
                  onClick={() => { deleteProduct(deleteId); setDeleteId(null); showSuccess('Product deleted.'); }}
                >Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit modal */}
        {showModal && (
          <ProductFormModal
            editProduct={editProduct}
            onClose={() => { setShowModal(false); setEditProduct(null); }}
            onSuccess={() => showSuccess(editProduct ? 'Product updated!' : 'Product added!')}
          />
        )}
      </div>
    </AdminLayout>
  );
}
