'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void> | void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show || !prompt) return null;

  const install = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, maxWidth: 340, width: 'calc(100% - 2rem)',
      background: 'var(--fn-surface)',
      border: '1px solid var(--fn-border)',
      borderRadius: 12, padding: '0.7rem 0.9rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'slideUp 0.2s ease',
    }}>
      <Image src="/logo.svg" alt="" width={32} height={32} style={{ borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--fn-font-brand)', fontSize: 17, fontWeight: 700,
          color: 'var(--fn-text)', margin: 0, lineHeight: 1.2 }}>Foylx Note</p>
        <p style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 10,
          color: 'var(--fn-muted)', margin: 0 }}>works offline · install as app</p>
      </div>
      <button onClick={install} className="fn-btn fn-btn-primary" style={{ fontSize: 12, padding: '0.35rem 0.8rem', flexShrink: 0 }}>
        Install
      </button>
      <button onClick={() => setShow(false)} style={{
        background: 'none', border: 'none', color: 'var(--fn-muted)',
        cursor: 'pointer', padding: 4, flexShrink: 0, lineHeight: 0,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
