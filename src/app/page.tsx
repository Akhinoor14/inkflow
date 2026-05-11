'use client';
// src/app/page.tsx (Session 5 updated)

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
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

export default function EditorPage() {
  const { data: session } = useSession();
  const { isAuthLoading, activePageId } = useAppStore();
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
    const token = (session as any)?.accessToken;
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
        return 'এই ডিভাইস এখনো অ্যাক্টিভেট করা হয়নি।';
      case 'expired':
        return 'লাইসেন্স ভেরিফিকেশন মেয়াদ শেষ। আবার অনলাইনে ভেরিফাই করুন।';
      case 'max_devices':
        return 'এই key সর্বোচ্চ ডিভাইস সীমা পূর্ণ করেছে।';
      case 'revoked':
        return 'এই লাইসেন্স বাতিল করা হয়েছে।';
      case 'server_error':
        return 'লাইসেন্স সার্ভার কনফিগার হয়নি। Vercel env vars এবং redeploy চেক করুন।';
      default:
        return 'চালিয়ে যেতে লাইসেন্স অ্যাক্টিভেট করুন।';
    }
  }, [licenseStatus?.reason]);

  const mapActivationErrorToBn = (error: string) => {
    const e = error.toLowerCase();

    if (e.includes('invalid license key')) return 'লাইসেন্স key ভুল। আবার চেক করুন।';
    if (e.includes('revoked')) return 'এই লাইসেন্স বাতিল করা হয়েছে।';
    if (e.includes('expired')) return 'লাইসেন্সের মেয়াদ শেষ।';
    if (e.includes('maximum allowed')) return 'এই key সর্বোচ্চ ডিভাইস সীমা পূর্ণ করেছে।';
    if (e.includes('server not configured correctly')) {
      return 'লাইসেন্স সার্ভার ঠিকমতো কনফিগার হয়নি। Vercel env vars এবং redeploy চেক করুন।';
    }
    if (e.includes('could not connect') || e.includes('internet')) {
      return 'সার্ভারে সংযোগ হয়নি। ইন্টারনেট চেক করুন।';
    }
    if (e.includes('not configured')) {
      return 'লাইসেন্স সার্ভার কনফিগার হয়নি।';
    }

    return 'অ্যাক্টিভেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
  };

  const handleActivate = async () => {
    setActivationError('');
    setActivationSuccess('');

    if (!licenseKey.trim()) {
      setActivationError('লাইসেন্স key লিখুন।');
      return;
    }
    if (!licenseEmail.trim()) {
      setActivationError('ইমেইল লিখুন।');
      return;
    }

    try {
      setIsActivating(true);
      const result = await activateLicense(licenseKey.trim(), licenseEmail.trim());
      if (!result.success) {
        setActivationError(mapActivationErrorToBn(result.error ?? 'Activation failed'));
        return;
      }

      const status = await checkLicense();
      setLicenseStatus(status);
      if (!status.valid) {
        setActivationError('অ্যাক্টিভেশন সফল, কিন্তু ভেরিফিকেশন ব্যর্থ। আবার চেষ্টা করুন।');
      } else {
        setActivationSuccess('লাইসেন্স সফলভাবে অ্যাক্টিভেট হয়েছে।');
      }
    } catch {
      setActivationError('সার্ভারে সংযোগ হয়নি। ইন্টারনেট চেক করুন।');
    } finally {
      setIsActivating(false);
    }
  };

  if (isAuthLoading || licenseLoading) return <LoadingScreen />;

  if (hasLicenseServer && !licenseStatus?.valid) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-2xl">
          <h1 className="text-2xl font-bold tracking-tight">লাইসেন্স অ্যাক্টিভেশন</h1>
          <p className="mt-2 text-sm text-slate-300">{reasonText}</p>

          <div className="mt-5 space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">আপনার ইমেইল</label>
              <input
                type="email"
                value={licenseEmail}
                onChange={(e) => setLicenseEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">লাইসেন্স কী</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="INKF-XXXX-XXXX-XXXX"
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
            {isActivating ? 'অ্যাক্টিভেট হচ্ছে...' : 'এখনই অ্যাক্টিভেট করুন'}
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
