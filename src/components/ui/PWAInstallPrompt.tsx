'use client';
// src/components/ui/PWAInstallPrompt.tsx

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setPrompt(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show || !prompt) return null;

  const install = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl px-4 py-3 max-w-sm w-full mx-4">
      <img src="/logo.svg" alt="" className="w-8 h-8 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Install Foylx Note</p>
        <p className="text-xs text-gray-500">Use offline, works like a native app</p>
      </div>
      <button onClick={install}
        className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors flex-shrink-0">
        <Download size={12} /> Install
      </button>
      <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
