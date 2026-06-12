'use client';
// src/components/canvas/TextElementRenderer.tsx

import React from 'react';
import type { TextElement } from '@/types';

interface Props {
  element: TextElement;
  isSelected: boolean;
}

export function TextElementRenderer({ element, isSelected }: Props) {
  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={element.width || 200}
      height={element.height || 40}
      style={{ overflow: 'visible' }}
    >
      <div
        style={{
          fontSize: element.fontSize,
          fontFamily: element.fontFamily || 'inherit',
          color: element.color,
          textAlign: element.align,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          outline: isSelected ? '1.5px dashed #3b82f6' : 'none',
          padding: '2px 4px',
          minWidth: 40,
          minHeight: 20,
          boxSizing: 'border-box',
        }}
        dangerouslySetInnerHTML={{ __html: element.content }}
      />
    </foreignObject>
  );
}
