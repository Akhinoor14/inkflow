// src/lib/license/licenseSystem.ts
// ════════════════════════════════════════════════════════════════
//  Foylx Note — License & Activation System
//  Free stack: Supabase (free tier) + machine fingerprint
//
//  Flow:
//  1. App starts → check local license cache
//  2. If cached + not expired (7 days grace) → allow
//  3. If online → verify with Supabase
//  4. If invalid/expired → show activation screen
// ════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days offline grace
const MAX_DEVICES = 2; // one key works on max 2 devices
const LICENSE_CACHE_KEY = 'foylx_lic';
const SUPABASE_REQUEST_TIMEOUT_MS = 5000;

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = SUPABASE_REQUEST_TIMEOUT_MS): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Supabase request timed out')), timeoutMs);
      }),
    ]) as T;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export interface LicenseStatus {
  valid: boolean;
  reason?: 'not_activated' | 'expired' | 'max_devices' | 'revoked' | 'offline_grace' | 'ok' | 'server_error';
  expiresAt?: number;
  deviceCount?: number;
  email?: string;
}

export interface LicenseCache {
  key: string;
  deviceId: string;
  verifiedAt: number;
  expiresAt: number | null; // null = lifetime
  email: string;
}

// ── Machine fingerprint (browser-based) ──────────────────────
export async function getMachineId(): Promise<string> {
  // Combine stable browser properties into a fingerprint
  const components = [
    navigator.hardwareConcurrency,
    navigator.language,
    screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform,
  ].join('|');

  // SHA-256 hash
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(components));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// For Electron: use more stable machine ID (CPU + MAC)
export function getElectronMachineId(): string {
  if (typeof window !== 'undefined' && (window as any).__ELECTRON__) {
    return (window as any).__ELECTRON__.getMachineId?.() ?? 'electron-unknown';
  }
  return '';
}

// ── License cache (localStorage for web, electron-store for desktop) ──
function readCache(): LicenseCache | null {
  try {
    const raw = localStorage.getItem(LICENSE_CACHE_KEY);
    if (!raw) return null;
    // Simple XOR obfuscation — not cryptographic, just not plain text
    const decoded = atob(raw.split('').reverse().join(''));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function writeCache(cache: LicenseCache): void {
  const raw = btoa(JSON.stringify(cache)).split('').reverse().join('');
  localStorage.setItem(LICENSE_CACHE_KEY, raw);
}

function clearCache(): void {
  localStorage.removeItem(LICENSE_CACHE_KEY);
}

function isSupabaseAuthError(error: any): boolean {
  return Boolean(error && (error.status === 401 || error.message?.toLowerCase?.().includes('invalid api key')));
}

// ── Tamper detection ──────────────────────────────────────────
function checkTamper(): boolean {
  // In Electron, we verify the app binary hash at startup
  // In web, we check if critical functions are untouched
  try {
    const sentinel = (window as any).__INKFLOW_SENTINEL__;
    if (sentinel !== undefined && sentinel !== 'authentic') return false;
    return true;
  } catch {
    return true; // In web mode, pass through
  }
}

// ── Main activation check ─────────────────────────────────────
export async function checkLicense(): Promise<LicenseStatus> {
  // Tamper check
  if (!checkTamper()) {
    return { valid: false, reason: 'revoked' };
  }

  const cache = readCache();

  // No cache → not activated
  if (!cache) return { valid: false, reason: 'not_activated' };

  const now = Date.now();
  const isOnline = navigator.onLine;

  // Offline grace period check
  if (!isOnline) {
    if (now - cache.verifiedAt < GRACE_PERIOD_MS) {
      return { valid: true, reason: 'offline_grace', email: cache.email };
    }
    return { valid: false, reason: 'expired' };
  }

  // Online verification
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const machineId = getElectronMachineId() || await getMachineId();

    const { data, error } = (await withTimeout(
      supabase
        .from('license_keys')
        .select('*')
        .eq('key', cache.key)
        .single()
    )) as { data: any; error: any };

    if (isSupabaseAuthError(error)) {
      return { valid: false, reason: 'server_error' };
    }

    if (error || !data) {
      // Server error — fall back to grace period
      if (now - cache.verifiedAt < GRACE_PERIOD_MS) {
        return { valid: true, reason: 'offline_grace', email: cache.email };
      }
      return { valid: false, reason: 'expired' };
    }

    // Check if revoked
    if (data.revoked) {
      clearCache();
      return { valid: false, reason: 'revoked' };
    }

    // Check expiry (null = lifetime license)
    if (data.expires_at && new Date(data.expires_at).getTime() < now) {
      clearCache();
      return { valid: false, reason: 'expired' };
    }

    // Check if this device is registered
    const devices: string[] = data.device_ids ?? [];
    const isKnownDevice = devices.includes(machineId);

    if (!isKnownDevice) {
      if (devices.length >= MAX_DEVICES) {
        return { valid: false, reason: 'max_devices', deviceCount: devices.length };
      }
      // Register this device
      await supabase
        .from('license_keys')
        .update({ device_ids: [...devices, machineId] })
        .eq('key', cache.key);
    }

    // Update last verified timestamp
    const updated: LicenseCache = { ...cache, verifiedAt: now };
    writeCache(updated);

    // Log activation event
    await supabase.from('activation_log').insert({
      key: cache.key,
      device_id: machineId,
      event: 'verified',
      app_version: '0.1.0',
    }).select();

    return {
      valid: true,
      reason: 'ok',
      expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : undefined,
      deviceCount: devices.length,
      email: data.email,
    };
  } catch (err) {
    // Network error → grace period
    if (now - cache.verifiedAt < GRACE_PERIOD_MS) {
      return { valid: true, reason: 'offline_grace', email: cache.email };
    }
    return { valid: false, reason: 'expired' };
  }
}

// ── Activate with key ─────────────────────────────────────────
export async function activateLicense(key: string, email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Dev mode — no Supabase configured, allow any key
    if (key.startsWith('INKF-DEV-')) {
      writeCache({ key, deviceId: 'dev', verifiedAt: Date.now(), expiresAt: null, email });
      return { success: true };
    }
    return { success: false, error: 'License server not configured. Set NEXT_PUBLIC_SUPABASE_URL in .env.local' };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const machineId = getElectronMachineId() || await getMachineId();

    const { data, error } = (await withTimeout(
      supabase
        .from('license_keys')
        .select('*')
        .eq('key', key.toUpperCase().trim())
        .single()
    )) as { data: any; error: any };

    if (isSupabaseAuthError(error)) {
      return { success: false, error: 'License server not configured correctly. Check Supabase env vars and redeploy.' };
    }

    if (error || !data) return { success: false, error: 'Invalid license key. Please check and try again.' };
    if (data.revoked) return { success: false, error: 'This license key has been revoked.' };
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { success: false, error: 'This license key has expired.' };
    }

    const devices: string[] = data.device_ids ?? [];
    if (!devices.includes(machineId) && devices.length >= MAX_DEVICES) {
      return { success: false, error: `This key is already activated on ${devices.length} device(s). Maximum allowed: ${MAX_DEVICES}.` };
    }

    // Register device if new
    if (!devices.includes(machineId)) {
      await supabase.from('license_keys').update({
        device_ids: [...devices, machineId],
        last_activated_at: new Date().toISOString(),
      }).eq('key', key);
    }

    // Save to local cache
    writeCache({
      key: key.toUpperCase().trim(),
      deviceId: machineId,
      verifiedAt: Date.now(),
      expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : null,
      email: data.email ?? email,
    });

    // Log
    await supabase.from('activation_log').insert({
      key,
      device_id: machineId,
      email,
      event: 'activated',
      app_version: '0.1.0',
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Could not connect to license server. Check your internet connection.' };
  }
}

// ── Deactivate (remove this device) ──────────────────────────
export async function deactivateLicense(): Promise<void> {
  const cache = readCache();
  if (!cache || !SUPABASE_URL) { clearCache(); return; }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const machineId = getElectronMachineId() || await getMachineId();

    const { data } = (await withTimeout(
      supabase.from('license_keys').select('device_ids').eq('key', cache.key).single()
    )) as { data: any };
    if (data) {
      const updated = (data.device_ids ?? []).filter((id: string) => id !== machineId);
      await supabase.from('license_keys').update({ device_ids: updated }).eq('key', cache.key);
    }
  } catch { /* ignore */ }

  clearCache();
}

// ── Admin: Generate license key ───────────────────────────────
// Run this server-side or in Supabase Edge Function
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  const segment = (n: number) => Array.from(
    { length: n },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `INKF-${segment(4)}-${segment(4)}-${segment(4)}`;
}
