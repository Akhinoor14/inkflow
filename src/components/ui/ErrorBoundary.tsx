'use client';
// src/components/ui/ErrorBoundary.tsx
//
// Global crash-recovery boundary. Without this, any uncaught render error
// (a bad shape value, a malformed page record from IndexedDB, a third-party
// component throwing) blanks the entire app to a white screen with no way
// back for the user, and worse — if it happens mid-stroke, unsaved drawing
// work could be lost with zero explanation.
//
// This boundary:
//  - Catches render-time errors anywhere below it in the tree
//  - Shows a calm, on-brand recovery screen instead of a white screen
//  - Offers "Try again" (remount the subtree) and "Reload app" (full reload)
//  - Logs the error for debugging without ever showing a raw stack trace
//    to end users
//  - Flushes any pending autosave before reloading, so in-progress strokes
//    aren't lost if at all possible

import React from 'react';
import { flushSaves } from '@/lib/storage/autoSave';

interface Props {
  children: React.ReactNode;
  /** Optional label shown in the fallback UI, e.g. "Canvas" or "Sidebar" */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', this.props.label ?? 'app', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = async () => {
    try {
      await flushSaves();
    } catch {
      // best effort — proceed with reload regardless
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          minHeight: this.props.label ? 240 : '100vh',
          padding: 32,
          textAlign: 'center',
          background: 'var(--fn-bg)',
          color: 'var(--fn-text)',
          fontFamily: 'var(--fn-font-ui, sans-serif)',
        }}
      >
        <div style={{ fontSize: 34, lineHeight: 1 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {this.props.label
            ? `${this.props.label} ran into a problem`
            : 'Something went wrong'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--fn-muted)', maxWidth: 380 }}>
          Your notes are saved automatically as you work, so your data should
          be safe. You can try again, or reload the app if the problem
          continues.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid var(--fn-border)',
              background: 'transparent', color: 'var(--fn-text)', cursor: 'pointer', fontSize: 13,
            }}
          >
            Try again
          </button>
          <button
            onClick={this.handleReload}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: 'var(--fn-accent)', color: '#fff', cursor: 'pointer', fontSize: 13,
              fontWeight: 600,
            }}
          >
            Reload app
          </button>
        </div>
        {this.state.error?.message && (
          <details style={{ marginTop: 10, fontSize: 11, color: 'var(--fn-muted)', maxWidth: 420 }}>
            <summary style={{ cursor: 'pointer' }}>Technical details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: 6 }}>
              {this.state.error.message}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
