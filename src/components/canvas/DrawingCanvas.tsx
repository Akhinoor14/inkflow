'use client';
// src/components/canvas/DrawingCanvas.tsx — production-hardened

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore, useActivePage } from '@/store/useAppStore';
import { scheduleSave } from '@/lib/storage/autoSave';
import {
  getRawPoints, getSvgPath, createStrokeElement,
  isPointNearStroke, adjustColorForDarkMode, type RawPoint,
} from '@/lib/canvas/strokeEngine';
import { recognizeShape } from '@/lib/canvas/shapeRecognition';
import { getCurrentAudioTimestamp } from '@/lib/audio/audioSync';
import { StrokeRenderer } from './StrokeRenderer';
import { ShapeRenderer } from './ShapeRenderer';
import { TextElementRenderer } from './TextElementRenderer';
import { ImageElementRenderer } from './ImageElementRenderer';
import { SelectionBox } from './SelectionBox';
import { CanvasBackground } from './CanvasBackground';
import { TextEditor } from './TextEditor';
import { MathEditor } from './MathEditor';
import { HandwritingConvertModal } from '@/components/modals/HandwritingConvertModal';
import { useImageDrop } from '@/hooks/useImageDrop';
import { nanoid } from 'nanoid';
import type { CanvasElement, TextElement, ShapeElement, Point } from '@/types';

interface DrawingCanvasProps { className?: string; }
interface TextEditorState { open: boolean; element?: TextElement; x?: number; y?: number; }

export function DrawingCanvas({ className }: DrawingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const activePage = useActivePage();

  const {
    activeTool, strokeStyle, highlighterStyle,
    transform, selection, isDarkMode, preferences, isRecordingAudio,
    activeShapeType, addElement, deleteElements,
    setTransform, setSelection, clearSelection, pushHistory, zoomTo, moveElements,
    updateElement,
  } = useAppStore();

  const handwritingSettings = useAppStore(s => s.handwritingSettings);

  const [livePoints, setLivePoints] = useState<RawPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
  const [isLassoing, setIsLassoing] = useState(false);
  const [eraserPos, setEraserPos] = useState<Point | null>(null);
  const [textEditor, setTextEditor] = useState<TextEditorState>({ open: false });
  const [mathEditor, setMathEditor] = useState<{ open: boolean; x?: number; y?: number }>({ open: false });
  const [shapePreview, setShapePreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [autoConvertStrokes, setAutoConvertStrokes] = useState<any[]>([]);
  const [showAutoConvert, setShowAutoConvert] = useState(false);

  const shapeStart = useRef<Point | null>(null);
  const isDraggingSelection = useRef(false);
  const dragOrigin = useRef<Point | null>(null);
  // Fix #7: track whether we already pushed history for this drag session
  const didPushDragHistory = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef<Point>({ x: 0, y: 0 });
  const transformStart = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);
  const autoConvertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Fix #5: track whether eraser history has been pushed for current stroke
  const eraserHistoryPushed = useRef(false);

  useImageDrop(containerRef as React.RefObject<HTMLElement>);

  const getCanvasPoint = useCallback((clientX: number, clientY: number): Point => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top - transform.y) / transform.scale,
    };
  }, [transform]);

  const doErase = useCallback((pt: Point) => {
    if (!activePage) return;
    const r = strokeStyle.size * 3;
    const toDelete: string[] = [];
    for (const el of activePage.elements) {
      if (el.type !== 'stroke') continue;
      if (isPointNearStroke(pt, el.points, r)) toDelete.push(el.id);
    }
    if (toDelete.length > 0) {
      deleteElements(activePage.id, toDelete);
      scheduleSave(activePage.id, activePage.notebookId);
    }
  }, [activePage, strokeStyle.size, deleteElements]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (ctxMenu) { setCtxMenu(null); }
    if (e.button === 1 || (e.button === 0 && activeTool === 'pan')) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      transformStart.current = { x: transform.x, y: transform.y };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e.clientX, e.clientY);

    if (activeTool === 'text') { setTextEditor({ open: true, x: pt.x, y: pt.y }); return; }

    if (activeTool === 'image') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (ev) => {
        const file = (ev.target as HTMLInputElement).files?.[0];
        if (!file || !activePage) return;
        const reader = new FileReader();
        reader.onload = (re) => {
          const src = re.target?.result as string;
          const img = new window.Image();
          img.onload = () => {
            const maxW = 400;
            const scale = img.width > maxW ? maxW / img.width : 1;
            addElement(activePage.id, {
              id: nanoid(), type: 'image',
              x: pt.x, y: pt.y,
              width: img.width * scale,
              height: img.height * scale,
              src,
              rotation: 0,
              opacity: 1,
              createdAt: Date.now(),
              zIndex: Date.now(),
            } as any);
            scheduleSave(activePage.id, activePage.notebookId);
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }

    if (activeTool === 'shape') {
      pushHistory('shape');
      shapeStart.current = pt;
      setIsDrawing(true);
      setShapePreview({ x: pt.x, y: pt.y, w: 0, h: 0 });
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      pushHistory('stroke');
      setLivePoints([getRawPoints(e.nativeEvent, containerRef.current!, transform)]);
      setIsDrawing(true);
      return;
    }

    if (activeTool === 'eraser') {
      // Fix #5: push history once at the start of each erase stroke
      if (!eraserHistoryPushed.current) {
        pushHistory('erase');
        eraserHistoryPushed.current = true;
      }
      setIsDrawing(true);
      doErase(pt);
      return;
    }

    if (activeTool === 'lasso') {
      setIsLassoing(true); setLassoPoints([pt]); clearSelection(); return;
    }

    if (activeTool === 'select') {
      const hit = hitTest(pt, activePage?.elements ?? []);
      if (hit) {
        const alreadySelected = selection.selectedIds.includes(hit);
        const newSel = e.shiftKey
          ? alreadySelected
            ? selection.selectedIds.filter(id => id !== hit)
            : [...selection.selectedIds, hit]
          : alreadySelected ? selection.selectedIds : [hit];
        setSelection({ selectedIds: newSel });
        // Fix #7: only push history when we actually start dragging, not on every click
        dragOrigin.current = pt;
        isDraggingSelection.current = true;
        didPushDragHistory.current = false;
      } else {
        clearSelection();
      }
    }
  }, [activeTool, transform, activePage, selection, ctxMenu, pushHistory, clearSelection, setSelection, getCanvasPoint, doErase]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning.current) {
      setTransform({
        x: transformStart.current.x + (e.clientX - panStart.current.x),
        y: transformStart.current.y + (e.clientY - panStart.current.y),
      });
      return;
    }
    const pt = getCanvasPoint(e.clientX, e.clientY);

    if (activeTool === 'eraser') { setEraserPos(pt); if (isDrawing) doErase(pt); return; }
    if (isLassoing) { setLassoPoints(p => [...p, pt]); return; }

    if (activeTool === 'shape' && isDrawing && shapeStart.current) {
      setShapePreview({
        x: Math.min(shapeStart.current.x, pt.x),
        y: Math.min(shapeStart.current.y, pt.y),
        w: Math.abs(pt.x - shapeStart.current.x),
        h: Math.abs(pt.y - shapeStart.current.y),
      });
      return;
    }

    if (isDraggingSelection.current && dragOrigin.current && activePage && selection.selectedIds.length > 0) {
      const dx = pt.x - dragOrigin.current.x;
      const dy = pt.y - dragOrigin.current.y;
      // Fix #7: push history only on first actual movement (not on every click)
      if ((Math.abs(dx) > 1 || Math.abs(dy) > 1) && !didPushDragHistory.current) {
        pushHistory('move elements');
        didPushDragHistory.current = true;
      }
      if (didPushDragHistory.current) {
        moveElements(activePage.id, selection.selectedIds, dx, dy);
        dragOrigin.current = pt;
      }
      return;
    }

    if (!isDrawing) return;
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setLivePoints(p => [...p, getRawPoints(e.nativeEvent, containerRef.current!, transform)]);
    }
  }, [activeTool, isDrawing, isLassoing, transform, selection, activePage, getCanvasPoint, setTransform, doErase, moveElements, pushHistory]);

  const handlePointerUp = useCallback(async (e: React.PointerEvent<SVGSVGElement>) => {
    isPanning.current = false;

    // Fix #5: reset eraser history flag on pointer up
    if (activeTool === 'eraser') {
      eraserHistoryPushed.current = false;
      setIsDrawing(false);
      return;
    }

    if (isDraggingSelection.current) {
      isDraggingSelection.current = false;
      didPushDragHistory.current = false;
      dragOrigin.current = null;
      if (activePage) scheduleSave(activePage.id, activePage.notebookId);
      return;
    }

    // Shape drag-to-draw
    if (activeTool === 'shape' && isDrawing && shapeStart.current && activePage && shapePreview) {
      setIsDrawing(false);
      setShapePreview(null);
      const { x, y, w, h } = shapePreview;
      if (w > 8 && h > 8) {
        addElement(activePage.id, {
          id: nanoid(), type: 'shape', shapeType: activeShapeType,
          x, y, width: w, height: h,
          stroke: strokeStyle.color, fill: 'transparent',
          strokeWidth: Math.max(strokeStyle.size / 2, 1.5),
          opacity: strokeStyle.opacity, rotation: 0,
          createdAt: Date.now(), zIndex: Date.now(),
        });
        scheduleSave(activePage.id, activePage.notebookId);
      }
      shapeStart.current = null;
      return;
    }

    if (isLassoing && activePage) {
      setIsLassoing(false);
      setSelection({ selectedIds: elementsInLasso(lassoPoints, activePage.elements) });
      setLassoPoints([]);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    if (!activePage) return;

    if ((activeTool === 'pen' || activeTool === 'highlighter') && livePoints.length >= 2) {
      const style = activeTool === 'highlighter'
        ? { ...highlighterStyle }
        : { ...strokeStyle, color: adjustColorForDarkMode(strokeStyle.color, isDarkMode && preferences.inkAutoAdjustDarkMode) };

      const rawPts = livePoints.map((p): [number, number, number] => [p.x, p.y, p.pressure]);
      const threshold = handwritingSettings.shapeAutoConvert ? handwritingSettings.geometrySnapThreshold : 9999;
      const rec = recognizeShape(rawPts);
      // In auto mode, circle is excluded — closed round handwriting strokes
      // (e.g. letters like o/০/ও/র) are too easily mistaken for circles.
      if (handwritingSettings.shapeAutoConvert && rec.shape === 'circle') {
        rec.shape = null;
        rec.confidence = 0;
      }

      if (rec.shape && rec.confidence >= threshold) {
        const { x, y, width, height } = rec.boundingBox;

        if ((rec.shape === 'line' || rec.shape === 'arrow') && rec.rotation !== undefined) {
          // Bug fix: for line/arrow, the bounding box width/height don't
          // represent the stroke's actual length once it's rotated away
          // from horizontal. Use the true point-to-point length as the
          // shape "width" and rotate it into place around the bbox center.
          const first = livePoints[0];
          const last = livePoints[livePoints.length - 1];
          const len = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);
          const cx = x + width / 2;
          const cy = y + height / 2;
          const h = Math.max(strokeStyle.size * 2, 16); // bbox height for arrow head sizing
          addElement(activePage.id, {
            id: nanoid(), type: 'shape', shapeType: rec.shape,
            x: cx - len / 2, y: cy - h / 2, width: Math.max(len, 20), height: h,
            stroke: style.color, fill: 'transparent',
            strokeWidth: Math.max(style.size / 2, 1.5),
            opacity: style.opacity, rotation: rec.rotation,
            audioTimestamp: isRecordingAudio ? getCurrentAudioTimestamp() : undefined,
            createdAt: Date.now(), zIndex: Date.now(),
          });
        } else {
          addElement(activePage.id, {
            id: nanoid(), type: 'shape', shapeType: rec.shape,
            x, y, width: Math.max(width, 20), height: Math.max(height, 20),
            stroke: style.color, fill: 'transparent',
            strokeWidth: Math.max(style.size / 2, 1.5),
            opacity: style.opacity, rotation: 0,
            audioTimestamp: isRecordingAudio ? getCurrentAudioTimestamp() : undefined,
            createdAt: Date.now(), zIndex: Date.now(),
          });
        }
      } else {
        const el = createStrokeElement(livePoints, style);
        if (isRecordingAudio) el.audioTimestamp = getCurrentAudioTimestamp();
        addElement(activePage.id, el);

        // Auto handwriting conversion
        if (handwritingSettings.conversionMode === 'auto') {
          if (autoConvertTimer.current) clearTimeout(autoConvertTimer.current);
          const capturedPageId = activePage.id;
          autoConvertTimer.current = setTimeout(() => {
            // Fix #16: read page from store at callback time, not from stale closure
            const freshPage = useAppStore.getState().pages[capturedPageId];
            const last = freshPage ? freshPage.elements.filter(e2 => e2.type === 'stroke').slice(-1) as any[] : [];
            if (last.length) { setAutoConvertStrokes(last); setShowAutoConvert(true); }
          }, handwritingSettings.autoConvertDelay);
        }
      }
      setLivePoints([]);
      scheduleSave(activePage.id, activePage.notebookId);
    }
  }, [isDrawing, isLassoing, lassoPoints, activeTool, livePoints, activePage,
      strokeStyle, highlighterStyle, isDarkMode, preferences, isRecordingAudio,
      activeShapeType, shapePreview, handwritingSettings,
      addElement, setSelection, pushHistory]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!activePage) return;
    const pt = getCanvasPoint(e.clientX, e.clientY);
    for (const el of activePage.elements) {
      if (el.type === 'text') {
        const t = el as TextElement;
        if (pt.x >= t.x && pt.x <= t.x + t.width && pt.y >= t.y && pt.y <= t.y + t.height) {
          setTextEditor({ open: true, element: t }); return;
        }
      }
    }
    if (activeTool === 'select' || activeTool === 'text') {
      setTextEditor({ open: true, x: pt.x, y: pt.y });
    }
  }, [activePage, activeTool, getCanvasPoint]);

  const handleContextMenu = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    const pt = getCanvasPoint(e.clientX, e.clientY);
    setCtxMenu({ x: e.clientX, y: e.clientY, canvasX: pt.x, canvasY: pt.y });
  }, [getCanvasPoint]);

  // Wheel zoom/pan — passive: false so we can preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Always read fresh transform from store, not from stale closure
      const { transform: t } = useAppStore.getState();
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect();
        // Fix #4: zoom anchored to cursor position relative to container
        useAppStore.getState().zoomTo(
          t.scale * (1 - e.deltaY * 0.01),
          e.clientX - rect.left,
          e.clientY - rect.top
        );
      } else {
        useAppStore.getState().setTransform({ x: t.x - e.deltaX, y: t.y - e.deltaY });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []); // Fix: no deps — always reads fresh state via getState()

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const [t1, t2] = Array.from(e.touches);
    const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    if (lastTouchDist.current !== null) {
      const rect = containerRef.current!.getBoundingClientRect();
      zoomTo(transform.scale * (dist / lastTouchDist.current),
        (t1.clientX + t2.clientX) / 2 - rect.left,
        (t1.clientY + t2.clientY) / 2 - rect.top);
    }
    lastTouchDist.current = dist;
  }, [transform.scale, zoomTo]);

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <img src="/logo.svg" alt="" className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No page selected</p>
          <p className="text-sm mt-1">Create a notebook to get started</p>
        </div>
      </div>
    );
  }

  const liveStyle = activeTool === 'highlighter' ? highlighterStyle : strokeStyle;
  const livePath = livePoints.length > 1 ? getSvgPath(livePoints, liveStyle) : null;
  const svgT = `translate(${transform.x},${transform.y}) scale(${transform.scale})`;
  const lassoD = lassoPoints.length > 1
    ? `M ${lassoPoints.map(p => `${p.x},${p.y}`).join('L')} Z` : null;

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden select-none ${className ?? ''}`}
      style={{ cursor: getCursor(activeTool) }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => { lastTouchDist.current = null; }}
    >
      <svg
        ref={svgRef}
        className="drawing-canvas absolute inset-0 w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setEraserPos(null);
          // Fix #5: also reset eraser history flag if pointer leaves canvas mid-stroke
          if (activeTool === 'eraser') {
            eraserHistoryPushed.current = false;
            setIsDrawing(false);
          }
        }}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        style={{ touchAction: 'none' }}
      >
        <g transform={svgT}>
          <CanvasBackground background={activePage.background} isDarkMode={isDarkMode} />
          {activePage.elements.map(el => (
            <ElementRenderer
              key={el.id} element={el}
              isSelected={selection.selectedIds.includes(el.id)}
              isDarkMode={isDarkMode}
              transform={transform}
              pageId={activePage.id}
              updateElement={updateElement}
              pushHistory={pushHistory}
            />
          ))}
          {livePath && (
            <path d={livePath} fill={liveStyle.color} opacity={liveStyle.opacity}
              style={{ pointerEvents: 'none' }} />
          )}
          {lassoD && (
            <path d={lassoD} fill="rgba(59,130,246,0.07)" stroke="#3b82f6"
              strokeWidth={1 / transform.scale}
              strokeDasharray={`${4 / transform.scale} ${2 / transform.scale}`}
              style={{ pointerEvents: 'none' }} />
          )}
          {shapePreview && shapePreview.w > 1 && (
            <rect x={shapePreview.x} y={shapePreview.y}
              width={shapePreview.w} height={shapePreview.h}
              fill="rgba(59,130,246,0.08)" stroke="#3b82f6"
              strokeWidth={1.5 / transform.scale}
              strokeDasharray={`${5 / transform.scale} ${3 / transform.scale}`}
              style={{ pointerEvents: 'none' }} />
          )}
          {selection.selectedIds.length > 0 && (
            <SelectionBox pageId={activePage.id} selectedIds={selection.selectedIds} />
          )}
        </g>

        {activeTool === 'eraser' && eraserPos && (
          <circle
            cx={eraserPos.x * transform.scale + transform.x}
            cy={eraserPos.y * transform.scale + transform.y}
            r={strokeStyle.size * 3 * transform.scale}
            fill="rgba(255,255,255,0.3)" stroke="#999" strokeWidth={1}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>

      {textEditor.open && (
        <TextEditor
          element={textEditor.element} x={textEditor.x} y={textEditor.y}
          pageId={activePage.id} transform={transform}
          onClose={() => setTextEditor({ open: false })}
        />
      )}

      {mathEditor.open && mathEditor.x !== undefined && (
        <MathEditor
          x={mathEditor.x} y={mathEditor.y!}
          pageId={activePage.id} transform={transform}
          onClose={() => setMathEditor({ open: false })}
        />
      )}

      {showAutoConvert && autoConvertStrokes.length > 0 && (
        <HandwritingConvertModal
          strokes={autoConvertStrokes}
          pageId={activePage.id}
          notebookId={activePage.notebookId}
          settings={handwritingSettings}
          onClose={() => { setShowAutoConvert(false); setAutoConvertStrokes([]); }}
        />
      )}

      {ctxMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1.5 min-w-[180px] text-sm overflow-hidden"
          style={{ left: Math.min(ctxMenu.x, window.innerWidth - 200), top: Math.min(ctxMenu.y, window.innerHeight - 160) }}
          onMouseLeave={() => setCtxMenu(null)}
        >
          {selection.selectedIds.length > 0 && (
            <>
              <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                onClick={() => { deleteElements(activePage.id, selection.selectedIds); clearSelection(); setCtxMenu(null); }}>
                <span>🗑</span> Delete selected ({selection.selectedIds.length})
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                onClick={() => { clearSelection(); setCtxMenu(null); }}>
                <span>⬜</span> Deselect all
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            </>
          )}
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => { setTextEditor({ open: true, x: ctxMenu.canvasX, y: ctxMenu.canvasY }); setCtxMenu(null); }}>
            <span>📝</span> Add text here
          </button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => { setMathEditor({ open: true, x: ctxMenu.canvasX, y: ctxMenu.canvasY }); setCtxMenu(null); }}>
            <span>∑</span> Add math equation
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 flex items-center gap-2"
            onClick={() => setCtxMenu(null)}>
            <span>✕</span> Close
          </button>
        </div>
      )}
    </div>
  );
}

// ── ElementRenderer — props-based (no closure over outer scope) ────────────
interface ElemProps {
  element: CanvasElement;
  isSelected: boolean;
  isDarkMode: boolean;
  transform: { x: number; y: number; scale: number };
  pageId: string;
  updateElement: (pageId: string, id: string, updates: any) => void;
  pushHistory: (label: string) => void;
}

function ElementRenderer({ element, isSelected, isDarkMode, transform, pageId, updateElement, pushHistory }: ElemProps) {
  switch (element.type) {
    case 'stroke':
      return <StrokeRenderer element={element} isSelected={isSelected} isDarkMode={isDarkMode} />;
    case 'shape':
      return (
        <ShapeRenderer
          element={element as ShapeElement}
          isSelected={isSelected}
          transform={transform}
          pageId={pageId}
        />
      );
    case 'text':
      return <TextElementRenderer element={element} isSelected={isSelected} />;
    case 'image':
      return <ImageElementRenderer element={element} isSelected={isSelected} />;
    default:
      return null;
  }
}

function getCursor(tool: string): string {
  const map: Record<string, string> = {
    pen: 'crosshair', highlighter: 'crosshair', eraser: 'none',
    pan: 'grab', text: 'text', select: 'default',
    lasso: 'crosshair', shape: 'crosshair', image: 'copy',
  };
  return map[tool] ?? 'crosshair';
}

function hitTest(pt: Point, elements: CanvasElement[]): string | null {
  for (const el of [...elements].reverse()) {
    if (el.type === 'stroke') {
      const { x, y, width, height } = el.bounds;
      if (pt.x >= x - 10 && pt.x <= x + width + 10 && pt.y >= y - 10 && pt.y <= y + height + 10) return el.id;
    } else if ('x' in el && 'width' in el) {
      const e = el as any;
      if (pt.x >= e.x - 6 && pt.x <= e.x + e.width + 6 && pt.y >= e.y - 6 && pt.y <= e.y + e.height + 6) return el.id;
    }
  }
  return null;
}

function elementsInLasso(lasso: Point[], elements: CanvasElement[]): string[] {
  if (lasso.length < 3) return [];
  return elements.filter(el => {
    let cx = 0, cy = 0;
    if (el.type === 'stroke') {
      cx = el.bounds.x + el.bounds.width / 2;
      cy = el.bounds.y + el.bounds.height / 2;
    } else if ('x' in el) {
      const e = el as any;
      cx = e.x + (e.width ?? 0) / 2;
      cy = e.y + (e.height ?? 0) / 2;
    }
    let inside = false;
    for (let i = 0, j = lasso.length - 1; i < lasso.length; j = i++) {
      const xi = lasso[i].x, yi = lasso[i].y, xj = lasso[j].x, yj = lasso[j].y;
      if ((yi > cy) !== (yj > cy) && cx < ((xj - xi) * (cy - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }).map(el => el.id);
}
