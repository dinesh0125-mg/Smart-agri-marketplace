import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { getDashboard, getOrders } from '../../../api/adminService';
import './AdminDashboard.css';

const statusColors = {
  DELIVERED:  { bg: '#E8F5E9', color: '#2E7D32', label: 'Delivered' },
  PROCESSING: { bg: '#FFF3E0', color: '#E65100', label: 'Processing' },
  CONFIRMED:  { bg: '#E3F2FD', color: '#1565C0', label: 'Confirmed' },
  SHIPPED:    { bg: '#E3F2FD', color: '#1565C0', label: 'Shipped' },
  PENDING:    { bg: '#FFF8E1', color: '#F9A825', label: 'Pending' },
  CANCELLED:  { bg: '#FFEBEE', color: '#C62828', label: 'Cancelled' },
};

function MiniBarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => Number(d.revenue) || 0), 1);
  return (
    <div className="mini-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="mini-bar-wrap" title={`${d.month}: Rs.${Number(d.revenue || 0).toLocaleString()}`}>
          <div
            className="mini-bar"
            style={{ height: `${(Number(d.revenue || 0) / max) * 100}%` }}
          />
          <span className="mini-bar-label">{String(d.month).slice(0, 1)}</span>
        </div>
      ))}
    </div>
  );
}

function formatCurrency(val) {
  const n = Number(val) || 0;
  if (n >= 10000000) return `Rs.${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `Rs.${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `Rs.${(n / 1000).toFixed(1)}K`;
  return `Rs.${n.toLocaleString()}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, ordersRes] = await Promise.all([
        getDashboard(),
        getOrders(0, 6),
      ]);
      setDashboard(dashRes.data);
      const ordersData = ordersRes.data;
      setRecentOrders(
        Array.isArray(ordersData?.content) ? ordersData.content :
        Array.isArray(ordersData) ? ordersData : []
      );
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = dashboard ? [
    { title: 'Total Revenue', value: formatCurrency(dashboard.totalRevenue), color: '#E8F5E9' },
    { title: 'Total Orders', value: String(dashboard.totalOrders || 0), color: '#E3F2FD' },
    { title: 'Active Farmers', value: String(dashboard.totalFarmers || 0), color: '#F3E5F5' },
    { title: 'Active Buyers', value: String(dashboard.totalBuyers || 0), color: '#FFF3E0' },
    { title: 'Pending Approvals', value: String(dashboard.pendingFarmerApprovals || 0), color: '#FBE9E7' },
  ] : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #E8F5E9', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#888' }}>Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <p style={{ color: '#C62828', fontWeight: 600, marginBottom: 12 }}>{error}</p>
            <button className="export-btn" onClick={loadDashboard}>Retry</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Dashboard Overview</h1>
            <p className="admin-page-sub">Welcome back. Here is your current overview.</p>
          </div>
          <div className="header-actions">
            <button className="export-btn" onClick={loadDashboard}>Refresh Data</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          {kpiCards.map((kpi, i) => (
            <div
              className="kpi-card"
              key={i}
              style={{ background: kpi.color }}
            >
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-title">{kpi.title}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Revenue Chart */}
          <div className="admin-card chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Revenue Overview</h3>
                <p className="card-sub">Monthly revenue</p>
              </div>
              <div className="chart-legend">
                <span className="legend-dot green" />
                <span>Revenue {new Date().getFullYear()}</span>
              </div>
            </div>
            <MiniBarChart data={dashboard?.monthlyRevenue || []} />
          </div>

          {/* Category Breakdown */}
          <div className="admin-card donut-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Sales by Category</h3>
                <p className="card-sub">Top categories this month</p>
              </div>
            </div>
            <div className="donut-chart-wrap">
              <div className="donut-chart">
                <svg viewBox="0 0 100 100" width="160" height="160">
                  {[
                    { pct: 32, color: '#4CAF50', offset: 0 },
                    { pct: 24, color: '#2196F3', offset: 32 },
                    { pct: 18, color: '#FF9800', offset: 56 },
                    { pct: 14, color: '#9C27B0', offset: 74 },
                    { pct: 12, color: '#F44336', offset: 88 },
                  ].map((seg, i) => {
                    const r = 35;
                    const circ = 2 * Math.PI * r;
                    const dash = (seg.pct / 100) * circ;
                    const gap = circ - dash;
                    const rotate = (seg.offset / 100) * 360 - 90;
                    return (
                      <circle
                        key={i}
                        cx="50" cy="50" r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeDasharray={`${dash} ${gap}`}
                        transform={`rotate(${rotate} 50 50)`}
                      />
                    );
                  })}
                  <text x="50" y="46" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Total</text>
                  <text x="50" y="58" textAnchor="middle" fontSize="8" fill="#888">Sales</text>
                </svg>
              </div>
              <div className="donut-legend">
                {[
                  { label: 'Vegetables', pct: '32%', color: '#4CAF50' },
                  { label: 'Fruits', pct: '24%', color: '#2196F3' },
                  { label: 'Grains', pct: '18%', color: '#FF9800' },
                  { label: 'Organic', pct: '14%', color: '#9C27B0' },
                  { label: 'Others', pct: '12%', color: '#F44336' },
                ].map(item => (
                  <div key={item.label} className="donut-leg-item">
                    <span className="donut-leg-dot" style={{ background: item.color }} />
                    <span className="donut-leg-label">{item.label}</span>
                    <span className="donut-leg-pct">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="bottom-row">
          {/* Recent Orders */}
          <div className="admin-card orders-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recent Orders</h3>
                <p className="card-sub">Latest orders</p>
              </div>
              <button className="view-all-link" onClick={() => navigate('/admin/orders')}>View All &rarr;</button>
            </div>
            <div className="orders-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: 24 }}>No orders yet</td></tr>
                  ) : recentOrders.map(order => {
                    const status = String(order.orderStatus || 'PENDING').toUpperCase();
                    const s = statusColors[status] || statusColors.PENDING;
                    return (
                      <tr key={order.id}>
                        <td><span className="order-id">#ORD-{order.id}</span></td>
                        <td><span className="order-customer">{order.buyerName || '—'}</span></td>
                        <td><strong>Rs.{Number(order.totalAmount || 0).toLocaleString()}</strong></td>
                        <td>
                          <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-card quick-actions-card" style={{ flex: '0 0 280px' }}>
            <h3 className="card-title" style={{ marginBottom: 16 }}>Quick Actions</h3>
            <div className="quick-actions-grid">
              {[
                { label: 'Add Product', color: '#E8F5E9', path: '/admin/products' },
                { label: 'Verify Farmer', color: '#E3F2FD', path: '/admin/farmers' },
                { label: 'Update Prices', color: '#FFF3E0', path: '/admin/market-prices' },
                { label: 'View Orders', color: '#F3E5F5', path: '/admin/orders' },
                { label: 'Manage Users', color: '#E0F7FA', path: '/admin/users' },
                { label: 'View Site', color: '#FBE9E7', path: '/' },
              ].map((a, i) => (
                <button key={i} className="quick-action-btn" style={{ background: a.color }} onClick={() => navigate(a.path)}>
                  <span className="qa-label">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
