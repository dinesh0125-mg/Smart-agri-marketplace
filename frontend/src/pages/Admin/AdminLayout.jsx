import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const navItems = [
  { path: '/admin', icon: 'grid', label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: 'package', label: 'Products' },
  { path: '/admin/orders', icon: 'clipboard', label: 'Orders' },
  { path: '/admin/farmers', icon: 'users', label: 'Farmers' },
  { path: '/admin/users', icon: 'user', label: 'Users' },
  { path: '/admin/market-prices', icon: 'trending', label: 'Market Prices' },
];

const iconMap = {
  grid: '\u2637',
  package: '\u25A3',
  clipboard: '\u2263',
  users: '\u2638',
  user: '\u2639',
  trending: '\u2197',
  globe: '\u2302',
  logout: '\u2192',
};

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand">
            <span className="admin-brand-icon">SA</span>
            {sidebarOpen && (
              <div>
                <div className="admin-brand-title">AgriAdmin</div>
                <div className="admin-brand-sub">Control Panel</div>
              </div>
            )}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(s => !s)}>
            {sidebarOpen ? '\u25C0' : '\u25B6'}
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="admin-nav-icon">{iconMap[item.icon] || '\u2022'}</span>
              {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
              {sidebarOpen && isActive(item) && <span className="active-indicator" />}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item" title="View Site">
            <span className="admin-nav-icon">{iconMap.globe}</span>
            {sidebarOpen && <span className="admin-nav-label">View Site</span>}
          </Link>
          <button className="admin-nav-item logout-btn" onClick={handleLogout} title="Logout">
            <span className="admin-nav-icon">{iconMap.logout}</span>
            {sidebarOpen && <span className="admin-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(s => !s)}>&#9776;</button>
            <div className="admin-breadcrumb">
              {location.pathname.split('/').filter(Boolean).map((part, i, arr) => (
                <span key={i}>
                  {i > 0 && <span className="breadcrumb-sep"> / </span>}
                  <span className={i === arr.length - 1 ? 'breadcrumb-current' : 'breadcrumb-link'}>
                    {part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-search-box">
              <input type="text" placeholder="Search..." />
            </div>

            <div className="topbar-icon-group">
              <button className="topbar-icon-btn" onClick={() => setNotifOpen(n => !n)}>
                Alerts
                <span className="notif-badge">3</span>
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  {[
                    { text: 'New order #1042 received', time: '2 min ago' },
                    { text: 'Farmer Ramesh Kumar verified', time: '1 hr ago' },
                    { text: 'Low stock: Organic Tomatoes', time: '3 hr ago' },
                  ].map((n, i) => (
                    <div key={i} className="notif-item">
                      <div>
                        <div className="notif-text">{n.text}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </div>
                  ))}
                  <div className="notif-footer">View all notifications</div>
                </div>
              )}
            </div>

            <div className="admin-user-chip">
              <span className="admin-user-avatar">{user?.fullName?.charAt(0)?.toUpperCase() || 'A'}</span>
              <div>
                <div className="admin-user-name">{user?.fullName || 'Admin'}</div>
                <div className="admin-user-role">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
