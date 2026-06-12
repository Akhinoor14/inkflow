'use client';
// src/components/toolbar/MainToolbar.tsx — fixed (design tokens, drag clamp, hotkeys, popup positioning)

import React, { useRef, useState, useCallback, useEffect } from 'react';
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

// ── Toolbar button — uses design tokens, not Tailwind color classes ──────────
function ToolBtn({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 34, height: 34, borderRadius: 8, border: 'none',
        cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--fn-accent)' : 'transparent',
        color: active ? '#fff' : 'var(--fn-muted)',
        boxShadow: active ? '0 2px 8px var(--fn-blue-glow)' : 'none',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--fn-border)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--fn-text)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--fn-muted)';
        }
      }}
    >
      {icon}
    </button>
  );
}

// ── Divider adapts to docked (vertical) vs floating (horizontal) ─────────────
function Divider({ floating }: { floating: boolean }) {
  return (
    <div style={{
      flexShrink: 0,
      width: floating ? 22 : 1,
      height: floating ? 1 : 22,
      background: 'var(--fn-border)',
      margin: floating ? '3px 5px' : '0 3px',
    }} />
  );
}

// ── Clamp floating toolbar fully inside viewport ──────────────────────────────
// toolbarW and toolbarH are conservative max estimates; actual size is similar
function clampPos(x: number, y: number, toolbarW = 44, toolbarH = 500) {
  return {
    x: Math.max(8, Math.min(window.innerWidth - toolbarW - 8, x)),
    y: Math.max(48, Math.min(window.innerHeight - toolbarH - 8, y)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function MainToolbar() {
  const {
    activeTool, setActiveTool, transform, resetTransform, zoomTo,
    isToolbarFloating, setIsToolbarFloating, toolbarPosition, setToolbarPosition,
    undo, redo, selection, handwritingSettings,
  } = useAppStore();

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
  const toolbarRef = useRef<HTMLDivElement>(null);

  // ── Hotkeys ────────────────────────────────────────────────────────────────
  useHotkeys('p', () => setActiveTool('pen'));
  useHotkeys('e', () => setActiveTool('eraser'));
  useHotkeys('v', () => setActiveTool('select'));
  useHotkeys('t', () => setActiveTool('text'));
  useHotkeys('h', () => setActiveTool('highlighter'));
  useHotkeys('l', () => setActiveTool('lasso'));
  useHotkeys('ctrl+0,meta+0', (e) => { e.preventDefault(); resetTransform(); });
  useHotkeys('ctrl+f,meta+f', (e) => { e.preventDefault(); setShowSearch(true); });
  useHotkeys('ctrl+shift+o', (e) => { e.preventDefault(); setShowOCR(true); });
  useHotkeys('ctrl+z,meta+z', (e) => { e.preventDefault(); undo(); });
  useHotkeys('ctrl+shift+z,meta+shift+z', (e) => { e.preventDefault(); redo(); });
  useHotkeys('=,+', () => doZoom(1.25));
  useHotkeys('-', () => doZoom(1 / 1.25));

  // ── Drag (pointer capture on div, not window listeners) ───────────────────
  const onDragStart = useCallback((e: React.PointerEvent) => {
    if (!isToolbarFloating) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: toolbarPosition.x, py: toolbarPosition.y };
  }, [isToolbarFloating, toolbarPosition]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const { x, y } = clampPos(
      dragRef.current.px + e.clientX - dragRef.current.sx,
      dragRef.current.py + e.clientY - dragRef.current.sy,
    );
    setToolbarPosition({ x, y });
  }, [isDragging, setToolbarPosition]);

  const onDragEnd = useCallback(() => setIsDragging(false), []);

  // Close popups when tool changes
  useEffect(() => {
    setShowPenOpts(false);
    setShowShapeOpts(false);
  }, [activeTool]);

  const f = isToolbarFloating;
  const zoomPct = Math.round(transform.scale * 100);

  // Zoom toward canvas center via data attribute (avoids fragile class selector)
  const doZoom = (factor: number) => {
    const el = document.querySelector('[data-canvas-root]') as HTMLElement
              ?? document.querySelector('.drawing-canvas') as HTMLElement;
    const r = el?.getBoundingClientRect();
    zoomTo(transform.scale * factor, r ? r.width / 2 : window.innerWidth / 2, r ? r.height / 2 : window.innerHeight / 2);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = f
    ? {
        position: 'fixed', zIndex: 100,
        left: toolbarPosition.x, top: toolbarPosition.y,
        flexDirection: 'column',
        padding: '5px 4px',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px var(--fn-border)',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'default',
        minWidth: 42,
      }
    : {
        flexDirection: 'row',
        width: '100%', flexShrink: 0,
        padding: '2px 6px',
        borderBottom: '1px solid var(--fn-border)',
        overflowX: 'auto',
        gap: 2,
      };

  return (
    <>
      <div
        ref={toolbarRef}
        className="scrollbar-none"
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--fn-surface)',
          ...containerStyle,
        }}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        {/* ── Floating drag handle ── */}
        {f && (
          <div
            onPointerDown={onDragStart}
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              width: '100%', paddingBottom: 4, paddingTop: 2,
              cursor: isDragging ? 'grabbing' : 'grab',
              borderRadius: 6, flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--fn-border)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <Move size={11} style={{ color: 'var(--fn-muted)', pointerEvents: 'none' }} />
          </div>
        )}

        {/* ── Drawing tools ── */}
        <div style={{ display: 'flex', flexDirection: f ? 'column' : 'row', gap: 2, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <ToolBtn icon={<Pen size={15} />} label="Pen (P)" active={activeTool === 'pen'}
              onClick={() => { setActiveTool('pen'); setShowPenOpts(v => !v); }} />
            {showPenOpts && <PenOptions onClose={() => setShowPenOpts(false)} floatingMode={f} />}
          </div>
          <ToolBtn icon={<Highlighter size={15} />} label="Highlighter (H)" active={activeTool === 'highlighter'} onClick={() => setActiveTool('highlighter')} />
          <ToolBtn icon={<Eraser size={15} />} label="Eraser (E)" active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} />
          <ToolBtn icon={<MousePointer size={15} />} label="Select (V)" active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
          <ToolBtn icon={<Lasso size={15} />} label="Lasso (L)" active={activeTool === 'lasso'} onClick={() => setActiveTool('lasso')} />
          <ToolBtn icon={<Type size={15} />} label="Text (T)" active={activeTool === 'text'} onClick={() => setActiveTool('text')} />
          <div style={{ position: 'relative' }}>
            <ToolBtn icon={<Square size={15} />} label="Shapes" active={activeTool === 'shape'}
              onClick={() => { setActiveTool('shape'); setShowShapeOpts(v => !v); }} />
            {showShapeOpts && <ShapeSelector onClose={() => setShowShapeOpts(false)} floatingMode={f} />}
          </div>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <ToolBtn icon={<Image size={15} />} label="Insert Image" active={activeTool === 'image'} onClick={() => setActiveTool('image')} />
          <ToolBtn icon={<Hand size={15} />} label="Pan (Space)" active={activeTool === 'pan'} onClick={() => setActiveTool('pan')} />
        </div>

        {/* Color picker — docked only */}
        {!f && <><Divider floating={f} /><ColorPicker /><Divider floating={f} /></>}

        {/* ── History ── */}
        {f && <Divider floating={f} />}
        {!f && <Divider floating={f} />}
        <div style={{ display: 'flex', flexDirection: f ? 'column' : 'row', gap: 2, flexShrink: 0 }}>
          <ToolBtn icon={<Undo2 size={15} />} label="Undo (Ctrl+Z)" onClick={undo} />
          <ToolBtn icon={<Redo2 size={15} />} label="Redo (Ctrl+Shift+Z)" onClick={redo} />
        </div>

        {/* ── Zoom ── */}
        <Divider floating={f} />
        <div style={{ display: 'flex', flexDirection: f ? 'column' : 'row', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <ToolBtn icon={<ZoomIn size={15} />} label="Zoom In (+)" onClick={() => doZoom(1.25)} />
          <button
            onClick={resetTransform}
            title="Reset zoom (Ctrl+0)"
            style={{
              height: 34, padding: '0 5px', borderRadius: 7, border: 'none',
              cursor: 'pointer', background: 'transparent', color: 'var(--fn-muted)',
              fontFamily: 'var(--fn-font-mono, monospace)', fontSize: 11,
              whiteSpace: 'nowrap', flexShrink: 0, minWidth: f ? 'unset' : 40,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--fn-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fn-text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fn-muted)'; }}
          >
            {zoomPct}%
          </button>
          <ToolBtn icon={<ZoomOut size={15} />} label="Zoom Out (-)" onClick={() => doZoom(1 / 1.25)} />
        </div>

        {/* ── Feature buttons ── */}
        <Divider floating={f} />
        <div style={{ display: 'flex', flexDirection: f ? 'column' : 'row', gap: 2, flexShrink: 0 }}>
          <ToolBtn icon={<Languages size={15} />} label="Convert Handwriting → Text" onClick={() => setShowHWConvert(true)} />
          <ToolBtn icon={<Scan size={15} />} label="OCR (Ctrl+Shift+O)" onClick={() => setShowOCR(true)} />
          <ToolBtn icon={<Search size={15} />} label="Search (Ctrl+F)" onClick={() => setShowSearch(true)} />
          <ToolBtn icon={<Cloud size={15} />} label="Google Drive Sync" onClick={() => setShowDrive(true)} />
          <ToolBtn icon={<Settings size={15} />} label="Settings" onClick={() => setShowSettings(true)} />
        </div>

        {/* ── Float / Dock toggle ── */}
        {!f && (
          <>
            <Divider floating={f} />
            <ToolBtn icon={<Move size={15} />} label="Float toolbar" onClick={() => setIsToolbarFloating(true)} />
          </>
        )}
        {f && (
          <button
            onClick={() => setIsToolbarFloating(false)}
            title="Dock toolbar"
            style={{
              marginTop: 3, width: '100%', padding: '3px 0',
              borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'var(--fn-muted)',
              fontSize: 9, fontFamily: 'var(--fn-font-ui)', letterSpacing: '0.05em',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--fn-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fn-text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fn-muted)'; }}
          >
            DOCK
          </button>
        )}
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
