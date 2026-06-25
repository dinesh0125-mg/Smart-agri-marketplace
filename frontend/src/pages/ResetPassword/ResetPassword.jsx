import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/authService';
import Logo from '../../components/Logo/Logo';
import './ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }

    if (!form.newPassword || form.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, form.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-content">
            <Link to="/" className="auth-logo">
              <Logo size="medium" variant="light" />
            </Link>
            <h1 className="auth-left-title">
              Set a New<br /><span>Password</span>
            </h1>
            <div className="auth-left-img">
              <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80" alt="Farm" />
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="rp-invalid">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <h2>Invalid Reset Link</h2>
              <p>This password reset link is invalid or has expired.</p>
              <Link to="/forgot-password" className="auth-submit-btn" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center', marginTop: 16 }}>
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <Logo size="medium" variant="light" />
          </Link>
          <h1 className="auth-left-title">
            Set a New<br /><span>Password</span>
          </h1>
          <p className="auth-left-desc">
            Choose a strong password to secure your Smart Agriculture Marketplace account.
          </p>
          <div className="auth-left-img">
            <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80" alt="Farm" />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {success ? (
            <div className="rp-success">
              <div className="rp-success-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2>Password Reset!</h2>
              <p className="rp-success-msg">
                Your password has been successfully reset. Redirecting you to the login page...
              </p>
              <div className="rp-redirect-spinner">
                <span className="spinner" style={{ borderColor: 'rgba(46,125,50,0.3)', borderTopColor: '#2E7D32', width: 28, height: 28, borderWidth: 3 }} />
              </div>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h2>Reset Password</h2>
                <p>Create a new password for your account</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="auth-input"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {form.newPassword && (
                    <div className="pw-strength-bar">
                      <div className={`pw-bar ${form.newPassword.length >= 8 ? 'strong' : form.newPassword.length >= 6 ? 'medium' : 'weak'}`} />
                      <span className="pw-strength-text">
                        {form.newPassword.length >= 8 ? 'Strong' : form.newPassword.length >= 6 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your new password"
                      className="auth-input"
                      required
                    />
                  </div>
                  {form.confirmPassword && (
                    <span className={`pw-match-indicator ${form.newPassword === form.confirmPassword ? 'match' : 'mismatch'}`}>
                      {form.newPassword === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading"><span className="spinner" /> Resetting...</span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p className="auth-switch" style={{ marginTop: 24 }}>
                Remember your password? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
