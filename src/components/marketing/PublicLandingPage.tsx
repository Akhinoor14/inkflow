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
  links: [
    { key: 'email',     icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',            href: 'mailto:mdakhinoorislam.official.2005@gmail.com',  text: 'mdakhinoorislam.official.2005@gmail.com', short: 'Email' },
    { key: 'whatsapp',  icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M11.998 2C6.478 2 2 6.478 2 12c0 1.85.504 3.585 1.383 5.074L2 22l5.105-1.348A9.956 9.956 0 0012 22c5.52 0 10-4.478 10-10S17.52 2 11.998 2z', href: 'https://wa.me/8801724812042', text: '01724812042', short: 'WhatsApp' },
    { key: 'portfolio', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', href: 'https://a3kmstudio.vercel.app/Portfolio_Clients/Mr_Akhinoor_Portfolio/Home/index.html', text: 'a3kmstudio.vercel.app', short: 'Portfolio' },
    { key: 'github',    icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22', href: 'https://github.com/Akhinoor14', text: 'Akhinoor14', short: 'GitHub' },
    { key: 'linkedin',  icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z', href: 'https://www.linkedin.com/in/mdakhinoorislam/', text: 'mdakhinoorislam', short: 'LinkedIn' },
    { key: 'youtube',   icon: 'M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58a2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z', href: 'https://www.youtube.com/@noor_academy_study', text: '@noor_academy_study', short: 'YouTube' },
    { key: 'facebook',  icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', href: 'https://www.facebook.com/mdakhinoorislam', text: 'mdakhinoorislam', short: 'Facebook' },
  ],
  projects: [
    { name: 'TextRiva',  url: 'https://textriva.vercel.app/',              icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7' },
    { name: 'FoylxNote', url: 'https://foylxnote.vercel.app/',             icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
    { name: 'BloodSync', url: 'https://bloodsync-dream.vercel.app',        icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { name: 'FX991EX',   url: 'https://fx991ex-calculator.vercel.app/',    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { name: 'KUETx',     url: 'https://kuetx.vercel.app/',                 icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Space+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap');

        /* ── Reset ── */
        .fl-root { all: initial; display: block; }
        .fl-root *, .fl-root *::before, .fl-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Palette ── */
        :root {
          --fl-bg:       #07090f;
          --fl-surface:  #0b0e18;
          --fl-card:     #0e1320;
          --fl-border:   rgba(56,189,248,0.09);
          --fl-border2:  rgba(56,189,248,0.18);
          --fl-cyan:     #38bdf8;
          --fl-indigo:   #818cf8;
          --fl-emerald:  #34d399;
          --fl-amber:    #fbbf24;
          --fl-text:     #e8edf5;
          --fl-muted:    #5e7291;
          --fl-dim:      #2d3d52;
          --fl-glow:     rgba(56,189,248,0.14);
        }

        /* ── Fonts ── */
        .ff-syne   { font-family: 'Syne', sans-serif; }
        .ff-dm     { font-family: 'DM Sans', sans-serif; }
        .ff-mono   { font-family: 'Space Mono', monospace; }
        .ff-orbit  { font-family: 'Orbitron', sans-serif; }

        /* ── Layout ── */
        .fl-wrap { max-width: 1160px; margin: 0 auto; padding: 0 1.5rem; }

        /* ── Nav ── */
        .fl-nav {
          position: sticky; top: 0; z-index: 50;
          border-bottom: 1px solid var(--fl-border);
          background: rgba(7,9,15,0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .fl-nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 60px;
        }
        /* Logo */
        .fl-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .fl-logo-mark {
          width: 32px; height: 32px; border-radius: 7px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--fl-cyan) 0%, var(--fl-indigo) 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 900;
          color: #fff; letter-spacing: -0.03em;
          box-shadow: 0 0 18px rgba(56,189,248,0.3);
        }
        .fl-logo-text { display: flex; flex-direction: column; gap: 0; }
        .fl-logo-brand {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
          color: var(--fl-text); line-height: 1; letter-spacing: -0.01em;
        }
        .fl-logo-brand em {
          font-style: normal;
          background: linear-gradient(90deg, var(--fl-cyan), var(--fl-indigo));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fl-logo-sub {
          font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 400;
          color: var(--fl-muted); letter-spacing: 0.05em; line-height: 1.4;
        }
        .fl-nav-row { display: flex; align-items: center; gap: 0.6rem; }
        .fl-btn-ghost {
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 400;
          color: #94a3b8; background: none;
          border: 1px solid var(--fl-border2);
          border-radius: 6px; padding: 0.36rem 0.85rem;
          cursor: pointer; text-decoration: none; transition: all 0.17s;
        }
        .fl-btn-ghost:hover { color: var(--fl-text); border-color: var(--fl-cyan); }
        .fl-btn-primary {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          color: #fff;
          background: linear-gradient(120deg, var(--fl-cyan), var(--fl-indigo));
          border: none; border-radius: 6px; padding: 0.4rem 1rem;
          cursor: pointer; text-decoration: none; transition: opacity 0.17s;
        }
        .fl-btn-primary:hover { opacity: 0.8; }

        /* ── Hero ── */
        .fl-hero {
          padding: 5rem 1.5rem 3.5rem;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .fl-hero-glow {
          position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 500px; pointer-events: none;
          background: radial-gradient(ellipse at 50% 10%, rgba(56,189,248,0.07) 0%, rgba(129,140,248,0.04) 40%, transparent 72%);
        }
        .fl-eyebrow {
          display: inline-flex; align-items: center; gap: 0.45rem;
          font-family: 'Space Mono', monospace; font-size: 10.5px;
          color: var(--fl-emerald);
          border: 1px solid rgba(52,211,153,0.18);
          background: rgba(52,211,153,0.05);
          border-radius: 3px; padding: 0.28rem 0.8rem;
          letter-spacing: 0.07em; margin-bottom: 2rem;
        }
        .fl-eyebrow::before { content: '//'; opacity: 0.4; margin-right: 2px; }

        /* Big logotype headline */
        .fl-hero-logotype {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3.6rem, 10vw, 7.2rem);
          font-weight: 800; line-height: 0.92;
          letter-spacing: -0.04em;
          color: var(--fl-text);
          margin: 0 auto 0.6rem;
          position: relative; display: inline-block;
        }
        .fl-hero-logotype .w-foylx {
          background: linear-gradient(95deg, #fff 0%, var(--fl-cyan) 55%, var(--fl-indigo) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fl-hero-logotype .w-note {
          color: var(--fl-text); opacity: 0.25;
          margin-left: 0.15em;
        }
        .fl-hero-sub {
          font-family: 'DM Sans', sans-serif; font-size: clamp(1rem, 2.5vw, 1.35rem);
          font-weight: 300; font-style: italic;
          color: var(--fl-muted); margin: 0 auto 0.5rem;
          letter-spacing: 0.01em;
        }
        .fl-hero-tagline-row {
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          flex-wrap: wrap; margin-bottom: 2.8rem;
        }
        .fl-tag {
          font-family: 'Space Mono', monospace; font-size: 11px;
          color: var(--fl-cyan); background: rgba(56,189,248,0.07);
          border: 1px solid rgba(56,189,248,0.15);
          border-radius: 3px; padding: 0.22rem 0.65rem;
          letter-spacing: 0.06em;
        }
        .fl-tag.g { color: var(--fl-emerald); background: rgba(52,211,153,0.06); border-color: rgba(52,211,153,0.15); }
        .fl-tag.i { color: var(--fl-indigo); background: rgba(129,140,248,0.06); border-color: rgba(129,140,248,0.15); }
        .fl-tag.a { color: var(--fl-amber); background: rgba(251,191,36,0.06); border-color: rgba(251,191,36,0.15); }
        .fl-lead {
          font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.85;
          font-weight: 300;
          color: var(--fl-muted); max-width: 510px; margin: 0 auto 2.8rem;
        }
        .fl-cta-row {
          display: flex; flex-wrap: wrap; gap: 0.9rem; justify-content: center;
        }
        .fl-btn-cta {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: #fff;
          background: linear-gradient(120deg, var(--fl-cyan), var(--fl-indigo));
          border: none; border-radius: 8px; padding: 0.8rem 2.2rem;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 0 30px rgba(56,189,248,0.2);
          transition: transform 0.17s, box-shadow 0.17s;
        }
        .fl-btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 36px rgba(56,189,248,0.32); }
        .fl-btn-outline {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--fl-text); background: none;
          border: 1px solid var(--fl-border2);
          border-radius: 8px; padding: 0.8rem 2.2rem;
          cursor: pointer; text-decoration: none;
          transition: border-color 0.17s, color 0.17s;
        }
        .fl-btn-outline:hover { border-color: var(--fl-cyan); color: var(--fl-cyan); }

        /* ── Divider ── */
        .fl-rule { border: none; border-top: 1px solid var(--fl-border); margin: 0; }

        /* ── Feature grid ── */
        .fl-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--fl-border);
          border: 1px solid var(--fl-border);
          border-radius: 12px;
          overflow: hidden;
          margin: 3.5rem auto;
          max-width: 1160px;
        }
        @media (max-width: 768px) {
          .fl-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 769px) and (max-width: 1000px) {
          .fl-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .fl-card {
          background: var(--fl-card);
          padding: 2rem 1.75rem;
          transition: background 0.2s;
          position: relative;
        }
        .fl-card:hover { background: #111827; }
        .fl-card-icon {
          font-family: 'Space Mono', monospace;
          font-size: 20px; color: var(--fl-cyan);
          margin-bottom: 1rem; display: block;
        }
        .fl-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700; letter-spacing: -0.01em;
          color: var(--fl-text); margin-bottom: 0.5rem;
        }
        .fl-card-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; line-height: 1.75; font-weight: 300;
          color: var(--fl-muted);
        }

        /* ── Footer ── */
        .fl-footer {
          border-top: 1px solid var(--fl-border);
          background: var(--fl-surface);
          padding: 3rem 1.5rem 1.5rem;
        }
        .fl-footer-grid {
          max-width: 1160px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1.4fr 0.7fr 1.5fr 1fr;
          gap: 3rem;
        }
        @media (max-width: 900px) {
          .fl-footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }
        @media (max-width: 560px) {
          .fl-footer-grid { grid-template-columns: 1fr; gap: 2rem; }
        }
        .fl-footer-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 8.5px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--fl-cyan); margin-bottom: 1.1rem;
        }
        .fl-footer-about {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; line-height: 1.75; font-weight: 300;
          color: var(--fl-dim);
        }
        .fl-footer-links { display: flex; flex-direction: column; gap: 0.4rem; }
        .fl-footer-link {
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: var(--fl-dim); text-decoration: none;
          transition: color 0.14s;
        }
        .fl-footer-link:hover { color: var(--fl-cyan); }

        /* Contact block */
        .fl-contact-name {
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
          letter-spacing: -0.01em; color: var(--fl-text); margin-bottom: 2px;
        }
        .fl-contact-role {
          font-family: 'Space Mono', monospace; font-size: 10px;
          color: var(--fl-cyan); margin-bottom: 4px;
        }
        .fl-contact-meta {
          font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 300;
          color: var(--fl-muted); margin-bottom: 1rem; line-height: 1.65;
        }

        /* Icon link grid */
        .fl-social-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        .fl-social-btn {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px;
          padding: 8px 4px 7px;
          background: rgba(56,189,248,0.04);
          border: 1px solid var(--fl-border);
          border-radius: 7px;
          text-decoration: none;
          color: var(--fl-muted);
          transition: all 0.16s;
          cursor: pointer;
        }
        .fl-social-btn:hover {
          background: rgba(56,189,248,0.09);
          border-color: var(--fl-border2);
          color: var(--fl-cyan);
        }
        .fl-social-btn svg {
          width: 15px; height: 15px;
          stroke: currentColor; fill: none;
          stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round;
          flex-shrink: 0;
        }
        .fl-social-label {
          font-family: 'Space Mono', monospace; font-size: 7.5px;
          letter-spacing: 0.04em; line-height: 1;
          text-transform: uppercase;
        }

        /* Projects as icon pills */
        .fl-proj-list { display: flex; flex-direction: column; gap: 6px; }
        .fl-proj-item {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; color: var(--fl-dim);
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 5px 8px; border-radius: 6px;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .fl-proj-item:hover {
          color: var(--fl-cyan);
          background: rgba(56,189,248,0.05);
          border-color: var(--fl-border);
        }
        .fl-proj-item svg {
          width: 13px; height: 13px; flex-shrink: 0;
          stroke: currentColor; fill: none;
          stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round;
          opacity: 0.7;
        }

        /* Footer bottom */
        .fl-footer-copy {
          max-width: 1160px; margin: 2.5rem auto 0;
          padding-top: 1.2rem;
          border-top: 1px solid var(--fl-border);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 0.5rem;
          font-family: 'Space Mono', monospace; font-size: 10.5px;
          color: var(--fl-dim);
        }
      `}</style>

      <div className="fl-root" style={{ background: 'var(--fl-bg)', color: 'var(--fl-text)', minHeight: '100vh' }}>

        {/* ── Nav ── */}
        <nav className="fl-nav">
          <div className="fl-wrap fl-nav-inner">
            <a href="/" className="fl-logo">
              <div className="fl-logo-mark">FN</div>
              <div className="fl-logo-text">
                <span className="fl-logo-brand"><em>Foylx</em> Note</span>
                <span className="fl-logo-sub">Digital Notebook · Handwriting &amp; OCR</span>
              </div>
            </a>
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
          <div className="fl-hero-glow" />
          <div className="fl-eyebrow">local-first · handwriting · ocr · drive sync</div>

          <div>
            <h1 className="fl-hero-logotype ff-syne">
              <span className="w-foylx">Foylx</span>
              <span className="w-note">Note</span>
            </h1>
          </div>

          <p className="fl-hero-sub ff-dm">capture ideas in ink, voice &amp; cloud.</p>

          <div className="fl-hero-tagline-row">
            <span className="fl-tag">✦ handwriting</span>
            <span className="fl-tag g">◈ ocr</span>
            <span className="fl-tag i">◎ audio sync</span>
            <span className="fl-tag a">⬢ offline-first</span>
          </div>

          <p className="fl-lead">
            A digital notebook for handwriting, drawings, OCR conversion,
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
        <div className="fl-grid fl-wrap">
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

            {/* Contact — icon grid */}
            <div>
              <p className="fl-footer-label">Contact</p>
              <p className="fl-contact-name">{CONTACT.name}</p>
              <p className="fl-contact-role">{CONTACT.role} · {CONTACT.studio}</p>
              <p className="fl-contact-meta">
                {CONTACT.department}<br />
                {CONTACT.institution} · {CONTACT.status}
              </p>
              <div className="fl-social-grid">
                {CONTACT.links.map(({ key, icon, href, short }) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="fl-social-btn" title={short}>
                    <svg viewBox="0 0 24 24">
                      <path d={icon} />
                    </svg>
                    <span className="fl-social-label">{short}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <p className="fl-footer-label">Other Projects</p>
              <div className="fl-proj-list">
                {CONTACT.projects.map(({ name, url, icon }) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="fl-proj-item">
                    <svg viewBox="0 0 24 24"><path d={icon} /></svg>
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
