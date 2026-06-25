import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { getFarmers, approveFarmer, rejectFarmer } from '../../../api/adminService';
import './AdminFarmers.css';

const statusConfig = {
  APPROVED: { bg: '#E8F5E9', color: '#2E7D32', label: 'Verified' },
  PENDING:  { bg: '#FFF3E0', color: '#E65100', label: 'Pending' },
  REJECTED: { bg: '#FFEBEE', color: '#C62828', label: 'Rejected' },
};

export default function AdminFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => { loadFarmers(); }, [page]);

  const loadFarmers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getFarmers(page, 20);
      const data = res.data;
      setFarmers(Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []);
      setTotalFarmers(data?.totalElements || 0);
    } catch (err) {
      setError('Failed to load farmers. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const handleApprove = async (farmerId) => {
    try {
      await approveFarmer(farmerId);
      showSuccess('Farmer approved successfully.');
      setSelectedFarmer(null);
      loadFarmers();
    } catch (err) {
      setError('Failed to approve farmer.');
    }
  };

  const handleReject = async (farmerId) => {
    try {
      await rejectFarmer(farmerId);
      showSuccess('Farmer rejected.');
      setSelectedFarmer(null);
      loadFarmers();
    } catch (err) {
      setError('Failed to reject farmer.');
    }
  };

  const filtered = farmers.filter(f => {
    const matchSearch = (f.farmName || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.farmLocation || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.userName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'verified' && f.status === 'APPROVED') ||
      (statusFilter === 'pending' && f.status === 'PENDING') ||
      (statusFilter === 'rejected' && f.status === 'REJECTED');
    return matchSearch && matchStatus;
  });

  const stats = {
    total: totalFarmers,
    verified: farmers.filter(f => f.status === 'APPROVED').length,
    pending: farmers.filter(f => f.status === 'PENDING').length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #E8F5E9', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#888' }}>Loading farmers...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-farmers-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Farmers Management</h1>
            <p className="admin-page-sub">{totalFarmers} registered farmers</p>
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

        {/* Stats */}
        <div className="order-stats-grid">
          {[
            { label: 'Total Farmers', value: stats.total, color: '#E8F5E9' },
            { label: 'Verified', value: stats.verified, color: '#E8F5E9' },
            { label: 'Pending Verification', value: stats.pending, color: '#FFF3E0' },
          ].map((s, i) => (
            <div key={i} className="order-stat-card" style={{ background: s.color }}>
              <div>
                <div className="order-stat-value">{s.value}</div>
                <div className="order-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="admin-card filters-bar">
          <div className="filters-left">
            <div className="admin-search-input">
              <input
                type="text"
                placeholder="Search by name, location, specialty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="cat-filter-tabs">
              {[['all', 'All Farmers'], ['verified', 'Verified'], ['pending', 'Pending']].map(([val, label]) => (
                <button
                  key={val}
                  className={`cat-tab ${statusFilter === val ? 'active' : ''}`}
                  onClick={() => setStatusFilter(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Farmers Grid */}
        <div className="farmers-grid">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: 40, gridColumn: '1 / -1' }}>No farmers found</div>
          ) : filtered.map(farmer => {
            const sc = statusConfig[farmer.status] || statusConfig.PENDING;
            return (
              <div key={farmer.farmerId} className="farmer-admin-card">
                <div className="farmer-admin-top">
                  <div className="farmer-admin-img-wrap">
                    <div className="farmer-admin-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '1.2rem', width: 56, height: 56, borderRadius: '50%' }}>
                      {(farmer.userName || farmer.farmName || 'F').charAt(0).toUpperCase()}
                    </div>
                    {farmer.status === 'APPROVED' && <span className="farmer-verified-badge" title="Verified" style={{ position: 'absolute', bottom: 0, right: 0, background: '#2E7D32', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#10003;</span>}
                  </div>
                  <div className="farmer-admin-info">
                    <div className="farmer-admin-name">{farmer.userName || farmer.farmName || '—'}</div>
                    <div className="farmer-admin-loc">{farmer.farmLocation || '—'}</div>
                    <div className="farmer-admin-specialty">{farmer.specialty || '—'}</div>
                  </div>
                </div>

                <div className="farmer-admin-stats">
                  <div className="fas">
                    <div className="fas-val">{farmer.experience || '—'}</div>
                    <div className="fas-label">Experience</div>
                  </div>
                  <div className="fas">
                    <div className="fas-val">
                      <span className="status-badge" style={{ background: sc.bg, color: sc.color, fontSize: '0.7rem' }}>{sc.label}</span>
                    </div>
                    <div className="fas-label">Status</div>
                  </div>
                </div>

                <div className="farmer-admin-actions">
                  <button
                    className="faa-btn view"
                    onClick={() => setSelectedFarmer(farmer)}
                  >
                    View Profile
                  </button>
                  {farmer.status === 'PENDING' && (
                    <button className="faa-btn verify" onClick={() => handleApprove(farmer.farmerId)}>Approve</button>
                  )}
                  {farmer.status === 'APPROVED' && (
                    <button className="faa-btn suspend" onClick={() => handleReject(farmer.farmerId)}>Suspend</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Farmer Detail Modal */}
        {selectedFarmer && (
          <div className="modal-overlay" onClick={() => setSelectedFarmer(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <div className="modal-header">
                <h3>Farmer Profile</h3>
                <button className="modal-close" onClick={() => setSelectedFarmer(null)}>&#10005;</button>
              </div>
              <div className="modal-body">
                <div className="farmer-modal-profile">
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', flexShrink: 0 }}>
                    {(selectedFarmer.userName || selectedFarmer.farmName || 'F').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="farmer-modal-name">{selectedFarmer.userName || selectedFarmer.farmName || '—'}</div>
                    <div className="farmer-modal-loc">{selectedFarmer.farmLocation || '—'}</div>
                    <div style={{ marginTop: 8 }}>
                      {(() => {
                        const sc = statusConfig[selectedFarmer.status] || statusConfig.PENDING;
                        return <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="order-detail-grid" style={{ marginTop: 20 }}>
                  {[
                    ['Farm Name', selectedFarmer.farmName || '—'],
                    ['Specialty', selectedFarmer.specialty || '—'],
                    ['Experience', selectedFarmer.experience || '—'],
                    ['Description', selectedFarmer.description || '—'],
                  ].map(([label, val]) => (
                    <div key={label} className="order-detail-row">
                      <span className="order-detail-label">{label}</span>
                      <span className="order-detail-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-cancel" onClick={() => setSelectedFarmer(null)}>Close</button>
                {selectedFarmer.status === 'PENDING' && (
                  <button className="auth-submit-btn" style={{ padding: '10px 24px', borderRadius: 10 }} onClick={() => handleApprove(selectedFarmer.farmerId)}>
                    Approve Farmer
                  </button>
                )}
                {selectedFarmer.status === 'APPROVED' && (
                  <button style={{ padding: '10px 24px', borderRadius: 10, background: '#E53935', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }} onClick={() => handleReject(selectedFarmer.farmerId)}>
                    Suspend Farmer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
