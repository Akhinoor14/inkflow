'use client';
// src/components/modals/OCRModal.tsx
// Select strokes → run Tesseract.js → show recognized text → insert as text element

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore, useActivePage } from '@/store/useAppStore';
import { ocrStrokes, runOCR } from '@/lib/ocr/tesseractOCR';
import { getSvgPath } from '@/lib/canvas/strokeEngine';
import { X, Copy, CheckCheck, Loader2, Languages } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { StrokeElement, TextElement } from '@/types';

interface Props { onClose: () => void; }

export function OCRModal({ onClose }: Props) {
  const activePage = useActivePage();
  const { selection, addElement, updateElement } = useAppStore();

  const [result, setResult] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'eng' | 'ben' | 'eng+ben'>('eng');
  const [error, setError] = useState<string>('');

  const selectedStrokes = useMemo(() => activePage?.elements.filter(
    (el): el is StrokeElement =>
      el.type === 'stroke' && selection.selectedIds.includes(el.id)
  ) ?? [], [activePage, selection.selectedIds]);

  const runOCROnSelection = useCallback(async () => {
    if (!activePage || selectedStrokes.length === 0) return;
    setIsRunning(true);
    setError('');

    try {
      // Build SVG paths and bounding box for selected strokes
      const paths: string[] = [];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      for (const stroke of selectedStrokes) {
        const rawPts = stroke.points.map(([x, y, p]) => ({ x, y, pressure: p ?? 0.5 }));
        const path = getSvgPath(rawPts, stroke.style);
        if (path) paths.push(path);
        minX = Math.min(minX, stroke.bounds.x);
        minY = Math.min(minY, stroke.bounds.y);
        maxX = Math.max(maxX, stroke.bounds.x + stroke.bounds.width);
        maxY = Math.max(maxY, stroke.bounds.y + stroke.bounds.height);
      }

      const bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      const ocrResult = await ocrStrokes(paths, bounds, lang);

      setResult(ocrResult.text);
      setConfidence(ocrResult.confidence);

      // Also save recognizedText back to each stroke
      for (const stroke of selectedStrokes) {
        updateElement(activePage.id, stroke.id, { recognizedText: ocrResult.text });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OCR failed');
    } finally {
      setIsRunning(false);
    }
  }, [activePage, selectedStrokes, lang, updateElement]);

  // Auto-run when modal opens if strokes selected
  useEffect(() => {
    if (selectedStrokes.length > 0) runOCROnSelection();
  }, [selectedStrokes, runOCROnSelection]);

  const insertAsText = () => {
    if (!activePage || !result.trim()) return;

    // Place text near the first selected stroke
    const firstStroke = selectedStrokes[0];
    const x = firstStroke ? firstStroke.bounds.x : 100;
    const y = firstStroke ? firstStroke.bounds.y + firstStroke.bounds.height + 20 : 100;

    const el: TextElement = {
      id: nanoid(),
      type: 'text',
      x,
      y,
      width: 300,
      height: 40,
      content: `<p>${result.replace(/\n/g, '</p><p>')}</p>`,
      fontSize: 16,
      fontFamily: lang === 'ben' || lang === 'eng+ben' ? 'Noto Sans Bengali, sans-serif' : 'inherit',
      color: '#1a1a1a',
      align: 'left',
      createdAt: Date.now(),
      zIndex: Date.now(),
    };
    addElement(activePage.id, el);
    onClose();
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidencePct = Math.round(confidence * 100);
  const confidenceColor = confidence > 0.7 ? 'text-green-600' : confidence > 0.4 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Handwriting → Text (OCR)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedStrokes.length} stroke{selectedStrokes.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Language selector */}
        <div className="px-5 pt-4 pb-2 flex items-center gap-3">
          <Languages size={14} className="text-gray-400 flex-shrink-0" />
          <div className="flex gap-1.5">
            {(['eng', 'ben', 'eng+ben'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  lang === l
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {l === 'eng' ? 'English' : l === 'ben' ? 'বাংলা' : 'Both'}
              </button>
            ))}
          </div>
          <button
            onClick={runOCROnSelection}
            disabled={isRunning || selectedStrokes.length === 0}
            className="ml-auto px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-medium hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            {isRunning ? 'Running...' : 'Re-run OCR'}
          </button>
        </div>

        {/* Result area */}
        <div className="px-5 pb-4">
          {isRunning ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Loader2 size={28} className="animate-spin mb-3 text-blue-500" />
              <p className="text-sm">Recognizing handwriting...</p>
              <p className="text-xs mt-1 text-gray-300">Powered by Tesseract.js (offline)</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={runOCROnSelection} className="mt-2 text-xs text-blue-500">Try again</button>
            </div>
          ) : selectedStrokes.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm">Select strokes on the canvas first</p>
              <p className="text-xs mt-1">Use the Select or Lasso tool to select handwriting</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <textarea
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full min-h-[120px] p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 resize-y outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="OCR result will appear here..."
                />
                {result && (
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <span className={`text-xs font-medium ${confidenceColor}`}>
                      {confidencePct}% confidence
                    </span>
                    <span className="text-xs text-gray-400">{result.length} chars</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {result && !isRunning && (
          <div className="flex gap-2 px-5 pb-5">
            <button
              onClick={copyText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? <CheckCheck size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={insertAsText}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Insert as Text Element
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
