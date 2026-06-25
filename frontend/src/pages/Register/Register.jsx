import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registrationOtpSend, registrationOtpVerify } from '../../api/authService';
import Logo from '../../components/Logo/Logo';
import './Register.css';

const steps = ['Account Type', 'Personal Info', 'Verify Email', 'Security', 'Done'];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    role: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    farmName: '',
    farmSize: '',
    specialty: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  // OTP state
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const sendEmailOtp = async () => {
    setError('');
    setOtpSending(true);
    try {
      await registrationOtpSend(form.email);
      setOtpSent(true);
      setOtpCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setOtpSending(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setError('');
    try {
      await registrationOtpVerify(form.email, emailOtp);
      setEmailVerified(true);
      // Auto-advance to next step
      setTimeout(() => setStep(3), 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 0 && !form.role) { setError('Please select an account type'); return; }
    if (step === 1) {
      if (!form.name || !form.email) { setError('Please fill all required fields'); return; }
      if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email'); return; }
      // Move to verify step and trigger OTP send
      setStep(2);
      sendEmailOtp();
      return;
    }
    if (step === 2) {
      if (!emailVerified) { setError('Please verify your email first'); return; }
    }
    if (step === 3) {
      if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
      if (!form.agreeTerms) { setError('Please accept terms and conditions'); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    try {
      const result = await register({
        fullName: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role.toUpperCase(),
        farmName: form.role === 'farmer' ? form.farmName : null,
        farmLocation: form.role === 'farmer' ? form.location : null,
        description: '',
        experience: '',
        specialty: form.specialty || '',
      });

      if (result.success) {
        setStep(4);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  };

  const roleOptions = [
    { value: 'buyer', title: 'Buyer / Consumer', desc: 'Buy fresh produce directly from farmers', icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
      </svg>
    )},
    { value: 'farmer', title: 'Farmer / Seller', desc: 'Sell your harvest directly to buyers', icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 6 4 10 4 14c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-4-8-8-12z"/>
        <path d="M12 22V12"/>
        <path d="M8 16l4-4 4 4"/>
      </svg>
    )},
  ];

  return (
    <div className="register-page">
      {/* Left Brand Panel */}
      <div className="register-left">
        <div className="register-left-inner">
          <Link to="/" className="auth-logo">
            <Logo size="medium" variant="light" />
          </Link>

          <div className="register-visual">
            <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80" alt="Farm" />
          </div>

          <div className="register-benefits">
            <h3>Why Join Us?</h3>
            {[
              'Get up to 40% better prices than traditional mandis',
              'Direct delivery to 100+ cities across India',
              'AI-powered crop and market insights',
              'Secure payments with buyer/seller protection',
              'Rated 4.8/5 by 2.5 million users',
            ].map((text, i) => (
              <div key={i} className="benefit-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#81C784" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="register-right">
        <div className="register-form-wrap">
          {/* Progress */}
          <div className="reg-progress">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`reg-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                  <div className="reg-step-circle">
                    {i < step ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : i + 1}
                  </div>
                  <span className="reg-step-label">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`reg-step-line ${i < step ? 'done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* Step 0: Role */}
          {step === 0 && (
            <div className="reg-section">
              <div className="reg-section-title">
                <h2>Choose Account Type</h2>
                <p>Select how you want to use Smart Agriculture Marketplace</p>
              </div>
              <div className="role-cards">
                {roleOptions.map(r => (
                  <div
                    key={r.value}
                    className={`role-card ${form.role === r.value ? 'selected' : ''}`}
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  >
                    <div className="role-icon">{r.icon}</div>
                    <div className="role-title">{r.title}</div>
                    <div className="role-desc">{r.desc}</div>
                    {form.role === r.value && (
                      <div className="role-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="reg-section">
              <div className="reg-section-title">
                <h2>Personal Information</h2>
                <p>Tell us a bit about yourself</p>
              </div>
              <div className="reg-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} className="auth-input no-icon" placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="auth-input no-icon" placeholder="your@email.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="auth-input no-icon" placeholder="+91 98765 43210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className="auth-input no-icon" placeholder="City, State" />
                </div>
                {form.role === 'farmer' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Farm Name</label>
                      <input name="farmName" value={form.farmName} onChange={handleChange} className="auth-input no-icon" placeholder="e.g., Green Valley Farm" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Farm Size</label>
                      <select name="farmSize" value={form.farmSize} onChange={handleChange} className="auth-input no-icon">
                        <option value="">Select farm size</option>
                        <option>Less than 2 acres</option>
                        <option>2-5 acres</option>
                        <option>5-10 acres</option>
                        <option>10-25 acres</option>
                        <option>25+ acres</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Email Verification */}
          {step === 2 && (
            <div className="reg-section">
              <div className="reg-section-title">
                <h2>Verify Your Email</h2>
                <p>We sent a verification code to <strong>{form.email}</strong></p>
              </div>

              {emailVerified ? (
                <div className="email-verified-box">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <h3>Email Verified!</h3>
                  <p>Proceeding to security setup...</p>
                </div>
              ) : (
                <div className="otp-verify-form">
                  <div className="form-group">
                    <label className="form-label">Enter 6-digit Code</label>
                    <input
                      type="text"
                      value={emailOtp}
                      onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="auth-input otp-input"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <button
                    className="auth-submit-btn"
                    onClick={verifyEmailOtp}
                    disabled={otpSending || emailOtp.length < 6}
                  >
                    Verify Email
                  </button>
                  <div className="otp-actions">
                    {otpCountdown > 0 ? (
                      <span className="otp-timer">Resend code in {otpCountdown}s</span>
                    ) : (
                      <button className="otp-resend-btn" onClick={sendEmailOtp} disabled={otpSending}>
                        {otpSending ? 'Sending...' : 'Resend Code'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <div className="reg-section">
              <div className="reg-section-title">
                <h2>Secure Your Account</h2>
                <p>Create a strong password to protect your account</p>
              </div>
              <div className="reg-form-grid">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Password *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="auth-input no-icon" placeholder="Minimum 6 characters" required />
                  {form.password && (
                    <div className="pw-strength">
                      <div className={`pw-bar ${form.password.length >= 8 ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak'}`} />
                      <span>{form.password.length >= 8 ? 'Strong' : form.password.length >= 6 ? 'Medium' : 'Weak'}</span>
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Confirm Password *</label>
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="auth-input no-icon" placeholder="Re-enter password" required />
                  {form.confirmPassword && (
                    <span className="pw-match">
                      {form.password === form.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  )}
                </div>
              </div>
              <label className="terms-label">
                <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange} />
                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </label>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="reg-success">
              <div className="success-animation">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h2>Account Created!</h2>
              <p>Welcome to Smart Agriculture Marketplace, <strong>{form.name}</strong>!</p>
              <p className="success-sub">Redirecting you to the {form.role === 'admin' ? 'admin panel' : 'homepage'}...</p>
              <div className="success-spinner"><span className="spinner" style={{ borderColor: 'rgba(46,125,50,0.3)', borderTopColor: '#2E7D32', width: 32, height: 32, borderWidth: 3 }} /></div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 4 && step !== 2 && (
            <div className="reg-nav">
              {step > 0 && (
                <button className="reg-back-btn" onClick={() => setStep(s => s - 1)}>Back</button>
              )}
              {step < 3
                ? <button className="auth-submit-btn reg-next-btn" onClick={nextStep}>Continue</button>
                : <button className="auth-submit-btn reg-next-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? <span className="btn-loading"><span className="spinner" /> Creating...</span> : 'Create Account'}
                  </button>
              }
            </div>
          )}

          <p className="auth-switch" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
