'use client';
// src/components/canvas/ShapeRenderer.tsx

import React from 'react';
import type { ShapeElement } from '@/types';

interface Props {
  element: ShapeElement;
  isSelected: boolean;
}

export function ShapeRenderer({ element, isSelected }: Props) {
  const { x, y, width, height, shapeType, stroke, fill, strokeWidth, opacity, rotation } = element;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const transform = rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined;

  const commonProps = {
    stroke,
    fill: fill || 'none',
    strokeWidth,
    opacity,
    transform,
  };

  const selectionBox = isSelected ? (
    <rect
      x={x - 4}
      y={y - 4}
      width={width + 8}
      height={height + 8}
      fill="none"
      stroke="#3b82f6"
      strokeWidth={1.5}
      strokeDasharray="4 2"
      rx={2}
      style={{ pointerEvents: 'none' }}
    />
  ) : null;

  const renderShape = () => {
    switch (shapeType) {
      case 'rect':
        return <rect x={x} y={y} width={width} height={height} rx={2} {...commonProps} />;

      case 'circle':
        return (
          <ellipse
            cx={cx}
            cy={cy}
            rx={width / 2}
            ry={width / 2}
            {...commonProps}
          />
        );

      case 'ellipse':
        return (
          <ellipse
            cx={cx}
            cy={cy}
            rx={width / 2}
            ry={height / 2}
            {...commonProps}
          />
        );

      case 'triangle':
        return (
          <polygon
            points={`${cx},${y} ${x + width},${y + height} ${x},${y + height}`}
            {...commonProps}
          />
        );

      case 'arrow': {
        const headSize = Math.min(width, height) * 0.25;
        return (
          <g transform={transform} opacity={opacity}>
            <line
              x1={x}
              y1={cy}
              x2={x + width - headSize}
              y2={cy}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            <polygon
              points={`${x + width},${cy} ${x + width - headSize},${cy - headSize / 2} ${x + width - headSize},${cy + headSize / 2}`}
              fill={stroke}
            />
          </g>
        );
      }

      case 'line':
        return (
          <line
            x1={x}
            y1={cy}
            x2={x + width}
            y2={cy}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
            transform={transform}
          />
        );

      case 'star': {
        const points = starPoints(cx, cy, 5, width / 2, width / 4);
        return <polygon points={points} {...commonProps} />;
      }

      default:
        return null;
    }
  };

  return (
    <g>
      {renderShape()}
      {selectionBox}
    </g>
  );
}

function starPoints(cx: number, cy: number, numPoints: number, outerR: number, innerR: number): string {
  const pts: string[] = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}
