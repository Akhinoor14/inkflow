'use client';
// src/components/ui/LoadingScreen.tsx

import React from 'react';

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <img src="/logo.svg" alt="Foylx Note" className="w-16 h-16 mb-4 rounded-2xl shadow-lg animate-pulse" />
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Foylx Note</h1>
        <p className="text-sm text-gray-400">Loading your notebooks...</p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
