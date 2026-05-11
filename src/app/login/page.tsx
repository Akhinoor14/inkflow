'use client';
// src/app/login/page.tsx

import React from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Foylx Note" className="w-16 h-16 mx-auto mb-3 rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-bold text-gray-900">Foylx Note</h1>
          <p className="text-gray-500 text-sm mt-1">Your digital notebook, reimagined</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-2">or</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Continue without account
          </button>
          <p className="text-xs text-gray-400 text-center">
            Your notes stay local. Sign in to sync with Google Drive.
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
          <p>🔐 Zero-knowledge: your data never leaves your device</p>
          <p>unless you choose to sync with Drive</p>
        </div>
      </div>
    </div>
  );
}
