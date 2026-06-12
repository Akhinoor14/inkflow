'use client';
// src/components/canvas/CanvasBackground.tsx

import React from 'react';
import type { PageBackground } from '@/types';

interface Props {
  background: PageBackground;
  isDarkMode: boolean;
}

const CANVAS_W = 2400;
const CANVAS_H = 3200;

export function CanvasBackground({ background, isDarkMode }: Props) {
  const bgColor = isDarkMode
    ? background.type === 'blank' ? '#1a1a1e' : '#1e1e24'
    : background.color;

  const lineColor = isDarkMode
    ? background.lineColor?.replace('#e5e5e0', '#2e2e36') ?? '#2e2e36'
    : background.lineColor ?? '#e5e5e0';

  const spacing = background.lineSpacing ?? 32;

  return (
    <g>
      {/* Background fill */}
      <rect x={-10000} y={-10000} width={30000} height={30000} fill={bgColor} />

      {/* Pattern */}
      {background.type === 'lined' && (
        <g stroke={lineColor} strokeWidth={0.8} opacity={0.8}>
          {Array.from({ length: Math.ceil(CANVAS_H / spacing) + 20 }).map((_, i) => (
            <line
              key={i}
              x1={-10000}
              y1={i * spacing - 200}
              x2={CANVAS_W + 10000}
              y2={i * spacing - 200}
            />
          ))}
        </g>
      )}

      {background.type === 'grid' && (
        <g stroke={lineColor} strokeWidth={0.8} opacity={0.8}>
          {/* Horizontal */}
          {Array.from({ length: Math.ceil(CANVAS_H / spacing) + 20 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={-10000}
              y1={i * spacing - 200}
              x2={CANVAS_W + 10000}
              y2={i * spacing - 200}
            />
          ))}
          {/* Vertical */}
          {Array.from({ length: Math.ceil(CANVAS_W / spacing) + 20 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * spacing - 200}
              y1={-10000}
              x2={i * spacing - 200}
              y2={CANVAS_H + 10000}
            />
          ))}
        </g>
      )}

      {background.type === 'dotted' && (
        <g fill={lineColor} opacity={0.9}>
          {Array.from({ length: Math.ceil(CANVAS_H / spacing) + 20 }).map((_, row) =>
            Array.from({ length: Math.ceil(CANVAS_W / spacing) + 20 }).map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * spacing - 200}
                cy={row * spacing - 200}
                r={1.2}
              />
            ))
          )}
        </g>
      )}

      {background.type === 'isometric' && (
        <g stroke={lineColor} strokeWidth={0.8} opacity={0.7}>
          {/* 60° lines */}
          {Array.from({ length: 80 }).map((_, i) => (
            <React.Fragment key={i}>
              <line
                x1={i * spacing - 2000}
                y1={-2000}
                x2={i * spacing + 2000}
                y2={6000}
              />
              <line
                x1={i * spacing - 2000}
                y1={-2000}
                x2={i * spacing - 6000}
                y2={6000}
              />
            </React.Fragment>
          ))}
          {/* Horizontal */}
          {Array.from({ length: 80 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={-2000}
              y1={i * spacing * 0.866}
              x2={6000}
              y2={i * spacing * 0.866}
            />
          ))}
        </g>
      )}

      {background.type === 'music' && (
        <g stroke={lineColor} strokeWidth={0.8} opacity={0.8}>
          {Array.from({ length: 30 }).map((_, staff) =>
            Array.from({ length: 5 }).map((_, line) => (
              <line
                key={`${staff}-${line}`}
                x1={0}
                y1={staff * spacing * 7 + line * 8}
                x2={CANVAS_W}
                y2={staff * spacing * 7 + line * 8}
              />
            ))
          )}
        </g>
      )}
    </g>
  );
}
