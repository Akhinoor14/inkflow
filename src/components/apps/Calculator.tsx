'use client';
// src/components/apps/Calculator.tsx
// Foylx Calculator — draggable/resizable window wrapping the fx-991EX React component
// FIXED: isMobile resize-reactive (resize listener), minimize button distinct color

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import FoylxCalc from './fx991ex/Calculator.jsx';

interface Props {
  onClose: () => void;
  initialX?: number;
  initialY?: number;
}

export function CalculatorApp({ onClose, initialX = 80, initialY = 80 }: Props) {
  const [pos, setPos]           = useState({ x: initialX, y: initialY });
  const [isMinimized, setIsMin] = useState(false);
  const [isMaximized, setIsMax] = useState(false);
  const [isDragging, setIsDrag] = useState(false);
  // FIX: isMobile as reactive state with resize listener
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 540
  );
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });

  // FIX: update isMobile on window resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 540);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // --- Drag handlers ---
  const onDragStart = (e: React.PointerEvent) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDrag(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const nx = Math.max(0, Math.min(window.innerWidth  - 320, dragStart.current.wx + e.clientX - dragStart.current.mx));
    const ny = Math.max(0, Math.min(window.innerHeight - 100, dragStart.current.wy + e.clientY - dragStart.current.my));
    setPos({ x: nx, y: ny });
  }, [isDragging]);

  const onDragEnd = () => setIsDrag(false);

  // Alt+C to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.altKey && e.key === 'c') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const windowStyle: React.CSSProperties = isMaximized || isMobile
    ? {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 60, width: '100%', height: '100dvh', borderRadius: 0,
      }
    : {
        position: 'fixed',
        left: Math.min(pos.x, Math.max(0, window.innerWidth  - 440)),
        top:  Math.min(pos.y, Math.max(0, window.innerHeight - 640)),
        zIndex: 60,
        width: 'clamp(300px, 92vw, 450px)',
      };

  const titleBarStyle: React.CSSProperties = {
    background: '#c8c2ba',
    borderBottom: '1px solid #b0aaa2',
    cursor: isDragging ? 'grabbing' : 'grab',
    padding: '5px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    userSelect: 'none',
  };

  return (
    <div
      className="flex flex-col shadow-2xl overflow-hidden"
      style={{
        ...windowStyle,
        background: '#d0c9c0',
        borderRadius: isMaximized || isMobile ? 0 : 14,
        border: '1px solid #b8b2aa',
      }}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
    >
      {/* Title bar */}
      <div style={titleBarStyle} onPointerDown={onDragStart}>
        <Calculator size={13} style={{ color: '#1a4a9a', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#3a3830', flex: 1, letterSpacing: '0.4px' }}>
          Foylx Calculator
        </span>
        <span style={{ fontSize: 9, color: '#9a9490', marginRight: 6 }}>Alt+C</span>

        {/* Window controls */}
        <div className="flex items-center gap-1.5" onPointerDown={e => e.stopPropagation()}>
          {/* FIX: minimize button shows distinct color when minimized (#888 gray vs #d4a010 yellow) */}
          <button
            onClick={() => setIsMin(v => !v)}
            className="w-3 h-3 rounded-full transition-colors"
            style={{
              background: isMinimized ? '#a09080' : '#d4a010',
              border: `1px solid ${isMinimized ? '#807060' : '#a07808'}`,
            }}
            title={isMinimized ? 'Restore' : 'Minimize'}
          />
          {!isMobile && (
            <button
              onClick={() => setIsMax(v => !v)}
              className="w-3 h-3 rounded-full transition-colors"
              style={{ background: '#22a855', border: '1px solid #188040' }}
              title={isMaximized ? 'Restore' : 'Maximize'}
            />
          )}
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full transition-colors"
            style={{ background: '#e03a2a', border: '1px solid #a82018' }}
            title="Close"
          />
        </div>
      </div>

      {/* Calculator body */}
      {!isMinimized && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '10px 6px 16px',
            background: '#d0c9c0',
          }}
          onPointerDown={e => e.stopPropagation()}
        >
          <FoylxCalc />
        </div>
      )}

      {/* Minimized pill */}
      {isMinimized && (
        <div
          onClick={() => setIsMin(false)}
          style={{
            padding: '7px 14px',
            background: '#c8c2ba',
            fontSize: 11,
            color: '#5a5850',
            cursor: 'pointer',
          }}
        >
          Foylx Calculator — click to expand
        </div>
      )}
    </div>
  );
}
