'use client';

import { signIn } from 'next-auth/react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const CONTACT = {
  name: 'Md Akhinoor Islam',
  role: 'Lead Developer & Founder',
  department: 'Energy Science & Engineering',
  institution: 'KUET',
  status: 'Undergraduate Student',
  studio: 'A3KM Studio',
  portfolio: 'https://a3kmstudio.vercel.app/Portfolio_Clients/Mr_Akhinoor_Portfolio/Home/index.html',
  github: 'https://github.com/Akhinoor14',
  linkedin: 'https://www.linkedin.com/in/mdakhinoorislam/',
  youtube: 'https://www.youtube.com/@noor_academy_study',
  facebook: 'https://www.facebook.com/mdakhinoorislam',
  email: 'mdakhinoorislam.official.2005@gmail.com',
  whatsapp: '01724812042',
  projects: [
    { name: 'TextRiva', url: 'https://textriva.vercel.app/' },
    { name: 'FoylxNote', url: 'https://foylxnote.vercel.app/' },
    { name: 'BloodSync', url: 'https://bloodsync-dream.vercel.app' },
    { name: 'FX991EX', url: 'https://fx991ex-calculator.vercel.app/' },
    { name: 'KUETx', url: 'https://kuetx.vercel.app/' },
  ],
};

const FEATURES = [
  { icon: '✦', title: 'Handwriting & Drawing', desc: 'Write, sketch, highlight, erase, and build pages with natural ink behaviour.' },
  { icon: '◈', title: 'OCR Conversion', desc: 'Convert handwritten content to searchable text in English and Bengali.' },
  { icon: '◎', title: 'Audio Sync', desc: 'Attach voice recordings to notes so context stays with the page.' },
  { icon: '⬡', title: 'Google Drive Backup', desc: 'Optional cloud sync keeps your notebooks in your own Drive — never ours.' },
  { icon: '◉', title: 'Privacy First', desc: 'Local storage by default. Cloud sync only happens when you choose it.' },
  { icon: '⬢', title: 'Offline Ready', desc: 'Install as a PWA and write even without an internet connection.' },
];

export default function PublicLandingPage() {
  return (
    <>
      <style>{`
        /* ── Reset & base ── */
        .fl-root { all: initial; display: block; }
        .fl-root *, .fl-root *::before, .fl-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Fonts ── */
        .fl-font-display { font-family: 'Rajdhani', 'Inter', sans-serif; }
        .fl-font-mono    { font-family: 'Share Tech Mono', 'Courier New', monospace; }
        .fl-font-ui      { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
        .fl-font-badge   { font-family: 'Orbitron', sans-serif; }

        /* ── Palette ── */
        :root {
          --fl-bg:      #080c14;
          --fl-surface: #0d1220;
          --fl-card:    #111827;
          --fl-border:  rgba(99,179,237,0.12);
          --fl-border2: rgba(99,179,237,0.22);
          --fl-accent1: #38bdf8;
          --fl-accent2: #818cf8;
          --fl-accent3: #34d399;
          --fl-text:    #e2e8f0;
          --fl-muted:   #64748b;
          --fl-dim:     #334155;
        }

        /* ── Layout ── */
        .fl-wrap { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

        /* ── Nav ── */
        .fl-nav {
          position: sticky; top: 0; z-index: 50;
          border-bottom: 1px solid var(--fl-border);
          background: rgba(8,12,20,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .fl-nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 62px;
        }
        .fl-logo-mark {
          width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--fl-accent1), var(--fl-accent2));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 700;
          color: #fff; letter-spacing: 0;
        }
        .fl-logo-text { display: flex; flex-direction: column; gap: 1px; }
        .fl-logo-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 8.5px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--fl-accent1); line-height: 1;
        }
        .fl-logo-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 600;
          color: var(--fl-text); line-height: 1.2;
        }
        .fl-nav-row { display: flex; align-items: center; gap: 0.75rem; }
        .fl-btn-ghost {
          font-family: 'Inter', sans-serif; font-size: 13px;
          color: #94a3b8; background: none;
          border: 1px solid var(--fl-border2);
          border-radius: 6px; padding: 0.38rem 0.9rem;
          cursor: pointer; text-decoration: none; transition: all 0.18s;
        }
        .fl-btn-ghost:hover { color: var(--fl-text); border-color: var(--fl-accent1); }
        .fl-btn-primary {
          font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700;
          letter-spacing: 0.04em; text-transform: uppercase;
          color: #fff; background: linear-gradient(120deg, var(--fl-accent1), var(--fl-accent2));
          border: none; border-radius: 6px; padding: 0.42rem 1.1rem;
          cursor: pointer; text-decoration: none; transition: opacity 0.18s;
        }
        .fl-btn-primary:hover { opacity: 0.82; }

        /* ── Hero ── */
        .fl-hero {
          padding: 5.5rem 1.5rem 4rem;
          text-align: center;
          position: relative;
        }
        .fl-hero::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 700px; height: 400px;
          background: radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .fl-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: var(--fl-accent3);
          border: 1px solid rgba(52,211,153,0.2);
          background: rgba(52,211,153,0.06);
          border-radius: 4px; padding: 0.3rem 0.9rem;
          letter-spacing: 0.08em; margin-bottom: 2rem;
        }
        .fl-eyebrow::before { content: '//'; opacity: 0.5; }
        .fl-h1 {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.6rem, 7vw, 5.2rem);
          font-weight: 700; line-height: 1.05;
          letter-spacing: -0.01em;
          color: var(--fl-text);
          max-width: 860px; margin: 0 auto 1.5rem;
        }
        .fl-h1-accent {
          background: linear-gradient(90deg, var(--fl-accent1) 0%, var(--fl-accent2) 60%, var(--fl-accent3) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fl-lead {
          font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.8;
          color: var(--fl-muted); max-width: 560px; margin: 0 auto 2.5rem;
        }
        .fl-cta-row {
          display: flex; flex-wrap: wrap; gap: 0.9rem; justify-content: center;
        }
        .fl-btn-cta {
          font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #fff; background: linear-gradient(120deg, var(--fl-accent1), var(--fl-accent2));
          border: none; border-radius: 8px; padding: 0.78rem 2.2rem;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 0 28px rgba(56,189,248,0.2);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .fl-btn-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 32px rgba(56,189,248,0.35);
        }
        .fl-btn-outline {
          font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--fl-text); background: none;
          border: 1px solid var(--fl-border2);
          border-radius: 8px; padding: 0.78rem 2.2rem;
          cursor: pointer; text-decoration: none;
          transition: border-color 0.18s, color 0.18s;
        }
        .fl-btn-outline:hover { border-color: var(--fl-accent1); color: var(--fl-accent1); }

        /* ── Divider ── */
        .fl-rule {
          border: none;
          border-top: 1px solid var(--fl-border);
          margin: 0;
        }

        /* ── Feature grid ── */
        .fl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1px;
          background: var(--fl-border);
          border: 1px solid var(--fl-border);
          border-radius: 12px;
          overflow: hidden;
          margin: 4rem 1.5rem;
          max-width: 1200px;
          margin-left: auto; margin-right: auto;
        }
        .fl-card {
          background: var(--fl-card);
          padding: 2rem 1.75rem;
          transition: background 0.2s;
        }
        .fl-card:hover { background: #151e2f; }
        .fl-card-icon {
          font-family: 'Share Tech Mono', monospace;
          font-size: 22px; color: var(--fl-accent1);
          margin-bottom: 1rem; display: block;
        }
        .fl-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 17px; font-weight: 700; letter-spacing: 0.02em;
          color: var(--fl-text); margin-bottom: 0.5rem;
        }
        .fl-card-desc {
          font-family: 'Inter', sans-serif;
          font-size: 13px; line-height: 1.7; color: var(--fl-muted);
        }

        /* ── Footer ── */
        .fl-footer {
          border-top: 1px solid var(--fl-border);
          background: var(--fl-surface);
          padding: 3rem 1.5rem 1.5rem;
        }
        .fl-footer-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 2.5rem;
        }
        .fl-footer-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--fl-accent1); margin-bottom: 1rem;
        }
        .fl-footer-about {
          font-family: 'Inter', sans-serif;
          font-size: 13px; line-height: 1.7; color: var(--fl-dim);
        }
        .fl-footer-links { display: flex; flex-direction: column; gap: 0.45rem; }
        .fl-footer-link {
          font-family: 'Inter', sans-serif; font-size: 13px;
          color: var(--fl-dim); text-decoration: none;
          transition: color 0.15s;
        }
        .fl-footer-link:hover { color: var(--fl-accent1); }
        .fl-contact-name {
          font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700;
          letter-spacing: 0.03em; color: var(--fl-text); margin-bottom: 0.2rem;
        }
        .fl-contact-role {
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: var(--fl-accent1); margin-bottom: 0.8rem;
        }
        .fl-contact-meta {
          font-family: 'Inter', sans-serif; font-size: 11.5px;
          color: var(--fl-dim); margin-bottom: 0.8rem; line-height: 1.6;
        }
        .fl-contact-row {
          display: flex; gap: 0.5rem; align-items: flex-start;
          font-family: 'Inter', sans-serif; font-size: 12px;
          color: var(--fl-dim); text-decoration: none;
          transition: color 0.15s; line-height: 1.5;
          margin-bottom: 0.3rem;
        }
        .fl-contact-row:hover { color: var(--fl-accent1); }
        .fl-contact-key {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          color: var(--fl-accent2); min-width: 80px; padding-top: 1px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .fl-footer-copy {
          max-width: 1200px; margin: 2.5rem auto 0;
          padding-top: 1.2rem;
          border-top: 1px solid var(--fl-border);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 0.5rem;
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: var(--fl-dim);
        }
      `}</style>

      <div
        className="fl-root"
        style={{ background: 'var(--fl-bg)', color: 'var(--fl-text)', minHeight: '100vh' }}
      >
        {/* ── Nav ── */}
        <nav className="fl-nav">
          <div className="fl-wrap fl-nav-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="fl-logo-mark">FN</div>
              <div className="fl-logo-text">
                <span className="fl-logo-label">Foylx Note</span>
                <span className="fl-logo-name">Digital Notebook · Handwriting &amp; OCR</span>
              </div>
            </div>
            <div className="fl-nav-row">
              <LanguageSwitcher />
              <a href="/privacy" className="fl-btn-ghost">Privacy Policy</a>
              <button onClick={() => signIn('google', { callbackUrl: '/app' })} className="fl-btn-primary">
                Sign In
              </button>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="fl-hero">
          <div className="fl-eyebrow">local-first · handwriting · ocr · drive sync</div>
          <h2 className="fl-h1">
            Capture ideas in{' '}
            <span className="fl-h1-accent">ink, text,<br />voice</span>{' '}
            and cloud sync.
          </h2>
          <p className="fl-lead">
            Foylx Note is a digital notebook for handwriting, drawings, OCR conversion,
            audio-linked notes, and optional Google Drive backup — built to work offline first.
          </p>
          <div className="fl-cta-row">
            <button onClick={() => signIn('google', { callbackUrl: '/app' })} className="fl-btn-cta">
              Sign in with Google
            </button>
            <a href="/privacy" className="fl-btn-outline">Read Privacy Policy</a>
          </div>
        </section>

        <hr className="fl-rule" />

        {/* ── Features ── */}
        <div className="fl-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="fl-card">
              <span className="fl-card-icon">{icon}</span>
              <div className="fl-card-title">{title}</div>
              <p className="fl-card-desc">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <footer className="fl-footer">
          <div className="fl-footer-grid">
            {/* Brand */}
            <div>
              <p className="fl-footer-label">Foylx Note</p>
              <p className="fl-footer-about">
                A local-first digital notebook for handwriting, OCR, and Google Drive backup.
                Built for privacy, designed for focus.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="fl-footer-label">Navigate</p>
              <div className="fl-footer-links">
                <a href="/privacy" className="fl-footer-link">Privacy Policy</a>
                <a href="/app" className="fl-footer-link">Open App</a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="fl-footer-label">Contact</p>
              <p className="fl-contact-name">{CONTACT.name}</p>
              <p className="fl-contact-role">{CONTACT.role} · {CONTACT.studio}</p>
              <p className="fl-contact-meta">
                {CONTACT.department}<br />
                {CONTACT.institution} · {CONTACT.status}
              </p>
              {[
                { key: 'email', href: `mailto:${CONTACT.email}`, text: CONTACT.email },
                { key: 'whatsapp', href: `https://wa.me/880${CONTACT.whatsapp.replace(/^0/, '')}`, text: CONTACT.whatsapp },
                { key: 'portfolio', href: CONTACT.portfolio, text: 'a3kmstudio.vercel.app' },
                { key: 'github', href: CONTACT.github, text: 'Akhinoor14' },
                { key: 'linkedin', href: CONTACT.linkedin, text: 'mdakhinoorislam' },
                { key: 'youtube', href: CONTACT.youtube, text: '@noor_academy_study' },
                { key: 'facebook', href: CONTACT.facebook, text: 'mdakhinoorislam' },
              ].map(({ key, href, text }) => (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="fl-contact-row">
                  <span className="fl-contact-key">{key}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{text}</span>
                </a>
              ))}
            </div>

            {/* Projects */}
            <div>
              <p className="fl-footer-label">Other Projects</p>
              <div className="fl-footer-links">
                {CONTACT.projects.map(({ name, url }) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="fl-footer-link">
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="fl-footer-copy">
            <span>© {new Date().getFullYear()} A3KM Studio · Foylx Note</span>
            <span>Built by Md Akhinoor Islam · KUET</span>
          </div>
        </footer>
      </div>
    </>
  );
}
