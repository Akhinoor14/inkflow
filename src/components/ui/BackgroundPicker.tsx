'use client';
// src/components/ui/BackgroundPicker.tsx

import React, { useRef, useEffect } from 'react';
import { useAppStore, useActivePage } from '@/store/useAppStore';
import { scheduleSave } from '@/lib/storage/autoSave';
import type { BackgroundType } from '@/types';

const BG_TYPES: { type: BackgroundType; label: string; icon: string }[] = [
  { type: 'blank', label: 'Blank', icon: '⬜' },
  { type: 'lined', label: 'Lined', icon: '☰' },
  { type: 'grid', label: 'Grid', icon: '⊞' },
  { type: 'dotted', label: 'Dotted', icon: '⠿' },
  { type: 'isometric', label: 'Isometric', icon: '◈' },
  { type: 'music', label: 'Music', icon: '♪' },
];

const BG_COLORS = [
  '#fafaf8', '#ffffff', '#fffde7', '#f3e5f5',
  '#e8f5e9', '#e3f2fd', '#fce4ec', '#1a1a1e',
];

interface Props { onClose: () => void; }

export function BackgroundPicker({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const activePage = useActivePage();
  const { updatePage } = useAppStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!activePage) return null;

  const setType = (type: BackgroundType) => {
    updatePage(activePage.id, { background: { ...activePage.background, type } });
    scheduleSave(activePage.id, activePage.notebookId);
  };

  const setColor = (color: string) => {
    updatePage(activePage.id, { background: { ...activePage.background, color } });
    scheduleSave(activePage.id, activePage.notebookId);
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 w-52 animate-fade-in"
    >
      <div className="text-xs font-semibold text-gray-500 mb-2">Background Style</div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {BG_TYPES.map((bg) => (
          <button
            key={bg.type}
            onClick={() => setType(bg.type)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs border transition-all ${
              activePage.background.type === bg.type
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-600 dark:text-gray-300'
            }`}
          >
            <span className="text-base">{bg.icon}</span>
            <span>{bg.label}</span>
          </button>
        ))}
      </div>

      <div className="text-xs font-semibold text-gray-500 mb-2">Background Color</div>
      <div className="grid grid-cols-4 gap-1.5">
        {BG_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-9 h-9 rounded-lg border-2 transition-all ${
              activePage.background.color === c
                ? 'border-blue-500 scale-105'
                : 'border-gray-200 dark:border-gray-600 hover:scale-105'
            }`}
            style={{ background: c }}
          />
        ))}
        <input
          type="color"
          value={activePage.background.color}
          onChange={(e) => setColor(e.target.value)}
          className="w-9 h-9 rounded-lg cursor-pointer border-0"
          title="Custom color"
        />
      </div>

      <div className="mt-3">
        <div className="text-xs font-semibold text-gray-500 mb-1">Line Spacing</div>
        <input
          type="range"
          min={16}
          max={64}
          step={4}
          value={activePage.background.lineSpacing ?? 32}
          onChange={(e) =>
            updatePage(activePage.id, {
              background: { ...activePage.background, lineSpacing: +e.target.value },
            })
          }
          className="w-full"
        />
      </div>
    </div>
  );
}
