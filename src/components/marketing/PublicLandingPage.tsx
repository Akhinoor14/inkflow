'use client';

import { signIn } from 'next-auth/react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Foylx Note</p>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Foylx Note - Digital Notebook with Handwriting &amp; OCR</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a href="/privacy" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white">
              Privacy Policy
            </a>
            <button
              onClick={() => signIn('google', { callbackUrl: '/app' })}
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
              Local-first note taking, handwriting, OCR, and Drive sync
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
              Capture ideas in ink, text, voice, and cloud sync.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Foylx Note is a digital notebook for handwriting, drawings, OCR conversion, audio-linked notes, and optional Google Drive backup. It is designed to work locally first and sync only when you choose.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => signIn('google', { callbackUrl: '/app' })}
                className="rounded-full bg-cyan-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Sign in with Google
              </button>
              <a
                href="/privacy"
                className="rounded-full border border-slate-700 px-6 py-3 text-base font-semibold text-white transition hover:border-cyan-400"
              >
                Read Privacy Policy
              </a>
            </div>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Handwriting & Drawing', 'Write, sketch, highlight, erase, and build pages naturally.'],
              ['OCR Conversion', 'Turn handwritten content into searchable text in English and Bengali.'],
              ['Audio Sync', 'Attach voice recordings to notes so context stays with the page.'],
              ['Google Drive Backup', 'Optional cloud sync keeps your notebooks backed up in your own Drive.'],
              ['Privacy First', 'Local storage is the default. Cloud sync only happens with your permission.'],
              ['Offline Ready', 'Installable as a PWA and usable even when you are offline.'],
            ].map(([title, description]) => (
              <article key={title} className="rounded-3xl border border-slate-800 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Foylx Note</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Foylx Note - Digital Notebook with Handwriting &amp; OCR is a local-first digital notebook for handwriting, OCR, and Google Drive backup.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/app" className="hover:text-white">Open App</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Contact</p>
            <a href="mailto:a3kmstudio@gmail.com" className="mt-3 block text-sm text-slate-400 hover:text-white">
              a3kmstudio@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
