'use client';
// src/components/toolbar/MainToolbar.tsx  (Session 3 updated)

import React, { useRef, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Pen, Eraser, MousePointer, Type, Square, Hand, Highlighter,
  Image, Undo2, Redo2, ZoomIn, ZoomOut, Move, Lasso, Scan, Search, Settings,
  Languages, Cloud,
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { PenOptions, ColorPicker, ShapeSelector } from './PenOptions';
import { OCRModal } from '@/components/modals/OCRModal';
import { SearchModal } from '@/components/modals/SearchModal';
import { DriveModal } from '@/components/modals/DriveModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { HandwritingConvertModal } from '@/components/modals/HandwritingConvertModal';
import { clsx } from 'clsx';

function ToolBtn({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} title={label}
      className={clsx(
        'flex items-center justify-center w-9 h-9 rounded-lg transition-all',
        active ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}>
      {icon}
    </button>
  );
}

function Div() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-0.5 flex-shrink-0" />;
}

export function MainToolbar() {
  const {
    activeTool, setActiveTool, transform, resetTransform, zoomTo,
    isToolbarFloating, setIsToolbarFloating, toolbarPosition, setToolbarPosition,
    undo, redo, selection, handwritingSettings, setHandwritingSettings,
  } = useAppStore();

  // Get selected strokes for handwriting conversion
  const activePageData = useAppStore(s => {
    const nb = s.activeNotebookId ? s.notebooks[s.activeNotebookId] : null;
    const pageId = s.activePageId;
    return pageId ? { page: s.pages[pageId], notebookId: nb?.id ?? '' } : null;
  });
  const selectedStrokes = activePageData?.page?.elements.filter(
    el => el.type === 'stroke' && selection.selectedIds.includes(el.id)
  ) ?? [];

  const [showPenOpts, setShowPenOpts] = useState(false);
  const [showShapeOpts, setShowShapeOpts] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDrive, setShowDrive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHWConvert, setShowHWConvert] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ sx: 0, sy: 0, px: 0, py: 0 });

  useHotkeys('p', () => setActiveTool('pen'));
  useHotkeys('e', () => setActiveTool('eraser'));
  useHotkeys('v', () => setActiveTool('select'));
  useHotkeys('t', () => setActiveTool('text'));
  useHotkeys('h', () => setActiveTool('highlighter'));
  useHotkeys('l', () => setActiveTool('lasso'));
  useHotkeys('ctrl+z,meta+z', undo);
  useHotkeys('ctrl+shift+z,meta+shift+z,ctrl+y', redo);
  useHotkeys('ctrl+0,meta+0', resetTransform);
  useHotkeys('ctrl+f,meta+f', (e) => { e.preventDefault(); setShowSearch(true); });
  useHotkeys('ctrl+shift+o', (e) => { e.preventDefault(); setShowOCR(true); });

  const dragHandleRef = useRef<HTMLDivElement>(null);
  const onDragStart = useCallback((e: React.PointerEvent) => {
    if (!isToolbarFloating) return;
    e.stopPropagation();
    setIsDragging(true);
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: toolbarPosition.x, py: toolbarPosition.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [isToolbarFloating, toolbarPosition]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    const nx = Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.px + e.clientX - dragRef.current.sx));
    const ny = Math.max(48, Math.min(window.innerHeight - 100, dragRef.current.py + e.clientY - dragRef.current.sy));
    setToolbarPosition({ x: nx, y: ny });
  }, [isDragging, setToolbarPosition]);

  const onDragEnd = useCallback(() => setIsDragging(false), []);

  const f = isToolbarFloating;
  const dir = f ? 'flex-col' : 'flex-row';
  const zoomPct = Math.round(transform.scale * 100);

  return (
    <>
      <div
        className={clsx(
          'flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          f ? 'flex-col px-1.5 py-2'
            : 'flex-row w-full border-b border-x-0 border-t-0 px-1 py-1 overflow-x-auto scrollbar-none'
        )}
        style={f ? { position: 'fixed', left: toolbarPosition.x, top: toolbarPosition.y, zIndex: 50, borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', userSelect: 'none' } : {}}
      >
        {/* Drag handle — only draggable part */}
        {f && (
          <div
            ref={dragHandleRef}
            className="w-full flex justify-center py-1 cursor-grab active:cursor-grabbing rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
          >
            <Move size={12} className="text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Drawing tools group */}
        <div className={clsx('flex gap-0.5', dir)}>
          <div className="relative">
            <ToolBtn icon={<Pen size={16} />} label="Pen (P)" active={activeTool === 'pen'}
              onClick={() => { setActiveTool('pen'); setShowPenOpts((v) => !v); }} />
            {showPenOpts && <PenOptions onClose={() => setShowPenOpts(false)} />}
          </div>
          <ToolBtn icon={<Highlighter size={16} />} label="Highlighter (H)" active={activeTool === 'highlighter'} onClick={() => setActiveTool('highlighter')} />
          <ToolBtn icon={<Eraser size={16} />} label="Eraser (E)" active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} />
          <ToolBtn icon={<MousePointer size={16} />} label="Select (V)" active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
          <ToolBtn icon={<Lasso size={16} />} label="Lasso Select (L)" active={activeTool === 'lasso'} onClick={() => setActiveTool('lasso')} />
          <ToolBtn icon={<Type size={16} />} label="Text (T)" active={activeTool === 'text'} onClick={() => setActiveTool('text')} />
          <div className="relative">
            <ToolBtn icon={<Square size={16} />} label="Shapes" active={activeTool === 'shape'}
              onClick={() => { setActiveTool('shape'); setShowShapeOpts((v) => !v); }} />
            {showShapeOpts && <ShapeSelector onClose={() => setShowShapeOpts(false)} />}
          </div>
          <ToolBtn icon={<Image size={16} />} label="Insert Image" active={activeTool === 'image'} onClick={() => setActiveTool('image')} /> {/* eslint-disable-line jsx-a11y/alt-text */}
          <ToolBtn icon={<Hand size={16} />} label="Pan (Space)" active={activeTool === 'pan'} onClick={() => setActiveTool('pan')} />
        </div>

        {!f && <><Div /><ColorPicker /><Div /></>}

        {/* History */}
        <div className={clsx('flex gap-0.5', dir)}>
          <ToolBtn icon={<Undo2 size={16} />} label="Undo (Ctrl+Z)" active={false} onClick={undo} />
          <ToolBtn icon={<Redo2 size={16} />} label="Redo (Ctrl+Shift+Z)" active={false} onClick={redo} />
        </div>

        {!f && <Div />}

        {/* Zoom */}
        <div className={clsx('flex items-center gap-0.5', dir)}>
          <ToolBtn icon={<ZoomIn size={16} />} label="Zoom In (+)" active={false} onClick={() => zoomTo(transform.scale * 1.25)} />
          <button onClick={resetTransform} className="px-2 h-9 text-xs font-mono text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg min-w-[46px]">{zoomPct}%</button>
          <ToolBtn icon={<ZoomOut size={16} />} label="Zoom Out (-)" active={false} onClick={() => zoomTo(transform.scale / 1.25)} />
        </div>

        {!f && <Div />}

        {/* Feature buttons */}
        <div className={clsx('flex gap-0.5', dir)}>
          <ToolBtn icon={<Languages size={16} />} label="Convert Handwriting → Text" active={false} onClick={() => setShowHWConvert(true)} />
          <ToolBtn icon={<Scan size={16} />} label="OCR (Ctrl+Shift+O)" active={false} onClick={() => setShowOCR(true)} />
          <ToolBtn icon={<Search size={16} />} label="Search (Ctrl+F)" active={false} onClick={() => setShowSearch(true)} />
          <ToolBtn icon={<Cloud size={16} />} label="Google Drive Sync" active={false} onClick={() => setShowDrive(true)} />
          <ToolBtn icon={<Settings size={16} />} label="Settings" active={false} onClick={() => setShowSettings(true)} />
        </div>

        {!f && <><Div /><ToolBtn icon={<Move size={16} />} label="Float toolbar" active={false} onClick={() => setIsToolbarFloating(true)} /></>}
        {f && <button onClick={() => setIsToolbarFloating(false)} className="text-[10px] text-gray-400 hover:text-gray-600 mt-0.5">Dock</button>}
      </div>

      {showOCR && <OCRModal onClose={() => setShowOCR(false)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      {showDrive && <DriveModal onClose={() => setShowDrive(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showHWConvert && activePageData && (
        <HandwritingConvertModal
          strokes={selectedStrokes as any}
          pageId={activePageData.page?.id ?? ''}
          notebookId={activePageData.notebookId}
          settings={handwritingSettings}
          onClose={() => setShowHWConvert(false)}
        />
      )}
    </>
  );
}
