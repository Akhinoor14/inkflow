'use client';
import React from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--fn-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      {/* Subtle ink-bleed accent top */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 1, background: 'var(--fn-accent)', opacity: 0.5,
      }} />

      <div style={{
        width: '100%', maxWidth: 360,
        background: 'var(--fn-surface)',
        border: '1px solid var(--fn-border)',
        borderRadius: 16, padding: '2.5rem 2rem',
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
      }}>
        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image src="/logo.svg" alt="Foylx Note" width={48} height={48}
            style={{ borderRadius: 12, marginBottom: '0.9rem' }} />
          <div style={{
            fontFamily: 'var(--fn-font-brand)', fontSize: 30, fontWeight: 700,
            color: 'var(--fn-text)', lineHeight: 1, marginBottom: 6,
          }}>Foylx Note</div>
          <p style={{ fontSize: 13, color: 'var(--fn-muted)', fontFamily: 'var(--fn-font-ui)' }}>
            Your handwriting, digitalised
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/app' })}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '0.72rem 1rem',
              background: '#fff', color: '#1e293b',
              border: '1px solid #e2e2e2', borderRadius: 10,
              fontFamily: 'var(--fn-font-ui)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.13)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'; }}
          >
            <svg width="17" height="17" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--fn-border)' }} />
            <span style={{ fontSize: 11, color: 'var(--fn-muted)', fontFamily: 'var(--fn-font-mono)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--fn-border)' }} />
          </div>

          <button
            onClick={() => window.location.href = '/app'}
            style={{
              width: '100%', padding: '0.7rem 1rem',
              background: 'transparent',
              border: '1px solid var(--fn-border)',
              borderRadius: 10, color: 'var(--fn-muted)',
              fontFamily: 'var(--fn-font-ui)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fn-accent)'; e.currentTarget.style.color = 'var(--fn-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--fn-border)'; e.currentTarget.style.color = 'var(--fn-muted)'; }}
          >
            Continue without account
          </button>
          <p style={{ fontSize: 11, color: 'var(--fn-muted)', textAlign: 'center',
            fontFamily: 'var(--fn-font-mono)', margin: '0.2rem 0 0' }}>
            notes stay local · sign in to sync Drive
          </p>
        </div>

        <div style={{
          marginTop: '1.75rem', paddingTop: '1.25rem',
          borderTop: '1px solid var(--fn-border)',
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {['Zero-knowledge: data never leaves your device', 'Drive sync is always optional'].map(t => (
            <p key={t} style={{
              fontSize: 11, color: 'var(--fn-muted)', textAlign: 'center',
              fontFamily: 'var(--fn-font-mono)', margin: 0,
            }}>// {t}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
