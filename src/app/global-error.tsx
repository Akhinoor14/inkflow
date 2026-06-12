'use client';
// src/app/global-error.tsx
//
// Last-resort error boundary — only triggers if the root layout itself
// throws (very rare, but without this file a root-layout crash produces
// an unstyled, blank Next.js default error screen with no recovery
// action). Must render its own <html>/<body> since the root layout is
// presumed broken.

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
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
            background: '#fdfcf9',
            color: '#1a1a1a',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 34, lineHeight: 1 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Foylx Note failed to load</div>
          <div style={{ fontSize: 13, color: '#7a7972', maxWidth: 380 }}>
            Something went wrong while starting the app. Reloading usually
            fixes this. Your notes are stored locally and should not be
            affected.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd',
                background: 'transparent', color: '#1a1a1a', cursor: 'pointer', fontSize: 13,
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: '#2d6be4', color: '#fff', cursor: 'pointer', fontSize: 13,
                fontWeight: 600,
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
