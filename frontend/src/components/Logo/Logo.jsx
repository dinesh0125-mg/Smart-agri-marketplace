import React from 'react';

const leafPath = "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z";

export default function Logo({ size = 'small', variant = 'dark' }) {
  const sizes = {
    small: { icon: 28, title: '1rem', sub: '0.65rem', gap: 8 },
    medium: { icon: 36, title: '1.15rem', sub: '0.7rem', gap: 10 },
    large: { icon: 44, title: '1.4rem', sub: '0.75rem', gap: 12 },
  };

  const s = sizes[size] || sizes.small;
  const isLight = variant === 'light';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer circle */}
        <circle cx="24" cy="24" r="22" fill={isLight ? 'rgba(255,255,255,0.15)' : '#E8F5E9'} stroke={isLight ? '#81C784' : '#2E7D32'} strokeWidth="2" />
        {/* Leaf body */}
        <path
          d="M24 8C16 14 14 22 16 30C18 28 20 26 24 25C28 26 30 28 32 30C34 22 32 14 24 8Z"
          fill={isLight ? '#81C784' : '#2E7D32'}
        />
        {/* Leaf vein */}
        <path
          d="M24 12V28"
          stroke={isLight ? 'rgba(255,255,255,0.7)' : '#E8F5E9'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Left vein */}
        <path
          d="M24 18L19 22"
          stroke={isLight ? 'rgba(255,255,255,0.5)' : '#C8E6C9'}
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Right vein */}
        <path
          d="M24 20L29 24"
          stroke={isLight ? 'rgba(255,255,255,0.5)' : '#C8E6C9'}
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Stem */}
        <path
          d="M24 28C24 34 22 38 20 40"
          stroke={isLight ? '#A5D6A7' : '#1B5E20'}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: s.title,
          fontWeight: 700,
          color: isLight ? '#ffffff' : '#1A1A1A',
          lineHeight: 1.2,
        }}>
          Smart Agriculture
        </div>
        <div style={{
          fontSize: s.sub,
          color: isLight ? '#A5D6A7' : '#2E7D32',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          Marketplace
        </div>
      </div>
    </div>
  );
}
