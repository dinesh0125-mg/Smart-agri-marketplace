import React from 'react';
import './About.css';

const team = [
  { name: 'Arjun Sharma', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80', desc: 'Former IIT graduate with 10 years in AgriTech' },
  { name: 'Priya Menon', role: 'CTO', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', desc: 'AI/ML expert and full-stack engineer' },
  { name: 'Rahul Verma', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', desc: '15 years supply chain experience' },
  { name: 'Kavitha Nair', role: 'Head of Farmer Relations', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', desc: 'Agriculture scientist & rural development expert' },
];

const timeline = [
  { year: '2020', title: 'Founded', desc: 'Started with 50 farmers in Tamil Nadu' },
  { year: '2021', title: 'Series A', desc: 'Raised ₹25Cr, expanded to 5 states' },
  { year: '2022', title: '10,000 Farmers', desc: 'Pan-India operations, launched AI assistant' },
  { year: '2023', title: 'Series B', desc: 'Raised ₹100Cr, 100+ cities covered' },
  { year: '2024', title: 'Today', desc: '50,000+ products, 98% satisfaction rate' },
];

const impact = [
  { value: '₹850Cr+', label: 'Farmer Revenue Generated', icon: '' },
  { value: '10,000+', label: 'Farmers Empowered', icon: '' },
  { value: '2.5M+', label: 'Happy Customers', icon: '' },
  { value: '30%', label: 'Avg. Income Increase', icon: '' },
];

export default function About() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80" alt="Farm" />
          <div className="about-hero-overlay" />
        </div>
        <div className="container about-hero-content">
          <span className="about-badge"> Our Story</span>
          <h1>Revolutionizing Indian Agriculture</h1>
          <p>We believe every farmer deserves fair prices and every consumer deserves fresh, authentic produce. Smart Agriculture Marketplace bridges this gap with technology and trust.</p>
        </div>
      </section>

      <div className="container">
        {/* Mission & Vision */}
        <section className="mv-section">
          <div className="mv-card mission">
            <div className="mv-icon"></div>
            <h2>Our Mission</h2>
            <p>To eliminate middlemen and create a transparent, fair, and technology-driven agriculture marketplace that empowers 100 million farmers and feeds 1.4 billion Indians with fresh, authentic produce.</p>
          </div>
          <div className="mv-card vision">
            <div className="mv-icon"></div>
            <h2>Our Vision</h2>
            <p>A future where every Indian farmer has direct access to global markets, AI-powered insights, and the tools to build prosperous, sustainable farming businesses that feed nations.</p>
          </div>
        </section>

        {/* Impact */}
        <section className="impact-section">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: 8 }}>
            <p className="section-pre">Our Numbers</p>
            <h2 className="section-title">Impact at <span>Scale</span></h2>
          </div>
          <div className="impact-grid">
            {impact.map((item, i) => (
              <div key={i} className="impact-card">
                <div className="impact-icon">{item.icon}</div>
                <div className="impact-value">{item.value}</div>
                <div className="impact-label">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="timeline-section">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: 8, marginBottom: 48 }}>
            <p className="section-pre">Our Journey</p>
            <h2 className="section-title">How We <span>Grew</span></h2>
          </div>
          <div className="timeline">
            {timeline.map((item, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <div className="timeline-year">{item.year}</div>
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-desc">{item.desc}</p>
                </div>
                <div className="timeline-dot" />
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="team-section">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
            <p className="section-pre">The People</p>
            <h2 className="section-title">Meet the <span>Team</span></h2>
          </div>
          <div className="team-grid">
            {team.map((member, i) => (
              <div key={i} className="team-card">
                <img src={member.img} alt={member.name} className="team-img" />
                <div className="team-info">
                  <div className="team-name">{member.name}</div>
                  <div className="team-role">{member.role}</div>
                  <p className="team-desc">{member.desc}</p>
                </div>
                <div className="team-social">
                  <a href="#"></a>
                  <a href="#"></a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
