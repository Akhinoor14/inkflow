'use client';
// src/components/ui/ExportMenu.tsx

import React, { useRef, useEffect, useState } from 'react';
import { useAppStore, useActivePage } from '@/store/useAppStore';
import { FileText, FileImage, BookOpen, Loader2 } from 'lucide-react';
import { exportToPDF, exportToDOCX, exportToPNG } from '@/lib/export/exportEngine';

interface Props { onClose: () => void; }

export function ExportMenu({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const activePage = useActivePage();
  const pages = useAppStore((s) => s.pages);
  const activeNotebookId = useAppStore((s) => s.activeNotebookId);
  const notebooks = useAppStore((s) => s.notebooks);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!activePage) return null;

  const activeNotebook = activeNotebookId ? notebooks[activeNotebookId] : null;
  const notebookPages = activeNotebook
    ? activeNotebook.pageIds.map((pid) => pages[pid]).filter(Boolean)
    : [activePage];

  const handleExport = async (type: string, scope: 'page' | 'notebook') => {
    setLoading(type);
    const pagesToExport = scope === 'page' ? [activePage] : notebookPages;
    const filename = scope === 'page' ? activePage.title : activeNotebook?.title ?? 'notebook';

    try {
      if (type === 'pdf') {
        // We pass null for svgElement since exportToPDF uses off-screen SVG
        await exportToPDF(null as any, pagesToExport, { format: 'pdf', filename, quality: 2 });
      } else if (type === 'docx') {
        await exportToDOCX(pagesToExport, { format: 'docx', filename });
      } else if (type === 'png') {
        // Get the SVG from DOM
        const svg = document.querySelector('svg.drawing-canvas') as SVGSVGElement;
        if (svg) await exportToPNG(svg, filename);
      }
    } catch (e) {
      console.error('[Export] Failed', e);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(null);
      onClose();
    }
  };

  const MenuItem = ({
    icon, label, desc, onClick, isLoading,
  }: {
    icon: React.ReactNode; label: string; desc: string;
    onClick: () => void; isLoading?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={!!loading}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left disabled:opacity-50 transition-colors"
    >
      <div className="text-gray-500 flex-shrink-0">
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : icon}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
    </button>
  );

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 w-64 animate-fade-in"
    >
      <div className="text-xs font-semibold text-gray-400 uppercase px-3 py-1 mb-1">Current Page</div>
      <MenuItem
        icon={<FileText size={16} />}
        label="Export as PDF"
        desc="High quality PDF export"
        onClick={() => handleExport('pdf', 'page')}
        isLoading={loading === 'pdf'}
      />
      <MenuItem
        icon={<BookOpen size={16} />}
        label="Export as DOCX"
        desc="Word document with text + drawings"
        onClick={() => handleExport('docx', 'page')}
        isLoading={loading === 'docx'}
      />
      <MenuItem
        icon={<FileImage size={16} />}
        label="Export as PNG"
        desc="High-res image"
        onClick={() => handleExport('png', 'page')}
        isLoading={loading === 'png'}
      />

      {activeNotebook && activeNotebook.pageIds.length > 1 && (
        <>
          <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
          <div className="text-xs font-semibold text-gray-400 uppercase px-3 py-1 mb-1">
            Whole Notebook ({activeNotebook.pageIds.length} pages)
          </div>
          <MenuItem
            icon={<FileText size={16} />}
            label="Export Notebook as PDF"
            desc="All pages in one PDF"
            onClick={() => handleExport('pdf', 'notebook')}
            isLoading={loading === 'pdf'}
          />
          <MenuItem
            icon={<BookOpen size={16} />}
            label="Export Notebook as DOCX"
            desc="All pages in one document"
            onClick={() => handleExport('docx', 'notebook')}
            isLoading={loading === 'docx'}
          />
        </>
      )}
    </div>
  );
}
