'use client';
import React from 'react';

export default function PrivacyPage() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: '2.25rem' }}>
      <h2 style={{ fontFamily: 'var(--fn-font-display)', fontSize: 20, fontWeight: 700,
        color: 'var(--fn-text)', marginBottom: '0.9rem',
        paddingBottom: '0.5rem', borderBottom: '1px solid var(--fn-border)' }}>{title}</h2>
      {children}
    </section>
  );
  const P = ({ children }: { children: React.ReactNode }) => (
    <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--fn-muted)', marginBottom: '0.65rem' }}>{children}</p>
  );
  const Li = ({ children }: { children: React.ReactNode }) => (
    <li style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--fn-muted)', marginBottom: '0.35rem' }}>{children}</li>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fn-bg)', padding: '3rem 1.5rem',
      fontFamily: 'var(--fn-font-ui)' }}>
      <div style={{
        maxWidth: 720, margin: '0 auto',
        background: 'var(--fn-surface)',
        border: '1px solid var(--fn-border)',
        borderRadius: 16, padding: '3rem 2.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: '2rem',
          fontFamily: 'var(--fn-font-mono)', fontSize: 11, color: 'var(--fn-muted)',
          textDecoration: 'none',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fn-accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fn-muted)')}
        >← back</a>

        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--fn-font-brand)', fontSize: 32, fontWeight: 700,
            color: 'var(--fn-text)', marginBottom: 4 }}>Foylx Note</div>
          <h1 style={{ fontFamily: 'var(--fn-font-display)', fontSize: 30, fontWeight: 700,
            color: 'var(--fn-text)', margin: '0 0 6px' }}>Privacy Policy</h1>
          <p style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 11, color: 'var(--fn-muted)' }}>
            {'// Last updated: May 11, 2026'}
          </p>
        </div>

        <Section title="Introduction">
          <P>Foylx Note (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.</P>
        </Section>

        <Section title="Information We Collect">
          <ul style={{ paddingLeft: '1.25rem', listStyle: 'none' }}>
            {[
              ['Account Information', 'Email, name, profile picture (Google auth)'],
              ['Notebook Data', 'Notes, drawings, handwriting, text, shapes, images'],
              ['Media Files', 'Audio recordings, OCR-processed text, exports'],
              ['Usage Information', 'Features used, timestamps, performance data'],
              ['Device Information', 'Browser type, OS, device fingerprint for licence'],
            ].map(([bold, rest]) => (
              <Li key={bold}><strong style={{ color: 'var(--fn-text)' }}>{bold}:</strong> {rest}</Li>
            ))}
          </ul>
        </Section>

        <Section title="How We Use Your Data">
          <ul style={{ paddingLeft: '1.25rem', listStyle: 'none' }}>
            {[
              ['Authentication', 'Verify identity and maintain your account'],
              ['Drive Sync', 'Back up notebooks (only if you enable this)'],
              ['Licence', 'Validate licence key and device registration'],
              ['Improvement', 'Analyse usage and improve features'],
              ['Support', 'Troubleshoot issues'],
            ].map(([bold, rest]) => (
              <Li key={bold}><strong style={{ color: 'var(--fn-text)' }}>{bold}:</strong> {rest}</Li>
            ))}
          </ul>
        </Section>

        <Section title="Data Storage & Security">
          {[
            ['Local Storage (default)', "All notebooks stored in your browser's IndexedDB. Never leaves your device unless you enable sync."],
            ['Google Drive (optional)', 'When enabled, notebooks are backed up to your Drive. Only you can access them.'],
            ['Licence system', 'Keys and activation data verified via Supabase. Email and device fingerprint stored for verification only.'],
          ].map(([bold, rest]) => <P key={bold}><strong style={{ color: 'var(--fn-text)' }}>{bold}:</strong> {rest}</P>)}
        </Section>

        <Section title="Third-Party Services">
          {[
            ['Google OAuth 2.0', "Sign-in only. Governed by Google's privacy policy."],
            ['Google Drive API', 'Optional sync, activated with your permission.'],
            ['Supabase', "Licence verification. Governed by Supabase's privacy policy."],
            ['Tesseract.js', 'Offline OCR — all processing happens locally.'],
          ].map(([bold, rest]) => <P key={bold}><strong style={{ color: 'var(--fn-text)' }}>{bold}:</strong> {rest}</P>)}
        </Section>

        <Section title="Contact">
          <div style={{
            padding: '1.25rem', borderRadius: 10,
            background: 'var(--fn-bg)', border: '1px solid var(--fn-border)',
          }}>
            <p style={{ fontFamily: 'var(--fn-font-display)', fontSize: 17, fontWeight: 700,
              color: 'var(--fn-text)', margin: '0 0 3px' }}>Md Akhinoor Islam</p>
            <p style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 10, color: 'var(--fn-accent)', margin: '0 0 10px' }}>
              Lead Developer · A3KM Studio · KUET
            </p>
            {[
              { k: 'email', v: 'mdakhinoorislam.official.2005@gmail.com', href: 'mailto:mdakhinoorislam.official.2005@gmail.com' },
              { k: 'whatsapp', v: '01724812042', href: 'https://wa.me/8801724812042' },
              { k: 'portfolio', v: 'a3kmstudio.vercel.app', href: 'https://a3kmstudio.vercel.app/Portfolio_Clients/Mr_Akhinoor_Portfolio/Home/index.html' },
            ].map(({ k, v, href }) => (
              <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 5, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 9, color: 'var(--fn-muted)',
                  minWidth: 60, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</span>
                <a href={href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: 'var(--fn-muted)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--fn-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--fn-muted)')}
                >{v}</a>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
