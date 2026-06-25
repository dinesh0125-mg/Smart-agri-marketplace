import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/authService';
import Logo from '../../components/Logo/Logo';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <Logo size="medium" variant="light" />
          </Link>
          <h1 className="auth-left-title">
            Reset Your<br />Password <span>Securely</span>
          </h1>
          <p className="auth-left-desc">
            We'll send you a secure link to reset your password. Check your email inbox after submitting.
          </p>
          <div className="auth-left-img">
            <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80" alt="Farm" />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {sent ? (
            <div className="fp-success">
              <div className="fp-success-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2>Check Your Email</h2>
              <p className="fp-success-msg">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <p className="fp-success-sub">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="fp-actions">
                <button className="auth-submit-btn" onClick={() => { setSent(false); setEmail(''); }}>
                  Try Again
                </button>
                <Link to="/login" className="fp-back-link">Back to Login</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h2>Forgot Password</h2>
                <p>Enter the email address associated with your account and we'll send you a link to reset your password.</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="auth-input"
                      required
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading"><span className="spinner" /> Sending...</span>
                  ) : 'Send Reset Link'}
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
