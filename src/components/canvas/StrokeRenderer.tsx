'use client';
// src/components/canvas/StrokeRenderer.tsx

import React, { useMemo } from 'react';
import { getSvgPath } from '@/lib/canvas/strokeEngine';
import type { StrokeElement } from '@/types';

interface Props {
  element: StrokeElement;
  isSelected: boolean;
  isDarkMode: boolean;
}

export function StrokeRenderer({ element, isSelected, isDarkMode }: Props) {
  const pathData = useMemo(() => {
    const rawPoints = element.points.map(([x, y, p]) => ({ x, y, pressure: p ?? 0.5 }));
    return getSvgPath(rawPoints, element.style);
  }, [element.points, element.style]);

  if (!pathData) return null;

  return (
    <g>
      <path
        d={pathData}
        fill={element.style.color}
        opacity={element.style.opacity}
        style={{ willChange: 'auto' }}
      />
      {isSelected && (
        <rect
          x={element.bounds.x - 4}
          y={element.bounds.y - 4}
          width={element.bounds.width + 8}
          height={element.bounds.height + 8}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          rx={2}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  );
}
