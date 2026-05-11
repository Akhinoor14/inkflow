'use client';
// src/components/canvas/MathEditor.tsx — KaTeX inline math editor

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { nanoid } from 'nanoid';

interface Props {
  x: number; y: number;
  pageId: string;
  transform: { x: number; y: number; scale: number };
  onClose: () => void;
}

export function MathEditor({ x, y, pageId, transform, onClose }: Props) {
  const [latex, setLatex] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addElement } = useAppStore();

  const screenX = x * transform.scale + transform.x;
  const screenY = y * transform.scale + transform.y;

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!latex) { setPreview(''); setError(''); return; }
    try {
      // Dynamically import katex only when needed
      import('katex').then(katex => {
        const html = katex.default.renderToString(latex, { throwOnError: true, displayMode: false });
        setPreview(html);
        setError('');
      }).catch(() => setError('KaTeX not installed — run: npm install katex'));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  }, [latex]);

  const commit = () => {
    if (!latex.trim()) { onClose(); return; }
    addElement(pageId, {
      id: nanoid(), type: 'text',
      x, y, width: 300, height: 60,
      content: `$$${latex}$$`,
      // TextElement expects fontSize/fontFamily/color/align at top level
      fontSize: 18,
      fontFamily: 'serif',
      color: '#000000',
      align: 'left',
      createdAt: Date.now(), zIndex: Date.now(),
    });
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 w-80"
      style={{ left: Math.min(screenX, window.innerWidth - 340), top: Math.min(screenY, window.innerHeight - 200) }}
    >
      <div className="text-xs font-medium text-gray-500 mb-2">∑ Math Equation (LaTeX)</div>
      <input
        ref={inputRef}
        value={latex}
        onChange={e => setLatex(e.target.value)}
        onKeyDown={e => { if(e.key==='Enter') commit(); if(e.key==='Escape') onClose(); }}
        placeholder="\frac{a}{b} + \sqrt{x^2}"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {preview && (
        <div
          className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-center"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
      <div className="flex gap-2 mt-3">
        <button onClick={commit} className="flex-1 bg-blue-500 text-white text-xs rounded-lg py-1.5 hover:bg-blue-600">Insert</button>
        <button onClick={onClose} className="flex-1 border border-gray-300 text-xs rounded-lg py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
      </div>
      <div className="mt-2 text-xs text-gray-400">Quick: \frac{} · \sqrt{} · \sum · \int · \alpha</div>
    </div>
  );
}
