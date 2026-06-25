import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { getUsers, blockUser, activateUser, deleteUser } from '../../../api/adminService';
import './AdminUsers.css';

const statusConfig = {
  ACTIVE: { bg: '#E8F5E9', color: '#2E7D32', label: 'Active' },
  INACTIVE: { bg: '#F5F5F5', color: '#888', label: 'Inactive' },
  BLOCKED: { bg: '#FFEBEE', color: '#C62828', label: 'Blocked' },
  PENDING_VERIFICATION: { bg: '#FFF3E0', color: '#E65100', label: 'Pending' },
};

const roleConfig = {
  ADMIN: { bg: '#EDE7F6', color: '#5E35B1' },
  BUYER: { bg: '#E3F2FD', color: '#1565C0' },
  FARMER: { bg: '#E8F5E9', color: '#2E7D32' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => { loadUsers(); }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUsers(page, 20);
      const data = res.data;
      setUsers(Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []);
      setTotalUsers(data?.totalElements || 0);
    } catch (err) {
      setError('Failed to load users. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const handleBlock = async (userId) => {
    try {
      await blockUser(userId);
      showSuccess('User blocked successfully.');
      loadUsers();
    } catch (err) {
      setError('Failed to block user.');
    }
    setConfirmAction(null);
  };

  const handleActivate = async (userId) => {
    try {
      await activateUser(userId);
      showSuccess('User activated successfully.');
      loadUsers();
    } catch (err) {
      setError('Failed to activate user.');
    }
    setConfirmAction(null);
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      showSuccess('User deleted successfully.');
      loadUsers();
    } catch (err) {
      setError('Failed to delete user.');
    }
    setConfirmAction(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || (u.role || '').toUpperCase() === roleFilter.toUpperCase();
    return matchSearch && matchRole;
  });

  const stats = {
    total: totalUsers,
    active: users.filter(u => u.status === 'ACTIVE').length,
    blocked: users.filter(u => u.status === 'BLOCKED').length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #E8F5E9', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#888' }}>Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-users-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Users Management</h1>
            <p className="admin-page-sub">{totalUsers} registered users</p>
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
            { label: 'Total Users', value: stats.total, color: '#E8F5E9' },
            { label: 'Active', value: stats.active, color: '#E8F5E9' },
            { label: 'Blocked', value: stats.blocked, color: '#FFEBEE' },
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
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="cat-filter-tabs">
              {['all', 'BUYER', 'FARMER', 'ADMIN'].map(r => (
                <button
                  key={r}
                  className={`cat-tab ${roleFilter === r ? 'active' : ''}`}
                  onClick={() => setRoleFilter(r)}
                >
                  {r === 'all' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-card table-card">
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 24 }}>No users found</td></tr>
                ) : filtered.map(user => {
                  const sc = statusConfig[user.status] || statusConfig.ACTIVE;
                  const rc = roleConfig[user.role] || roleConfig.BUYER;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-icon">{(user.fullName || 'U').charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="user-name">{user.fullName}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="role-badge" style={{ background: rc.bg, color: rc.color }}>
                          {(user.role || '').charAt(0) + (user.role || '').slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="order-date">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="action-btns">
                          {user.status !== 'BLOCKED'
                            ? <button className="action-btn delete" title="Block" onClick={() => setConfirmAction({ type: 'block', user })}>Block</button>
                            : <button className="action-btn view" title="Activate" onClick={() => setConfirmAction({ type: 'activate', user })}>Activate</button>
                          }
                          {user.role !== 'ADMIN' && (
                            <button className="action-btn delete" title="Delete" onClick={() => setConfirmAction({ type: 'delete', user })}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-info">Showing {filtered.length} of {totalUsers} users</span>
            <div className="pagination">
              <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>&lsaquo;</button>
              <button className="page-btn active">{page + 1}</button>
              <button className="page-btn" onClick={() => setPage(p => p + 1)}>&rsaquo;</button>
            </div>
          </div>
        </div>

        {/* Confirm Dialog */}
        {confirmAction && (
          <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center', padding: 36 }}>
              <h3 style={{ marginBottom: 10, fontFamily: 'Playfair Display, serif' }}>
                {confirmAction.type === 'block' && 'Block User?'}
                {confirmAction.type === 'activate' && 'Activate User?'}
                {confirmAction.type === 'delete' && 'Delete User?'}
              </h3>
              <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: 24 }}>
                {confirmAction.type === 'block' && `This will block ${confirmAction.user.fullName} from accessing the platform.`}
                {confirmAction.type === 'activate' && `This will reactivate ${confirmAction.user.fullName}'s account.`}
                {confirmAction.type === 'delete' && `This will permanently delete ${confirmAction.user.fullName}'s account.`}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="modal-cancel" onClick={() => setConfirmAction(null)} style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button
                  style={{ flex: 1, background: confirmAction.type === 'activate' ? '#2E7D32' : '#E53935', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                  onClick={() => {
                    if (confirmAction.type === 'block') handleBlock(confirmAction.user.id);
                    else if (confirmAction.type === 'activate') handleActivate(confirmAction.user.id);
                    else if (confirmAction.type === 'delete') handleDelete(confirmAction.user.id);
                  }}
                >
                  {confirmAction.type === 'block' && 'Block'}
                  {confirmAction.type === 'activate' && 'Activate'}
                  {confirmAction.type === 'delete' && 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
