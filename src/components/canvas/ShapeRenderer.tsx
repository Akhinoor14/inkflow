'use client';
// src/components/canvas/ShapeRenderer.tsx — FIXED resize/move

import React, { useCallback, useRef } from 'react';
import type { ShapeElement } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  element: ShapeElement;
  isSelected: boolean;
  transform: { x: number; y: number; scale: number };
  pageId: string;
}

const H = 9; // handle size px
type HP = 'nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w';

const HANDLES: { pos: HP; hx:(x:number,w:number)=>number; hy:(y:number,h:number)=>number; cursor:string }[] = [
  { pos:'nw', hx:x=>x,       hy:y=>y,       cursor:'nw-resize' },
  { pos:'n',  hx:(x,w)=>x+w/2, hy:y=>y,     cursor:'n-resize'  },
  { pos:'ne', hx:(x,w)=>x+w, hy:y=>y,       cursor:'ne-resize' },
  { pos:'e',  hx:(x,w)=>x+w, hy:(y,h)=>y+h/2, cursor:'e-resize' },
  { pos:'se', hx:(x,w)=>x+w, hy:(y,h)=>y+h, cursor:'se-resize' },
  { pos:'s',  hx:(x,w)=>x+w/2, hy:(y,h)=>y+h, cursor:'s-resize' },
  { pos:'sw', hx:x=>x,       hy:(y,h)=>y+h, cursor:'sw-resize' },
  { pos:'w',  hx:x=>x,       hy:(y,h)=>y+h/2, cursor:'w-resize' },
];

export function ShapeRenderer({ element, isSelected, transform, pageId }: Props) {
  const { updateElement, pushHistory } = useAppStore();

  // Track incremental pointer position for correct delta
  const drag = useRef<{
    handle: HP | 'move';
    lastX: number; lastY: number;
  } | null>(null);

  const { x, y, width, height, shapeType, stroke, fill, strokeWidth, opacity, rotation } = element;
  const mcx = x + width / 2;
  const mcy = y + height / 2;
  const rotAttr = rotation ? `rotate(${rotation} ${mcx} ${mcy})` : undefined;
  const common = { stroke, fill: fill || 'none', strokeWidth: Math.max(strokeWidth ?? 1.5, 1), opacity };

  const onDown = useCallback((e: React.PointerEvent<SVGRectElement | SVGGElement>, handle: HP | 'move') => {
    e.stopPropagation();
    if (handle !== 'move') pushHistory('resize');
    drag.current = { handle, lastX: e.clientX, lastY: e.clientY };
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  }, [pushHistory]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    e.stopPropagation();
    const dx = (e.clientX - drag.current.lastX) / transform.scale;
    const dy = (e.clientY - drag.current.lastY) / transform.scale;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;

    const { handle } = drag.current;
    const cur = element; // current values from latest render
    let nx = cur.x, ny = cur.y, nw = cur.width, nh = cur.height;

    if (handle === 'move') {
      nx += dx; ny += dy;
    } else {
      if (handle.includes('e')) nw = Math.max(20, nw + dx);
      if (handle.includes('s')) nh = Math.max(20, nh + dy);
      if (handle.includes('w')) { nx += dx; nw = Math.max(20, nw - dx); }
      if (handle.includes('n')) { ny += dy; nh = Math.max(20, nh - dy); }
    }
    updateElement(pageId, element.id, { x: nx, y: ny, width: nw, height: nh });
  }, [element, pageId, transform.scale, updateElement]);

  const onUp = useCallback(() => { drag.current = null; }, []);

  const shape = (() => {
    switch (shapeType) {
      case 'rect':
        return <rect x={x} y={y} width={width} height={height} rx={4} transform={rotAttr} {...common} />;
      case 'circle':
        return <ellipse cx={mcx} cy={mcy} rx={Math.max(width,1)/2} ry={Math.max(width,1)/2} transform={rotAttr} {...common} />;
      case 'ellipse':
        return <ellipse cx={mcx} cy={mcy} rx={Math.max(width,1)/2} ry={Math.max(height,1)/2} transform={rotAttr} {...common} />;
      case 'triangle':
        return <polygon points={`${mcx},${y} ${x+width},${y+height} ${x},${y+height}`} transform={rotAttr} {...common} />;
      case 'arrow': {
        const hs = Math.min(width, height) * 0.3;
        return (
          <g transform={rotAttr} opacity={opacity}>
            <line x1={x} y1={mcy} x2={x+width-hs} y2={mcy} stroke={stroke} strokeWidth={common.strokeWidth} strokeLinecap="round" />
            <polygon points={`${x+width},${mcy} ${x+width-hs},${mcy-hs*0.5} ${x+width-hs},${mcy+hs*0.5}`} fill={stroke} />
          </g>
        );
      }
      case 'line':
        return <line x1={x} y1={mcy} x2={x+width} y2={mcy} stroke={stroke} strokeWidth={common.strokeWidth} strokeLinecap="round" opacity={opacity} transform={rotAttr} />;
      default: return null;
    }
  })();

  return (
    <g onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      {/* Transparent hit area */}
      <rect
        x={x-8} y={y-8} width={width+16} height={height+16}
        fill="transparent" stroke="none"
        style={{ cursor: isSelected ? 'move' : 'pointer' }}
        onPointerDown={e => isSelected && onDown(e as any, 'move')}
      />

      {shape}

      {isSelected && (
        <g style={{ pointerEvents: 'all' }}>
          {/* Dashed selection box */}
          <rect x={x-4} y={y-4} width={width+8} height={height+8}
            fill="rgba(59,130,246,0.04)" stroke="#3b82f6" strokeWidth={1.5}
            strokeDasharray="5 3" rx={3} style={{ pointerEvents: 'none' }} />

          {/* 8 handles */}
          {HANDLES.map(({ pos, hx, hy, cursor }) => (
            <rect
              key={pos}
              x={hx(x, width) - H/2} y={hy(y, height) - H/2}
              width={H} height={H} rx={2}
              fill="white" stroke="#3b82f6" strokeWidth={1.5}
              style={{ cursor }}
              onPointerDown={e => { e.stopPropagation(); onDown(e as any, pos); }}
            />
          ))}
        </g>
      )}
    </g>
  );
}
