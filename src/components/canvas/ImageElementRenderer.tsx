'use client';
// src/components/canvas/ImageElementRenderer.tsx

import React from 'react';
import type { ImageElement } from '@/types';

interface Props {
  element: ImageElement;
  isSelected: boolean;
}

export function ImageElementRenderer({ element, isSelected }: Props) {
  const cx = element.x + element.width / 2;
  const cy = element.y + element.height / 2;

  return (
    <g transform={element.rotation ? `rotate(${element.rotation}, ${cx}, ${cy})` : undefined}>
      <image
        href={element.src}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        opacity={element.opacity}
        preserveAspectRatio="xMidYMid meet"
      />
      {isSelected && (
        <rect
          x={element.x - 4}
          y={element.y - 4}
          width={element.width + 8}
          height={element.height + 8}
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
