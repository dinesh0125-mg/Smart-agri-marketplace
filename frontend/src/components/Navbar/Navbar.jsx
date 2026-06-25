import React, {
  useState,
  useEffect,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

import Logo from '../Logo/Logo';
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const { cartCount } = useCart();
  const {
    user,
    isAuthenticated,
    logout,
    isAdmin,
    isFarmer,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (!e.target.closest(".profile-wrap")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "Farmers", path: "/farmers/1" },
    { label: "Market Prices", path: "/#market" },
    { label: "AI Assistant", path: "/ai-assistant" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Logo size="small" variant="dark" />
        </Link>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {isAdmin && isAdmin() && (
            <li>
              <Link to="/admin" className="nav-link admin-link">
                Admin
              </Link>
            </li>
          )}

          {(isAdmin && isAdmin()) || (isFarmer && isFarmer()) ? (
            <li>
              <Link
                to="/my-products"
                className={`nav-link seller-link ${location.pathname === "/my-products" ? "active" : ""}`}
              >
                {isFarmer && isFarmer() ? "My Products" : "Products"}
              </Link>
            </li>
          ) : null}
        </ul>

        <div className={`nav-search ${searchOpen ? "open" : ""}`}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn-icon" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={() => setSearchOpen((s) => !s)}
            title="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>

          <Link to="/cart" className="icon-btn" title="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && (
              <span className="badge">{cartCount}</span>
            )}
          </Link>

          <div className="profile-wrap">
            <button
              className="icon-btn profile-btn"
              onClick={() => setProfileOpen((o) => !o)}
            >
              <span className="user-avatar-nav">
                {isAuthenticated
                  ? (user?.fullName?.charAt(0)?.toUpperCase() || 'U')
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              </span>
              {isAuthenticated && (
                <span className="online-dot-nav" />
              )}
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                {isAuthenticated ? (
                  <>
                    <div className="profile-dd-header">
                      <span className="profile-dd-avatar">
                        {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                      <div>
                        <div className="profile-dd-name">{user?.fullName}</div>
                        <div className="profile-dd-role">{user?.role}</div>
                      </div>
                    </div>

                    <div className="profile-dd-divider" />

                    {isAdmin && isAdmin() && (
                      <Link to="/admin" className="profile-dd-item">
                        Admin Panel
                      </Link>
                    )}

                    {((isAdmin && isAdmin()) || (isFarmer && isFarmer())) && (
                      <Link to="/my-products" className="profile-dd-item">
                        {isFarmer && isFarmer() ? "My Products" : "Manage Products"}
                      </Link>
                    )}

                    <Link to="/cart" className="profile-dd-item">
                      My Orders
                    </Link>

                    <div className="profile-dd-divider" />

                    <button
                      className="profile-dd-item logout"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="profile-dd-item">
                      Sign In
                    </Link>
                    <Link to="/register" className="profile-dd-item">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((m) => !m)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="mobile-search">
          <input
            type="text"
            placeholder="Search products, crops, seeds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus
          />
        </div>
      )}
    </nav>
  );
}