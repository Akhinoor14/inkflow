'use client';
// src/components/modals/SearchModal.tsx
// Search across all pages: OCR text, typed text, page titles

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Search, X, FileText, ChevronRight } from 'lucide-react';
import type { Page, StrokeElement, TextElement } from '@/types';

interface SearchResult {
  pageId: string;
  notebookId: string;
  pageTitle: string;
  notebookTitle: string;
  snippet: string;
  elementId?: string;
  type: 'ocr' | 'text' | 'title';
}

interface Props { onClose: () => void; }

export function SearchModal({ onClose }: Props) {
  const { pages, notebooks, setActiveNotebook, setActivePage, setSelection, setActiveModal } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const found: SearchResult[] = [];

    for (const page of Object.values(pages)) {
      const nb = notebooks[page.notebookId];
      const nbTitle = nb?.title ?? 'Unknown';

      // Match page title
      if (page.title.toLowerCase().includes(lower)) {
        found.push({
          pageId: page.id, notebookId: page.notebookId,
          pageTitle: page.title, notebookTitle: nbTitle,
          snippet: page.title, type: 'title',
        });
      }

      // Match typed text elements
      for (const el of page.elements) {
        if (el.type === 'text') {
          const text = stripHtml((el as TextElement).content);
          if (text.toLowerCase().includes(lower)) {
            found.push({
              pageId: page.id, notebookId: page.notebookId,
              pageTitle: page.title, notebookTitle: nbTitle,
              snippet: getSnippet(text, lower),
              elementId: el.id, type: 'text',
            });
          }
        }

        // Match OCR-recognized handwriting
        if (el.type === 'stroke' && (el as StrokeElement).recognizedText) {
          const ocrText = (el as StrokeElement).recognizedText!;
          if (ocrText.toLowerCase().includes(lower)) {
            found.push({
              pageId: page.id, notebookId: page.notebookId,
              pageTitle: page.title, notebookTitle: nbTitle,
              snippet: getSnippet(ocrText, lower),
              elementId: el.id, type: 'ocr',
            });
          }
        }
      }
    }

    // Dedupe by pageId+elementId, limit 30
    const seen = new Set<string>();
    const deduped = found.filter((r) => {
      const key = `${r.pageId}-${r.elementId ?? 'title'}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 30);

    setResults(deduped);
  }, [pages, notebooks]);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 150);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const navigate = (result: SearchResult) => {
    setActiveNotebook(result.notebookId);
    setActivePage(result.pageId);
    if (result.elementId) setSelection({ selectedIds: [result.elementId] });
    onClose();
  };

  const typeLabel = (type: SearchResult['type']) => {
    if (type === 'ocr') return <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 font-medium">Handwriting</span>;
    if (type === 'text') return <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium">Text</span>;
    return <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 font-medium">Page</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl animate-slide-up overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, handwriting, text..."
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
          <kbd className="text-xs text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query && results.length === 0 && (
            <div className="py-10 text-center text-gray-400">
              <p className="text-sm">No results for "{query}"</p>
              <p className="text-xs mt-1">Try running OCR on handwriting to make it searchable</p>
            </div>
          )}

          {!query && (
            <div className="py-8 text-center text-gray-400">
              <Search size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Type to search across all notebooks</p>
              <p className="text-xs mt-1">Searches typed text and recognized handwriting</p>
            </div>
          )}

          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => navigate(r)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left border-b border-gray-50 dark:border-gray-700/50 transition-colors"
            >
              <FileText size={14} className="text-gray-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-gray-400 truncate">{r.notebookTitle}</span>
                  <ChevronRight size={10} className="text-gray-300 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">{r.pageTitle}</span>
                  {typeLabel(r.type)}
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                  {highlightQuery(r.snippet, query)}
                </p>
              </div>
              <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? '';
}

function getSnippet(text: string, query: string, radius = 60): string {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text.slice(0, 120);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}

function highlightQuery(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{part}</mark>
      : part
  );
}
