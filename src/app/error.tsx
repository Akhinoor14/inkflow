'use client';
// src/app/error.tsx
//
// Next.js App Router error boundary for this route segment. Complements
// src/components/ui/ErrorBoundary.tsx — this catches errors that occur
// during rendering of the segment itself (including ones thrown before
// our in-tree boundaries mount), and gives Next a `reset()` to retry
// without a full page reload.

import React from 'react';
import { flushSaves } from '@/lib/storage/autoSave';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[RouteError]', error);
  }, [error]);

  const handleReload = async () => {
    try {
      await flushSaves();
    } catch {
      // best effort
    }
    window.location.reload();
  };

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        minHeight: '100vh',
        padding: 32,
        textAlign: 'center',
        background: 'var(--fn-bg, #fff)',
        color: 'var(--fn-text, #1a1a1a)',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 34, lineHeight: 1 }}>⚠️</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>Something went wrong</div>
      <div style={{ fontSize: 13, color: 'var(--fn-muted, #7a7972)', maxWidth: 380 }}>
        Your notes are saved automatically as you work, so your data should
        be safe. You can try again, or reload the app if the problem
        continues.
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--fn-border, #ddd)',
            background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 13,
          }}
        >
          Try again
        </button>
        <button
          onClick={handleReload}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'var(--fn-accent, #2d6be4)', color: '#fff', cursor: 'pointer', fontSize: 13,
            fontWeight: 600,
          }}
        >
          Reload app
        </button>
      </div>
    </div>
  );
}
