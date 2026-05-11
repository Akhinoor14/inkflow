'use client';
// src/components/canvas/SelectionBox.tsx

import React, { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  pageId: string;
  selectedIds: string[];
}

export function SelectionBox({ pageId, selectedIds }: Props) {
  const pages = useAppStore((s) => s.pages);
  const page = pages[pageId];

  const bounds = useMemo(() => {
    if (!page || selectedIds.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const el of page.elements) {
      if (!selectedIds.includes(el.id)) continue;
      if (el.type === 'stroke') {
        minX = Math.min(minX, el.bounds.x);
        minY = Math.min(minY, el.bounds.y);
        maxX = Math.max(maxX, el.bounds.x + el.bounds.width);
        maxY = Math.max(maxY, el.bounds.y + el.bounds.height);
      } else if ('x' in el && 'width' in el) {
        const e = el as any;
        minX = Math.min(minX, e.x);
        minY = Math.min(minY, e.y);
        maxX = Math.max(maxX, e.x + e.width);
        maxY = Math.max(maxY, e.y + e.height);
      }
    }

    if (!isFinite(minX)) return null;
    return { x: minX - 8, y: minY - 8, width: maxX - minX + 16, height: maxY - minY + 16 };
  }, [page, selectedIds]);

  if (!bounds) return null;

  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        fill="rgba(59,130,246,0.05)"
        stroke="#3b82f6"
        strokeWidth={1.5}
        rx={3}
      />
      {/* Corner handles */}
      {[
        [bounds.x, bounds.y],
        [bounds.x + bounds.width, bounds.y],
        [bounds.x, bounds.y + bounds.height],
        [bounds.x + bounds.width, bounds.y + bounds.height],
      ].map(([x, y], i) => (
        <rect key={i} x={x - 4} y={y - 4} width={8} height={8} fill="white" stroke="#3b82f6" strokeWidth={1.5} rx={1} />
      ))}
    </g>
  );
}
