'use client';
// src/components/toolbar/PenOptions.tsx

import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { ShapeType } from '@/types';

const SIZES = [2, 4, 6, 10, 16, 24];
const COLORS = [
  '#000000', '#1a1a1a', '#444444',
  '#e53e3e', '#dd6b20', '#d69e2e',
  '#38a169', '#3182ce', '#805ad5',
  '#d53f8c', '#718096', '#ffffff',
];

interface CloseProp { onClose: () => void; }

export function PenOptions({ onClose }: CloseProp) {
  const ref = useRef<HTMLDivElement>(null);
  const { strokeStyle, setStrokeStyle } = useAppStore();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h), 50);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute top-11 left-0 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 w-56 animate-fade-in">
      <div className="text-xs font-semibold text-gray-500 mb-2">Size</div>
      <div className="flex items-end gap-2 mb-2">
        {SIZES.map((s) => (
          <button key={s} onClick={() => setStrokeStyle({ size: s })}
            className={`rounded-full bg-gray-800 dark:bg-gray-200 flex-shrink-0 transition-all ${strokeStyle.size === s ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
            style={{ width: Math.min(s * 2 + 6, 28), height: Math.min(s * 2 + 6, 28) }} />
        ))}
      </div>
      <input type="range" min={1} max={40} value={strokeStyle.size}
        onChange={(e) => setStrokeStyle({ size: +e.target.value })} className="w-full mb-3" />

      <div className="text-xs font-semibold text-gray-500 mb-1">Opacity</div>
      <input type="range" min={0.05} max={1} step={0.05} value={strokeStyle.opacity}
        onChange={(e) => setStrokeStyle({ opacity: +e.target.value })} className="w-full mb-3" />

      <div className="text-xs font-semibold text-gray-500 mb-2">Color</div>
      <div className="grid grid-cols-6 gap-1.5 mb-1">
        {COLORS.map((c) => (
          <button key={c} onClick={() => setStrokeStyle({ color: c })}
            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
              strokeStyle.color === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
            style={{ background: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #ddd' : undefined }} />
        ))}
        <input type="color" value={strokeStyle.color}
          onChange={(e) => setStrokeStyle({ color: e.target.value })}
          className="w-7 h-7 rounded-full cursor-pointer border-0" title="Custom" />
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs font-semibold text-gray-500 mb-1">Stroke feel</div>
        {[
          { label: 'Thinning', key: 'thinning' as const },
          { label: 'Smoothing', key: 'smoothing' as const },
          { label: 'Streamline', key: 'streamline' as const },
        ].map(({ label, key }) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400 w-20">{label}</span>
            <input type="range" min={0} max={1} step={0.05} value={strokeStyle[key]}
              onChange={(e) => setStrokeStyle({ [key]: +e.target.value })} className="flex-1" />
          </div>
        ))}
        <label className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <input type="checkbox" checked={strokeStyle.simulatePressure}
            onChange={(e) => setStrokeStyle({ simulatePressure: e.target.checked })}
            className="rounded" />
          Simulate pressure
        </label>
      </div>
    </div>
  );
}

// ── ColorPicker inline ─────────────────────────
export function ColorPicker() {
  const { strokeStyle, setStrokeStyle } = useAppStore();
  const QUICK = ['#1a1a1a', '#e53e3e', '#3182ce', '#38a169', '#d69e2e', '#805ad5', '#d53f8c'];

  return (
    <div className="flex items-center gap-1 px-1">
      {QUICK.map((c) => (
        <button key={c} onClick={() => setStrokeStyle({ color: c })}
          className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${strokeStyle.color === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
          style={{ background: c }} />
      ))}
      <input type="color" value={strokeStyle.color}
        onChange={(e) => setStrokeStyle({ color: e.target.value })}
        className="w-5 h-5 rounded-full cursor-pointer border-0 p-0 ml-0.5" />
      <div className="rounded-full ml-1 flex-shrink-0"
        style={{ width: Math.max(6, Math.min(strokeStyle.size, 18)), height: Math.max(6, Math.min(strokeStyle.size, 18)), background: strokeStyle.color }} />
    </div>
  );
}

// ── ShapeSelector ──────────────────────────────
const SHAPES: { type: ShapeType; label: string; icon: string }[] = [
  { type: 'rect', label: 'Rect', icon: '▭' },
  { type: 'circle', label: 'Circle', icon: '○' },
  { type: 'ellipse', label: 'Ellipse', icon: '⬭' },
  { type: 'triangle', label: 'Triangle', icon: '△' },
  { type: 'arrow', label: 'Arrow', icon: '→' },
  { type: 'line', label: 'Line', icon: '—' },
  { type: 'star', label: 'Star', icon: '☆' },
];

export function ShapeSelector({ onClose }: CloseProp) {
  const ref = useRef<HTMLDivElement>(null);
  const { activeShapeType, setActiveShapeType, setActiveTool } = useAppStore();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h), 50);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute top-11 left-0 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 animate-fade-in">
      <div className="grid grid-cols-4 gap-1">
        {SHAPES.map((s) => (
          <button key={s.type}
            onClick={() => { setActiveShapeType(s.type); setActiveTool('shape'); onClose(); }}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg text-xs transition-all ${
              activeShapeType === s.type
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
            <span className="text-lg leading-none">{s.icon}</span>
            <span className="text-[10px]">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
