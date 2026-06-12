'use client';
import React from 'react';
import Image from 'next/image';

export function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', width: '100vw',
      background: 'var(--fn-bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <Image src="/logo.svg" alt="Foylx Note" width={52} height={52}
          style={{ borderRadius: 14, marginBottom: '1.25rem', animation: 'pulse 2s ease-in-out infinite' }} />
        <div style={{
          fontFamily: 'var(--fn-font-brand)', fontSize: 28, fontWeight: 700,
          color: 'var(--fn-text)', marginBottom: 6, letterSpacing: '-0.01em',
        }}>Foylx Note</div>
        <p style={{
          fontFamily: 'var(--fn-font-mono)', fontSize: 11,
          color: 'var(--fn-muted)', marginBottom: '1.5rem',
        }}>loading your notebooks…</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--fn-accent)',
              opacity: 0.7,
              animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.55} }
      `}</style>
    </div>
  );
}
