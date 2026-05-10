'use client';
// src/components/apps/Calculator.tsx
// Wraps the real fx-991EX ClassWiz calculator in a draggable InkFlow window
// The actual calculator code lives in ./fx991ex/

import React, { useRef, useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { X, Minus, Maximize2, Minimize2, Calculator } from 'lucide-react';

// Lazy-load the heavy calculator component
const FX991EX = lazy(() =>
  import('./fx991ex/Calculator.jsx' as any).then((m) => ({ default: m.default }))
);

interface Props {
  onClose: () => void;
  initialX?: number;
  initialY?: number;
}

export function CalculatorApp({ onClose, initialX = 80, initialY = 100 }: Props) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });

  const onDragStart = (e: React.PointerEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos({
      x: Math.max(0, dragStart.current.wx + e.clientX - dragStart.current.mx),
      y: Math.max(0, dragStart.current.wy + e.clientY - dragStart.current.my),
    });
  }, [isDragging]);

  const onDragEnd = () => setIsDragging(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      // Only close if Alt+C or Escape AND not inside calculator input
      if (e.altKey && e.key === 'c') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const windowStyle: React.CSSProperties = isMaximized
    ? { position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, zIndex: 60, borderRadius: 0 }
    : { position: 'fixed', left: pos.x, top: pos.y, zIndex: 60 };

  return (
    <div
      className="flex flex-col bg-transparent rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
      style={windowStyle}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/95 backdrop-blur border-b border-gray-700 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
        onPointerDown={onDragStart}
      >
        <Calculator size={13} className="text-blue-400 flex-shrink-0" />
        <span className="text-xs font-medium text-gray-300 flex-1">fx-991EX ClassWiz</span>
        <span className="text-[10px] text-gray-600 mr-1">Alt+C to toggle</span>

        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          {/* macOS-style controls */}
          <button
            onClick={() => setIsMinimized((v) => !v)}
            className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors"
            title="Minimize"
          />
          <button
            onClick={() => setIsMaximized((v) => !v)}
            className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-300 transition-colors"
            title="Maximize"
          />
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-300 transition-colors"
            title="Close"
          />
        </div>
      </div>

      {/* Calculator body */}
      {!isMinimized && (
        <div
          className="overflow-auto"
          style={{
            maxHeight: isMaximized ? 'calc(100vh - 80px)' : '90vh',
            background: '#111',
          }}
          // Prevent canvas pointer events going through
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Suspense fallback={
            <div className="flex items-center justify-center w-[360px] h-[600px] bg-gray-900">
              <div className="text-center text-gray-400">
                <div className="text-2xl mb-2">🧮</div>
                <p className="text-sm">Loading calculator...</p>
              </div>
            </div>
          }>
            {/* Inject calculator CSS vars into this scope */}
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;700&display=swap');
            `}</style>
            <FX991EX />
          </Suspense>
        </div>
      )}

      {/* Minimized pill */}
      {isMinimized && (
        <div
          className="px-4 py-2 bg-gray-900/95 text-xs text-gray-400 cursor-pointer hover:bg-gray-800"
          onClick={() => setIsMinimized(false)}
        >
          fx-991EX — click to expand
        </div>
      )}
    </div>
  );
}
