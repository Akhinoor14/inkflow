'use client';
// src/app/providers.tsx

import React, { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { useAppStore } from '@/store/useAppStore';
import { loadPreferences, getAllNotebooks, getPagesForNotebook } from '@/lib/storage/db';

export function Providers({ children }: { children: React.ReactNode }) {
  const { isDarkMode, updatePreferences, loadNotebooks, loadPages, setAuthLoading } = useAppStore();

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load from IndexedDB on mount
  useEffect(() => {
    async function init() {
      try {
        // Load preferences
        const prefs = await loadPreferences();
        if (prefs) updatePreferences(prefs);

        // Load notebooks
        const notebooks = await getAllNotebooks('local');
        if (notebooks.length > 0) {
          loadNotebooks(notebooks);

          // Load pages for all notebooks
          const allPages = await Promise.all(
            notebooks.map((nb) => getPagesForNotebook(nb.id))
          );
          loadPages(allPages.flat());

          // Set active notebook/page
          const store = useAppStore.getState();
          if (!store.activeNotebookId && notebooks[0]) {
            store.setActiveNotebook(notebooks[0].id);
          }
        } else {
          // First run — create default notebook
          useAppStore.getState().createNotebook('My Notebook', '#3b82f6');
        }
      } catch (e) {
        console.error('[Init] Failed to load from IndexedDB', e);
        // Fallback: create default
        useAppStore.getState().createNotebook('My Notebook', '#3b82f6');
      } finally {
        setAuthLoading(false);
      }
    }

    init();
  }, []); // eslint-disable-line

  return (
    <LanguageProvider>
      <SessionProvider>{children}</SessionProvider>
    </LanguageProvider>
  );
}
