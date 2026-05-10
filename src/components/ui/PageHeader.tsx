'use client';
// src/components/ui/PageHeader.tsx

import React, { useState } from 'react';
import { useAppStore, useActivePage, useActiveNotebook } from '@/store/useAppStore';
import { PanelLeft, FileDown, Mic, MicOff, Search, Grid3X3 } from 'lucide-react';
import { BackgroundPicker } from './BackgroundPicker';
import { ExportMenu } from './ExportMenu';

export function PageHeader() {
  const { toggleSidebar, isSidebarOpen, isRecordingAudio, setIsRecordingAudio } = useAppStore();
  const activePage = useActivePage();
  const activeNotebook = useActiveNotebook();
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showExport, setShowExport] = useState(false);

  if (!activePage) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-10">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
        title="Toggle Sidebar (Ctrl+\)"
      >
        <PanelLeft size={15} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-gray-400 truncate max-w-[100px]">{activeNotebook?.title}</span>
        <span className="text-gray-300">/</span>
        <input
          type="text"
          value={activePage.title}
          onChange={(e) => useAppStore.getState().updatePage(activePage.id, { title: e.target.value })}
          className="font-medium text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-700 px-1 rounded min-w-[80px] max-w-[160px]"
          placeholder="Untitled"
        />
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Audio record */}
        <button
          onClick={() => setIsRecordingAudio(!isRecordingAudio)}
          className={`p-1.5 rounded-md transition-colors ${
            isRecordingAudio
              ? 'bg-red-100 dark:bg-red-950 text-red-600 animate-pulse'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
          }`}
          title={isRecordingAudio ? 'Stop recording' : 'Record audio (Audio Sync)'}
        >
          {isRecordingAudio ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        {/* Background picker */}
        <div className="relative">
          <button
            onClick={() => setShowBgPicker(!showBgPicker)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title="Change background"
          >
            <Grid3X3 size={15} />
          </button>
          {showBgPicker && <BackgroundPicker onClose={() => setShowBgPicker(false)} />}
        </div>

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FileDown size={13} />
            Export
          </button>
          {showExport && <ExportMenu onClose={() => setShowExport(false)} />}
        </div>
      </div>
    </div>
  );
}
