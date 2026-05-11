'use client';
// src/components/apps/Calculator.tsx
// Uses calculator.html via iframe — full engineering calculator

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X, Maximize2, Minimize2, Calculator } from 'lucide-react';

interface Props {
  onClose: () => void;
  initialX?: number;
  initialY?: number;
}

export function CalculatorApp({ onClose, initialX = 80, initialY = 80 }: Props) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });
  const frameRef = useRef<HTMLIFrameElement>(null);

  const onDragStart = (e: React.PointerEvent) => {
    if (isMaximized) return;
    // Don't drag if clicking the buttons
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const nx = Math.max(0, Math.min(window.innerWidth - 380, dragStart.current.wx + e.clientX - dragStart.current.mx));
    const ny = Math.max(0, Math.min(window.innerHeight - 100, dragStart.current.wy + e.clientY - dragStart.current.my));
    setPos({ x: nx, y: ny });
  }, [isDragging]);

  const onDragEnd = () => setIsDragging(false);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.altKey && e.key === 'c') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const windowStyle: React.CSSProperties = isMaximized
    ? { position: 'fixed', top: 48, left: 0, right: 0, bottom: 0, zIndex: 60, width: '100%', height: 'calc(100vh - 48px)', borderRadius: 0 }
    : {
        position: 'fixed',
        left: Math.min(pos.x, Math.max(0, window.innerWidth - 420)),
        top: Math.min(pos.y, Math.max(0, window.innerHeight - 600)),
        zIndex: 60,
        width: 'clamp(340px, 90vw, 480px)',
      };

  return (
    <div
      className="flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{ ...windowStyle, background: '#0c0e14' }}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
    >
      {/* Title bar — draggable */}
      <div
        className="flex items-center gap-2 px-3 py-2 select-none flex-shrink-0"
        style={{ background: '#13161e', borderBottom: '1px solid #252d3d', cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={onDragStart}
      >
        <Calculator size={13} style={{ color: '#f5a623', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#8892a8', flex: 1, letterSpacing: '0.5px' }}>
          Engineering Calculator
        </span>
        <span style={{ fontSize: 10, color: '#3d4a60', marginRight: 6 }}>Alt+C</span>

        {/* Window controls */}
        <div className="flex items-center gap-1.5" onPointerDown={e => e.stopPropagation()}>
          <button onClick={() => setIsMinimized(v => !v)}
            className="w-3 h-3 rounded-full transition-colors"
            style={{ background: isMinimized ? '#fbd75b' : '#e5c30b' }}
            title="Minimize" />
          <button onClick={() => setIsMaximized(v => !v)}
            className="w-3 h-3 rounded-full transition-colors"
            style={{ background: '#3ddc84' }}
            title="Maximize" />
          <button onClick={onClose}
            className="w-3 h-3 rounded-full transition-colors"
            style={{ background: '#ff5c5c' }}
            title="Close" />
        </div>
      </div>

      {/* Calculator iframe */}
      {!isMinimized && (
        <div style={{ flex: 1, minHeight: 0 }} onPointerDown={e => e.stopPropagation()}>
          <iframe
            ref={frameRef}
            src="/calculator.html"
            title="Engineering Calculator"
            style={{
              width: '100%',
              height: isMaximized ? 'calc(100vh - 96px)' : 580,
              border: 'none',
              display: 'block',
              background: '#0c0e14',
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      {/* Minimized pill */}
      {isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          style={{ padding: '8px 16px', background: '#13161e', fontSize: 12, color: '#8892a8', cursor: 'pointer' }}
          className="hover:brightness-110"
        >
          Engineering Calculator — click to expand
        </div>
      )}
    </div>
  );
}
