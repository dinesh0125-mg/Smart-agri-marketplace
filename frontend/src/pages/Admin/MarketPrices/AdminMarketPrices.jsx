import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { getMarketPrices, createMarketPrice, updateMarketPrice, deleteMarketPrice } from '../../../api/adminService';
import './AdminMarketPrices.css';

export default function AdminMarketPrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCrop, setNewCrop] = useState({ commodityName: '', price: '', unit: 'per kg', change: '0' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadPrices(); }, []);

  const loadPrices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMarketPrices();
      const data = res.data;
      setPrices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load market prices. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const startEdit = (p) => {
    setEditId(p.id);
    setEditVal(String(p.price));
  };

  const saveEdit = async (id) => {
    const price = prices.find(p => p.id === id);
    if (!price) return;
    setSaving(true);
    try {
      const newPrice = parseFloat(editVal);
      if (isNaN(newPrice) || newPrice <= 0) { setError('Please enter a valid price.'); setSaving(false); return; }
      const oldPrice = Number(price.price) || 0;
      const change = oldPrice > 0 ? +(((newPrice - oldPrice) / oldPrice) * 100).toFixed(1) : 0;
      await updateMarketPrice(id, {
        commodityName: price.commodityName,
        emoji: price.emoji || '',
        price: newPrice,
        change: change,
        unit: price.unit,
      });
      showSuccess(`${price.commodityName} price updated.`);
      setEditId(null);
      loadPrices();
    } catch (err) {
      setError('Failed to update price.');
    } finally {
      setSaving(false);
    }
  };

  const addCrop = async () => {
    if (!newCrop.commodityName || !newCrop.price) return;
    setSaving(true);
    try {
      await createMarketPrice({
        commodityName: newCrop.commodityName,
        emoji: '',
        price: parseFloat(newCrop.price),
        change: parseFloat(newCrop.change) || 0,
        unit: newCrop.unit,
      });
      showSuccess('New commodity added.');
      setNewCrop({ commodityName: '', price: '', unit: 'per kg', change: '0' });
      setShowAddModal(false);
      loadPrices();
    } catch (err) {
      setError('Failed to add commodity.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this commodity price?')) return;
    try {
      await deleteMarketPrice(id);
      showSuccess('Commodity deleted.');
      loadPrices();
    } catch (err) {
      setError('Failed to delete commodity.');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #E8F5E9', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#888' }}>Loading market prices...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-market-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Market Prices</h1>
            <p className="admin-page-sub">Manage live commodity prices displayed to users</p>
          </div>
          <div className="header-actions">
            <button className="export-btn" onClick={() => setShowAddModal(true)}>+ Add Commodity</button>
            <button className="export-btn" style={{ background: '#E8F5E9', color: '#2E7D32', border: '1.5px solid #C8E6C9' }} onClick={loadPrices}>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FFEBEE', border: '1.5px solid #E53935', color: '#C62828', padding: '12px 18px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', marginBottom: 16 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#E8F5E9', border: '1.5px solid #4CAF50', color: '#2E7D32', padding: '12px 18px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', marginBottom: 16 }}>
            {successMsg}
          </div>
        )}

        {/* Prices Grid */}
        <div className="prices-grid">
          {prices.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: 40, gridColumn: '1 / -1' }}>No market prices found</div>
          ) : prices.map(p => (
            <div key={p.id} className="price-admin-card">
              <div className="price-card-top">
                <div className="price-name-row">
                  <span className="price-name">{p.commodityName}</span>
                </div>
                <div className="price-card-actions">
                  <button className="action-btn edit" onClick={() => startEdit(p)} title="Edit">Edit</button>
                  <button className="action-btn delete" onClick={() => handleDelete(p.id)} title="Delete">Del</button>
                </div>
              </div>

              {editId === p.id ? (
                <div className="price-edit-row">
                  <span className="price-rupee">Rs.</span>
                  <input
                    type="number"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    className="price-edit-input"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(p.id); if (e.key === 'Escape') setEditId(null); }}
                  />
                  <span className="price-unit">/{p.unit}</span>
                  <button className="save-price-btn" onClick={() => saveEdit(p.id)} disabled={saving}>&#10003;</button>
                  <button className="cancel-price-btn" onClick={() => setEditId(null)}>&#10005;</button>
                </div>
              ) : (
                <div className="price-display">
                  <div className="price-current">Rs.{Number(p.price).toFixed(2)} <span>/{p.unit}</span></div>
                  <div className={`price-change-badge ${Number(p.change) >= 0 ? 'up' : 'down'}`}>
                    {Number(p.change) >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(Number(p.change))}%
                  </div>
                </div>
              )}

              {p.updatedAt && (
                <div className="price-prev">
                  Updated: {new Date(p.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Crop Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="modal-header">
                <h3>Add New Commodity Price</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>&#10005;</button>
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Commodity Name</label>
                    <input
                      type="text"
                      className="auth-input no-icon"
                      placeholder="e.g., Onion"
                      value={newCrop.commodityName}
                      onChange={e => setNewCrop(p => ({ ...p, commodityName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Price (Rs.)</label>
                    <input
                      type="number"
                      className="auth-input no-icon"
                      placeholder="e.g., 25"
                      value={newCrop.price}
                      onChange={e => setNewCrop(p => ({ ...p, price: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select className="auth-input no-icon" value={newCrop.unit} onChange={e => setNewCrop(p => ({ ...p, unit: e.target.value }))}>
                      <option value="per kg">Per kg</option>
                      <option value="per piece">Per piece</option>
                      <option value="per quintal">Per quintal</option>
                      <option value="per dozen">Per dozen</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="auth-submit-btn" style={{ padding: '10px 24px', borderRadius: 10 }} onClick={addCrop} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Commodity'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
