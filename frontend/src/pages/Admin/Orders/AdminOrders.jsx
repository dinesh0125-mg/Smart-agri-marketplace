import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { getOrders, updateOrderStatus } from '../../../api/adminService';
import './AdminOrders.css';

const statusColors = {
  DELIVERED:  { bg: '#E8F5E9', color: '#2E7D32', label: 'Delivered' },
  PROCESSING: { bg: '#FFF3E0', color: '#E65100', label: 'Processing' },
  CONFIRMED:  { bg: '#E3F2FD', color: '#1565C0', label: 'Confirmed' },
  SHIPPED:    { bg: '#E3F2FD', color: '#1565C0', label: 'Shipped' },
  PENDING:    { bg: '#FFF8E1', color: '#F9A825', label: 'Pending' },
  CANCELLED:  { bg: '#FFEBEE', color: '#C62828', label: 'Cancelled' },
};

const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { loadOrders(); }, [page]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOrders(page, 20);
      const data = res.data;
      setOrders(Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []);
      setTotalOrders(data?.totalElements || 0);
    } catch (err) {
      setError('Failed to load orders. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      showSuccess(`Order #ORD-${selectedOrder.id} status updated to ${newStatus}.`);
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      setError('Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = (o.buyerName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = statusFilter === 'all' || (o.orderStatus || '').toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #E8F5E9', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#888' }}>Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-orders-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Orders Management</h1>
            <p className="admin-page-sub">Track and manage all customer orders</p>
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

        {/* Filters */}
        <div className="admin-card filters-bar">
          <div className="filters-left">
            <div className="admin-search-input">
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="cat-filter-tabs">
              {['all', ...allStatuses].map(s => (
                <button
                  key={s}
                  className={`cat-tab ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-card table-card">
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 24 }}>No orders found</td></tr>
                ) : filtered.map(order => {
                  const status = String(order.orderStatus || 'PENDING').toUpperCase();
                  const s = statusColors[status] || statusColors.PENDING;
                  return (
                    <tr key={order.id}>
                      <td><span className="order-id">#ORD-{order.id}</span></td>
                      <td><div className="order-customer">{order.buyerName || '—'}</div></td>
                      <td><strong style={{ color: '#2E7D32' }}>Rs.{Number(order.totalAmount || 0).toLocaleString()}</strong></td>
                      <td><span className="payment-tag">{order.paymentStatus || '—'}</span></td>
                      <td>
                        <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn view" title="View Details" onClick={() => { setSelectedOrder(order); setNewStatus(order.orderStatus || 'PENDING'); }}>View</button>
                          <button className="action-btn edit" title="Update Status" onClick={() => { setSelectedOrder(order); setNewStatus(order.orderStatus || 'PENDING'); }}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-info">Showing {filtered.length} of {totalOrders} orders</span>
            <div className="pagination">
              <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>&lsaquo;</button>
              <button className="page-btn active">{page + 1}</button>
              <button className="page-btn" onClick={() => setPage(p => p + 1)}>&rsaquo;</button>
            </div>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => !updating && setSelectedOrder(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
              <div className="modal-header">
                <h3>Order #ORD-{selectedOrder.id}</h3>
                <button className="modal-close" onClick={() => setSelectedOrder(null)}>&#10005;</button>
              </div>
              <div className="modal-body">
                <div className="order-detail-grid">
                  {[
                    ['Customer', selectedOrder.buyerName || '—'],
                    ['Amount', `Rs.${Number(selectedOrder.totalAmount || 0).toLocaleString()}`],
                    ['Payment', selectedOrder.paymentStatus || '—'],
                    ['Address', selectedOrder.deliveryAddress || '—'],
                    ['Date', selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '—'],
                  ].map(([label, val]) => (
                    <div key={label} className="order-detail-row">
                      <span className="order-detail-label">{label}</span>
                      <span className="order-detail-val">{val}</span>
                    </div>
                  ))}
                  <div className="order-detail-row">
                    <span className="order-detail-label">Current Status</span>
                    <span className="status-badge" style={{
                      background: (statusColors[String(selectedOrder.orderStatus || 'PENDING').toUpperCase()] || statusColors.PENDING).bg,
                      color: (statusColors[String(selectedOrder.orderStatus || 'PENDING').toUpperCase()] || statusColors.PENDING).color,
                    }}>
                      {(statusColors[String(selectedOrder.orderStatus || 'PENDING').toUpperCase()] || statusColors.PENDING).label}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <label className="form-label">Items</label>
                    {selectedOrder.orderItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.875rem', borderBottom: '1px solid #f0f0f0' }}>
                        <span>{item.productName} x{item.quantity}</span>
                        <span>Rs.{Number(item.price || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <label className="form-label">Update Status</label>
                  <select className="auth-input no-icon" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {allStatuses.map(s => (
                      <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-cancel" onClick={() => setSelectedOrder(null)}>Close</button>
                <button
                  className="auth-submit-btn"
                  style={{ padding: '10px 24px', borderRadius: 10 }}
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
