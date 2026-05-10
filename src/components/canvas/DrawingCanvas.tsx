'use client';
// src/components/canvas/DrawingCanvas.tsx  (Session 3 — updated)

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
import { useImageDrop } from '@/hooks/useImageDrop';
import { nanoid } from 'nanoid';
import type { CanvasElement, TextElement, Point } from '@/types';

interface DrawingCanvasProps { className?: string; }

interface TextEditorState {
  open: boolean;
  element?: TextElement;
  x?: number;
  y?: number;
}

export function DrawingCanvas({ className }: DrawingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const activePage = useActivePage();
  const {
    activeTool, strokeStyle, highlighterStyle,
    transform, selection, isDarkMode, preferences, isRecordingAudio,
    addElement, deleteElements,
    setTransform, setSelection, clearSelection, pushHistory, zoomTo,
  } = useAppStore();

  const [livePoints, setLivePoints] = useState<RawPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
  const [isLassoing, setIsLassoing] = useState(false);
  const [eraserPos, setEraserPos] = useState<Point | null>(null);
  const [textEditor, setTextEditor] = useState<TextEditorState>({ open: false });

  const isPanning = useRef(false);
  const panStart = useRef<Point>({ x: 0, y: 0 });
  const transformStart = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);

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
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      pushHistory('stroke');
      setLivePoints([getRawPoints(e.nativeEvent, containerRef.current!, transform)]);
      setIsDrawing(true);
      return;
    }
    if (activeTool === 'eraser') { setIsDrawing(true); doErase(pt); return; }
    if (activeTool === 'lasso') {
      setIsLassoing(true); setLassoPoints([pt]); clearSelection(); return;
    }
    if (activeTool === 'select') {
      const hit = hitTest(pt, activePage?.elements ?? []);
      if (hit) {
        setSelection({ selectedIds: e.shiftKey
          ? selection.selectedIds.includes(hit)
            ? selection.selectedIds.filter((id) => id !== hit)
            : [...selection.selectedIds, hit]
          : [hit] });
      } else { clearSelection(); }
    }
  }, [activeTool, transform, activePage, selection, pushHistory, clearSelection, setSelection, getCanvasPoint, doErase]);

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
    if (isLassoing) { setLassoPoints((p) => [...p, pt]); return; }
    if (!isDrawing) return;
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setLivePoints((p) => [...p, getRawPoints(e.nativeEvent, containerRef.current!, transform)]);
    }
  }, [activeTool, isDrawing, isLassoing, transform, getCanvasPoint, setTransform, doErase]);

  const handlePointerUp = useCallback(async (e: React.PointerEvent<SVGSVGElement>) => {
    isPanning.current = false;

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
      const style = activeTool === 'highlighter' ? { ...highlighterStyle } : {
        ...strokeStyle,
        color: adjustColorForDarkMode(strokeStyle.color, isDarkMode && preferences.inkAutoAdjustDarkMode),
      };
      const rawPts = livePoints.map((p): [number, number, number] => [p.x, p.y, p.pressure]);
      const rec = recognizeShape(rawPts);

      if (rec.shape && rec.confidence >= 0.70) {
        const { x, y, width, height } = rec.boundingBox;
        addElement(activePage.id, {
          id: nanoid(), type: 'shape', shapeType: rec.shape,
          x, y, width: Math.max(width, 20), height: Math.max(height, 20),
          stroke: style.color, fill: 'transparent', strokeWidth: style.size / 2,
          opacity: style.opacity, rotation: 0,
          audioTimestamp: isRecordingAudio ? getCurrentAudioTimestamp() : undefined,
          createdAt: Date.now(), zIndex: Date.now(),
        });
      } else {
        const el = createStrokeElement(livePoints, style);
        if (isRecordingAudio) el.audioTimestamp = getCurrentAudioTimestamp();
        addElement(activePage.id, el);
      }
      setLivePoints([]);
      scheduleSave(activePage.id, activePage.notebookId);
    }
  }, [isDrawing, isLassoing, lassoPoints, activeTool, livePoints, activePage,
      strokeStyle, highlighterStyle, isDarkMode, preferences, isRecordingAudio,
      addElement, setSelection]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!activePage) return;
    const pt = getCanvasPoint(e.clientX, e.clientY);
    const textEls = activePage.elements.filter((el) => el.type === 'text') as TextElement[];
    for (const el of textEls) {
      if (pt.x >= el.x && pt.x <= el.x + el.width && pt.y >= el.y && pt.y <= el.y + el.height) {
        setTextEditor({ open: true, element: el });
        return;
      }
    }
    if (activeTool === 'select' || activeTool === 'text') {
      setTextEditor({ open: true, x: pt.x, y: pt.y });
    }
  }, [activePage, activeTool, getCanvasPoint]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect();
        zoomTo(transform.scale * (1 - e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top);
      } else {
        setTransform({ x: transform.x - e.deltaX, y: transform.y - e.deltaY });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [transform, setTransform, zoomTo]);

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
          <div className="text-6xl mb-4">📓</div>
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
    ? `M ${lassoPoints.map((p) => `${p.x},${p.y}`).join('L')} Z` : null;

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
        onPointerLeave={() => setEraserPos(null)}
        onDoubleClick={handleDoubleClick}
        style={{ touchAction: 'none' }}
      >
        <g transform={svgT}>
          <CanvasBackground background={activePage.background} isDarkMode={isDarkMode} />
          {activePage.elements.map((el) => (
            <ElementRenderer key={el.id} element={el}
              isSelected={selection.selectedIds.includes(el.id)} isDarkMode={isDarkMode} />
          ))}
          {livePath && <path d={livePath} fill={liveStyle.color} opacity={liveStyle.opacity} style={{ pointerEvents: 'none' }} />}
          {lassoD && (
            <path d={lassoD} fill="rgba(59,130,246,0.07)"
              stroke="#3b82f6" strokeWidth={1 / transform.scale}
              strokeDasharray={`${4 / transform.scale} ${2 / transform.scale}`}
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
    </div>
  );
}

function ElementRenderer({ element, isSelected, isDarkMode }: {
  element: CanvasElement; isSelected: boolean; isDarkMode: boolean;
}) {
  switch (element.type) {
    case 'stroke': return <StrokeRenderer element={element} isSelected={isSelected} isDarkMode={isDarkMode} />;
    case 'shape':  return <ShapeRenderer element={element} isSelected={isSelected} />;
    case 'text':   return <TextElementRenderer element={element} isSelected={isSelected} />;
    case 'image':  return <ImageElementRenderer element={element} isSelected={isSelected} />;
    default: return null;
  }
}

function getCursor(tool: string): string {
  return ({ pen: 'crosshair', highlighter: 'crosshair', eraser: 'none',
    pan: 'grab', text: 'text', select: 'default', lasso: 'crosshair',
    shape: 'crosshair', image: 'copy' } as any)[tool] ?? 'crosshair';
}

function hitTest(pt: Point, elements: CanvasElement[]): string | null {
  for (const el of [...elements].sort((a, b) => b.zIndex - a.zIndex)) {
    if (el.type === 'stroke') {
      const { x, y, width, height } = el.bounds;
      if (pt.x >= x - 8 && pt.x <= x + width + 8 && pt.y >= y - 8 && pt.y <= y + height + 8) return el.id;
    } else if ('x' in el && 'width' in el) {
      const e = el as any;
      if (pt.x >= e.x - 4 && pt.x <= e.x + e.width + 4 && pt.y >= e.y - 4 && pt.y <= e.y + e.height + 4) return el.id;
    }
  }
  return null;
}

function elementsInLasso(lasso: Point[], elements: CanvasElement[]): string[] {
  if (lasso.length < 3) return [];
  return elements.filter((el) => {
    let cx = 0, cy = 0;
    if (el.type === 'stroke') { cx = el.bounds.x + el.bounds.width / 2; cy = el.bounds.y + el.bounds.height / 2; }
    else if ('x' in el) { cx = (el as any).x + ((el as any).width ?? 0) / 2; cy = (el as any).y + ((el as any).height ?? 0) / 2; }
    let inside = false;
    for (let i = 0, j = lasso.length - 1; i < lasso.length; j = i++) {
      const xi = lasso[i].x, yi = lasso[i].y, xj = lasso[j].x, yj = lasso[j].y;
      if (((yi > cy) !== (yj > cy)) && cx < ((xj - xi) * (cy - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }).map((el) => el.id);
}
