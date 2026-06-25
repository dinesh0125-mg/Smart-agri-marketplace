import React, { useState } from 'react';
import api from '../../api/axios';
import './Contact.css';

const contactInfo = [
  { icon: '', title: 'Our Address', value: '42, Agri Tower, MG Road, Bengaluru, Karnataka 560001', link: null },
  { icon: '', title: 'Phone', value: '+91 80 4567 8900', link: 'tel:+918045678900' },
  { icon: '', title: 'Email', value: 'support@smartagri.in', link: 'mailto:support@smartagri.in' },
  { icon: '', title: 'Working Hours', value: 'Mon – Sat: 9 AM – 7 PM IST', link: null },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', type: 'buyer' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contact', {
        name:    form.name,
        email:   form.email,
        subject: form.subject,
        message: `[${form.type.toUpperCase()}] ${form.message}${form.phone ? `\n\nPhone: ${form.phone}` : ''}`,
      });
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '', type: 'buyer' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="container contact-hero-content">
          <p className="section-pre">Get In Touch</p>
          <h1 className="contact-hero-title">We'd Love to <span>Hear From You</span></h1>
          <p className="contact-hero-desc">Whether you're a farmer, buyer, investor, or journalist — we're here to help.</p>
        </div>
      </section>

      <div className="container contact-body">
        {/* Form */}
        <div className="contact-form-wrap">
          <div className="form-header">
            <h2>Send us a Message</h2>
            <p>Fill in the form below and we'll get back to you within 24 hours.</p>
          </div>

          {submitted && (
            <div className="success-alert">
               Message sent! We'll get back to you within 24 hours.
            </div>
          )}

          {error && (
            <div className="error-alert">
               {error}
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            {/* Type Selector */}
            <div className="form-row">
              <label className="form-label">I am a</label>
              <div className="type-selector">
                {['buyer', 'farmer', 'investor', 'other'].map(t => (
                  <label key={t} className={`type-option ${form.type === t ? 'active' : ''}`}>
                    <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} />
                    <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select name="subject" value={form.subject} onChange={handleChange} className="form-input" required>
                  <option value="">Select a subject</option>
                  <option value="order">Order Related</option>
                  <option value="farmer">Become a Farmer/Seller</option>
                  <option value="bulk">Bulk Purchasing</option>
                  <option value="partnership">Partnership</option>
                  <option value="support">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Tell us how we can help you..."
                rows={5}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? ' Sending...' : ' Send Message'}
            </button>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div className="contact-info">
          <div className="info-card">
            <h3>Contact Information</h3>
            <div className="info-list">
              {contactInfo.map((item, i) => (
                <div key={i} className="info-item">
                  <div className="info-icon">{item.icon}</div>
                  <div>
                    <div className="info-title">{item.title}</div>
                    {item.link
                      ? <a href={item.link} className="info-value link">{item.value}</a>
                      : <div className="info-value">{item.value}</div>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="map-placeholder">
            <div className="map-content">
              <span className="map-pin"></span>
              <p>42, Agri Tower<br />MG Road, Bengaluru<br />Karnataka 560001</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: 'inline-flex', marginTop: 16, fontSize: '0.85rem', padding: '10px 20px' }}
              >
                Open in Google Maps →
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="social-card">
            <h4>Follow Us</h4>
            <div className="social-links">
              {[
                { icon: '', label: 'Facebook', handle: '@SmartAgriIN' },
                { icon: '', label: 'Instagram', handle: '@smartagri.in' },
                { icon: '', label: 'Twitter', handle: '@SmartAgriIN' },
                { icon: '', label: 'LinkedIn', handle: 'Smart Agriculture' },
              ].map(s => (
                <div key={s.label} className="social-link-item">
                  <span className="social-link-icon">{s.icon}</span>
                  <div>
                    <div className="social-link-label">{s.label}</div>
                    <div className="social-link-handle">{s.handle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
