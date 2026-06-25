import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { phoneOtpRequest } from '../../api/authService';
import Logo from '../../components/Logo/Logo';
import './Login.css';

export default function Login() {
  const { login, googleLogin, phoneOtpLogin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP state
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      if (result.user.role === 'ADMIN') navigate('/admin');
      else navigate(from);
    } else {
      setError(result.error);
    }
  };

  // Google Login — initialize on script load and render official button
  const handleGoogleCredential = useCallback(async (response) => {
    setError('');
    const result = await googleLogin(response.credential);
    if (result.success) {
      if (result.user.role === 'ADMIN') navigate('/admin');
      else navigate(from);
    } else {
      setError(result.error);
    }
  }, [googleLogin, navigate, from]);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setGoogleReady(true);
      }
    };

    if (window.google && window.google.accounts) {
      initGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    }
  }, [handleGoogleCredential]);

  // Render Google button whenever the ref and SDK are ready
  useEffect(() => {
    if (googleReady && googleBtnRef.current && window.google) {
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
      });
    }
  }, [googleReady, showPhoneOtp]);

  // Phone OTP
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setOtpLoading(true);
    try {
      const data = await phoneOtpRequest(phone);
      setOtpSent(true);
      setCountdown(30);
      if (data.otp) {
        setDevOtp(data.otp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    const result = await phoneOtpLogin(phone, otp);
    if (result.success) {
      if (result.user.role === 'ADMIN') navigate('/admin');
      else navigate(from);
    } else {
      setError(result.error);
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
            Fresh from Farm<br />to Your <span>Table</span>
          </h1>
          <p className="auth-left-desc">
            Connect with 10,000+ verified farmers across India. Buy organic, fresh, and affordable produce directly.
          </p>
          <div className="auth-left-stats">
            {[['10K+', 'Farmers'], ['50K+', 'Products'], ['98%', 'Satisfaction']].map(([val, label]) => (
              <div key={label} className="auth-stat">
                <div className="auth-stat-val">{val}</div>
                <div className="auth-stat-label">{label}</div>
              </div>
            ))}
          </div>
          <div className="auth-left-img">
            <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80" alt="Farm" />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your Smart Agriculture account</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Phone OTP Mode */}
          {showPhoneOtp ? (
            <div className="phone-otp-section">
              <h3 className="otp-section-title">Phone OTP Login</h3>

              {!otpSent ? (
                <div className="otp-form">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-wrap">
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="auth-input"
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    className="auth-submit-btn"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <span className="btn-loading"><span className="spinner" /> Sending OTP...</span>
                    ) : 'Send OTP'}
                  </button>
                </div>
              ) : (
                <div className="otp-form">
                  <p className="otp-sent-msg">OTP sent to <strong>{phone}</strong></p>
                  {devOtp && (
                    <div className="dev-otp-hint">Development OTP: <strong>{devOtp}</strong></div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Enter OTP</label>
                    <div className="input-wrap">
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="auth-input otp-input"
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    className="auth-submit-btn"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="btn-loading"><span className="spinner" /> Verifying...</span>
                    ) : 'Verify & Login'}
                  </button>
                  <div className="otp-actions">
                    {countdown > 0 ? (
                      <span className="otp-timer">Resend in {countdown}s</span>
                    ) : (
                      <button className="otp-resend-btn" onClick={handleSendOtp} disabled={otpLoading}>
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button className="back-to-login-btn" onClick={() => {
                setShowPhoneOtp(false);
                setOtpSent(false);
                setOtp('');
                setPhone('');
                setDevOtp('');
                setError('');
              }}>
                Back to Email Login
              </button>
            </div>
          ) : (
            <>
              {/* Email/Password Form */}
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="auth-input"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label className="form-label">Password</label>
                    <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                  </div>
                  <div className="input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="auth-input"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowPassword(s => !s)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <label className="remember-me">
                  <input type="checkbox" /> Keep me signed in
                </label>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading"><span className="spinner" /> Signing in...</span>
                  ) : 'Sign In'}
                </button>
              </form>

              <p className="auth-switch">
                Don't have an account?{' '}
                <Link to="/register" state={{ from }}>Create one free</Link>
              </p>

              <div className="auth-social">
                <p>Or continue with</p>
                <div className="social-auth-btns-stack">
                  <div ref={googleBtnRef} className="google-btn-container" />
                  <button className="social-auth-btn phone full-width" onClick={() => {
                    setShowPhoneOtp(true);
                    setError('');
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    Login with Phone OTP
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
