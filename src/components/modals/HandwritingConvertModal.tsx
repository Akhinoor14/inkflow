'use client';
// src/components/modals/HandwritingConvertModal.tsx
// Shows OCR result, lets user edit before committing

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, RotateCcw, Languages } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useAppStore } from '@/store/useAppStore';
import type { StrokeElement } from '@/types';
import { convertRegionToText } from '@/lib/ocr/handwritingConversion';
import type { HandwritingSettings } from '@/lib/ocr/handwritingConversion';
import { scheduleSave } from '@/lib/storage/autoSave';

interface Props {
  strokes: StrokeElement[];
  pageId: string;
  notebookId: string;
  settings: HandwritingSettings;
  onClose: () => void;
}

export function HandwritingConvertModal({ strokes, pageId, notebookId, settings, onClose }: Props) {
  const { addElement, deleteElements } = useAppStore();
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bbox, setBbox] = useState({ x: 0, y: 0, width: 200, height: 50 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    convertRegionToText(strokes, settings)
      .then(result => {
        setText(result.text);
        setConfidence(result.confidence);
        setBbox({ x: result.x, y: result.y, width: result.width, height: result.height });
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [strokes, settings]);

  const commit = () => {
    if (!text.trim()) { onClose(); return; }
    // Add text element at bounding box position
    addElement(pageId, {
      id: nanoid(),
      type: 'text',
      x: bbox.x,
      y: bbox.y,
      width: Math.max(bbox.width, 200),
      height: Math.max(bbox.height, 40),
      content: text,
      style: {
        fontSize: settings.fontSize,
        bold: false, italic: false, underline: false,
        color: settings.textColor,
        font: settings.fontFamily,
        align: 'left',
      },
      createdAt: Date.now(),
      zIndex: Date.now(),
    });
    // Remove original strokes unless keepOriginalStroke is set
    if (!settings.keepOriginalStroke) {
      deleteElements(pageId, strokes.map(s => s.id));
    }
    scheduleSave(pageId, notebookId);
    onClose();
  };

  const confColor = confidence > 80 ? 'text-green-600' : confidence > 60 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Languages size={16} className="text-blue-500" />
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Handwriting → Text</span>
            {settings.showConfidence && !loading && confidence > 0 && (
              <span className={`text-xs font-mono ${confColor}`}>{Math.round(confidence)}% conf.</span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><X size={15} /></button>
        </div>

        <div className="p-4">
          {loading && (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">
                {settings.language === 'ben' ? 'বাংলা পাঠ করা হচ্ছে...' : 'Recognizing handwriting...'}
              </p>
            </div>
          )}

          {error && (
            <div className="py-4 text-center">
              <p className="text-sm text-red-500 mb-2">OCR failed: {error}</p>
              <p className="text-xs text-gray-400">Make sure Tesseract.js is installed: <code>npm install tesseract.js</code></p>
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="text-xs text-gray-400 mb-2">
                {settings.correctionMode ? 'Edit before inserting:' : 'Recognized text:'}
              </p>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                readOnly={!settings.correctionMode}
                rows={4}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm resize-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: settings.fontFamily, fontSize: settings.fontSize }}
              />
              {!text.trim() && (
                <p className="text-xs text-amber-500 mt-1">⚠ No text recognized. Try adjusting language settings.</p>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <RotateCcw size={13} /> Cancel
                </button>
                <button onClick={commit} disabled={!text.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors">
                  <Check size={13} />
                  {settings.keepOriginalStroke ? 'Insert Text' : 'Convert & Replace'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
