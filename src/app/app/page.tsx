'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MainToolbar } from '@/components/toolbar/MainToolbar';
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas';
import { PageHeader } from '@/components/ui/PageHeader';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useThumbnailGenerator } from '@/hooks/useThumbnail';
import { flushSaves } from '@/lib/storage/autoSave';
import { activateLicense, checkLicense, type LicenseStatus } from '@/lib/license/licenseSystem';
import { setDriveToken } from '@/lib/auth/googleDrive';

type SessionWithAccessToken = Session & {
  accessToken?: string;
};

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

    setIsActivating(true);
    try {
      await activateLicense(licenseKey, licenseEmail);
      setActivationSuccess(t.license.success);
      const status = await checkLicense();
      setLicenseStatus(status);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.license.errors.generalError;
      setActivationError(mapActivationError(message));
    } finally {
      setIsActivating(false);
    }
  };

  if (licenseLoading || isAuthLoading) {
    return <LoadingScreen />;
  }

  if (licenseStatus && !licenseStatus.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t.license.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">{reasonText}</p>
          </div>

          <div className="space-y-4">
            <input
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder={t.license.placeholders.email}
              value={licenseEmail}
              onChange={(e) => setLicenseEmail(e.target.value)}
            />
            <input
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              placeholder={t.license.placeholders.key}
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
            />
            <button
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isActivating ? t.license.activating : t.license.button}
            </button>
          </div>

          {activationError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {activationError}
            </div>
          )}
          {activationSuccess && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {activationSuccess}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-950">
      <PageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainToolbar />
        <DrawingCanvas className="flex-1" />
      </div>
      <PWAInstallPrompt />
    </div>
  );
}

export default function AppPage() {
  return <Editor />;
}
