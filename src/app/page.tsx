'use client';
// src/app/page.tsx (Session 5 updated)

import React, { useEffect, useMemo, useState } from 'react';
import type { Session } from 'next-auth';
import { useSession, signIn } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MainToolbar } from '@/components/toolbar/MainToolbar';
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas';
import { PageHeader } from '@/components/ui/PageHeader';
import { AudioSyncPanel } from '@/components/ui/AudioSyncPanel';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useThumbnailGenerator } from '@/hooks/useThumbnail';
import { flushSaves } from '@/lib/storage/autoSave';
import { activateLicense, checkLicense, type LicenseStatus } from '@/lib/license/licenseSystem';
import { setDriveToken } from '@/lib/auth/googleDrive';

type SessionWithAccessToken = Session & {
  accessToken?: string;
};

// Landing Page - Public, no login required
function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-slate-700 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Foylx Note
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Digital Notebook with <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Handwriting & OCR</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Write, sketch, and annotate with handwriting recognition. Sync to Google Drive. All data stored locally first.
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            Get Started Free
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 my-20">
          {[
            {
              icon: '✏️',
              title: 'Handwriting & Drawing',
              desc: 'Pressure-sensitive pen, highlighter, eraser with real-time rendering',
            },
            {
              icon: '👁️',
              title: 'Handwriting Recognition',
              desc: 'Offline OCR for English & Bengali. Convert handwriting to searchable text.',
            },
            {
              icon: '🎙️',
              title: 'Audio Sync',
              desc: 'Record audio while writing. Click any stroke to replay audio from that moment.',
            },
            {
              icon: '☁️',
              title: 'Google Drive Sync',
              desc: 'Auto-backup your notebooks. Encrypted. Only you can access.',
            },
            {
              icon: '🔐',
              title: 'Privacy First',
              desc: 'All data stored locally in your browser. Sync only with your permission.',
            },
            {
              icon: '📱',
              title: 'Offline Ready',
              desc: 'Progressive Web App. Works without internet. Installable on mobile/desktop.',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-800/30 rounded-lg p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to start taking notes?</h3>
          <p className="text-slate-300 mb-6 text-lg">Sign in with Google to create your first notebook. No credit card required.</p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="https://foylxnote.vercel.app" className="hover:text-white transition">Launch App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-slate-400">
                Email: <a href="mailto:a3kmstudio@gmail.com" className="hover:text-white transition">a3kmstudio@gmail.com</a>
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 Foylx Note. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Editor() {
  const { data: session } = useSession();
  const { isAuthLoading, activePageId } = useAppStore();
  const { t } = useLanguage();
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseEmail, setLicenseEmail] = useState('');
  const [activationError, setActivationError] = useState('');
  const [activationSuccess, setActivationSuccess] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const hasLicenseServer = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useKeyboardShortcuts();
  useThumbnailGenerator(activePageId);

  // Auto-set Drive token whenever session changes
  useEffect(() => {
    const token = (session as SessionWithAccessToken | null)?.accessToken;
    if (token) setDriveToken(token);
  }, [session]);

  useEffect(() => {
    window.addEventListener('beforeunload', flushSaves);
    return () => window.removeEventListener('beforeunload', flushSaves);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      if (!hasLicenseServer) {
        if (mounted) {
          setLicenseStatus({ valid: true, reason: 'ok' });
          setLicenseLoading(false);
        }
        return;
      }

      try {
        const status = await checkLicense();
        if (mounted) setLicenseStatus(status);
      } catch {
        if (mounted) setLicenseStatus({ valid: false, reason: 'expired' });
      } finally {
        if (mounted) setLicenseLoading(false);
      }
    }

    verify();
    return () => {
      mounted = false;
    };
  }, [hasLicenseServer]);

  const reasonText = useMemo(() => {
    switch (licenseStatus?.reason) {
      case 'not_activated':
        return t.license.notActivated;
      case 'expired':
        return t.license.expired;
      case 'max_devices':
        return t.license.maxDevices;
      case 'revoked':
        return t.license.revoked;
      case 'server_error':
        return t.license.errors.serverNotConfigured;
      default:
        return t.license.notActivated;
    }
  }, [licenseStatus?.reason, t]);

  const mapActivationError = (error: string): string => {
    const e = error.toLowerCase();

    if (e.includes('invalid license key')) return t.license.errors.invalidKey;
    if (e.includes('revoked')) return t.license.errors.revoked;
    if (e.includes('expired')) return t.license.errors.expired;
    if (e.includes('maximum allowed')) return t.license.errors.maxDevicesError;
    if (e.includes('server not configured correctly')) {
      return t.license.errors.serverNotConfigured;
    }
    if (e.includes('could not connect') || e.includes('internet')) {
      return t.license.errors.noConnection;
    }
    if (e.includes('not configured')) {
      return t.license.errors.notConfigured;
    }

    return t.license.errors.generalError;
  };

  const handleActivate = async () => {
    setActivationError('');
    setActivationSuccess('');

    if (!licenseKey.trim()) {
      setActivationError(t.license.errors.emptyKey);
      return;
    }
    if (!licenseEmail.trim()) {
      setActivationError(t.license.errors.emptyEmail);
      return;
    }

    try {
      setIsActivating(true);
      const result = await activateLicense(licenseKey.trim(), licenseEmail.trim());
      if (!result.success) {
        setActivationError(mapActivationError(result.error ?? 'Activation failed'));
        return;
      }

      const status = await checkLicense();
      setLicenseStatus(status);
      if (!status.valid) {
        setActivationError(t.license.errors.verificationFailed);
      } else {
        setActivationSuccess(t.license.success);
      }
    } catch {
      setActivationError(t.license.errors.noConnection);
    } finally {
      setIsActivating(false);
    }
  };

  if (isAuthLoading || licenseLoading) return <LoadingScreen />;

  if (hasLicenseServer && !licenseStatus?.valid) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold tracking-tight">{t.license.title}</h1>
            <LanguageSwitcher />
          </div>
          <p className="mt-2 text-sm text-slate-300">{reasonText}</p>

          <div className="mt-5 space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">{t.license.labels.email}</label>
              <input
                type="email"
                value={licenseEmail}
                onChange={(e) => setLicenseEmail(e.target.value)}
                placeholder={t.license.placeholders.email}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">{t.license.labels.key}</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder={t.license.placeholders.key}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {activationError && (
            <p className="mt-3 text-sm text-red-400">{activationError}</p>
          )}

          {activationSuccess && (
            <p className="mt-3 text-sm text-emerald-400">{activationSuccess}</p>
          )}

          <button
            onClick={handleActivate}
            disabled={isActivating}
            className="mt-5 w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium"
          >
            {isActivating ? t.license.activating : t.license.button}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MainToolbar />
        <PageHeader />
        <AudioSyncPanel />
        <DrawingCanvas className="flex-1" />
      </div>
      <PWAInstallPrompt />
    </div>
  );
}

export default function EditorPage() {
  const { status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return <LandingPage />;
  }

  return <Editor />;
}
