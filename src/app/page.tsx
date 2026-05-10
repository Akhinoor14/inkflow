'use client';
// src/app/page.tsx (Session 3 updated)

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MainToolbar } from '@/components/toolbar/MainToolbar';
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas';
import { PageHeader } from '@/components/ui/PageHeader';
import { AudioSyncPanel } from '@/components/ui/AudioSyncPanel';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useThumbnailGenerator } from '@/hooks/useThumbnail';
import { flushSaves } from '@/lib/storage/autoSave';

export default function EditorPage() {
  const { isAuthLoading, activePageId } = useAppStore();

  useKeyboardShortcuts();
  useThumbnailGenerator(activePageId);

  useEffect(() => {
    window.addEventListener('beforeunload', flushSaves);
    return () => window.removeEventListener('beforeunload', flushSaves);
  }, []);

  if (isAuthLoading) return <LoadingScreen />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MainToolbar />
        <PageHeader />
        <AudioSyncPanel />
        <DrawingCanvas className="flex-1" />
      </div>
    </div>
  );
}
