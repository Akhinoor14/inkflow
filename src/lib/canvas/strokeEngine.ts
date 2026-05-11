// src/lib/canvas/strokeEngine.ts
// Core stroke engine using perfect-freehand

import { getStroke } from 'perfect-freehand';
import type { StrokeStyle, Point, BoundingBox, StrokeElement } from '@/types';
import { nanoid } from 'nanoid';

export interface RawPoint {
  x: number;
  y: number;
  pressure: number;
}

/**
 * Convert raw pointer events to perfect-freehand stroke path
 */
export function getRawPoints(e: PointerEvent, canvasEl: HTMLElement, transform: { x: number; y: number; scale: number }): RawPoint {
  const rect = canvasEl.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - transform.x) / transform.scale,
    y: (e.clientY - rect.top - transform.y) / transform.scale,
    pressure: e.pressure > 0 ? e.pressure : 0.5,
  };
}

/**
 * Get SVG path data from an array of points using perfect-freehand
 */
export function getSvgPath(points: RawPoint[], style: StrokeStyle): string {
  const stroke = getStroke(
    points.map((p) => [p.x, p.y, p.pressure]),
    {
      size: style.size,
      thinning: style.thinning,
      smoothing: style.smoothing,
      streamline: style.streamline,
      simulatePressure: style.simulatePressure,
      last: true,
    }
  );

  return getSvgPathFromStroke(stroke);
}

/**
 * Convert stroke outline to SVG path data
 */
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );
  d.push('Z');
  return d.join(' ');
}

/**
 * Apply Chaikin's algorithm for additional smoothing
 */
export function chaikinSmooth(points: Point[], iterations = 2): Point[] {
  let pts = points;
  for (let i = 0; i < iterations; i++) {
    const smoothed: Point[] = [];
    for (let j = 0; j < pts.length - 1; j++) {
      const p0 = pts[j];
      const p1 = pts[j + 1];
      smoothed.push(
        { x: 0.75 * p0.x + 0.25 * p1.x, y: 0.75 * p0.y + 0.25 * p1.y },
        { x: 0.25 * p0.x + 0.75 * p1.x, y: 0.25 * p0.y + 0.75 * p1.y }
      );
    }
    pts = smoothed;
  }
  return pts;
}

/**
 * Douglas-Peucker algorithm for stroke simplification (reduces point count)
 */
export function douglasPeucker(points: Point[], epsilon: number = 2): Point[] {
  if (points.length <= 2) return points;

  const dmax = { val: 0, idx: 0 };
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax.val) {
      dmax.val = d;
      dmax.idx = i;
    }
  }

  if (dmax.val > epsilon) {
    const left = douglasPeucker(points.slice(0, dmax.idx + 1), epsilon);
    const right = douglasPeucker(points.slice(dmax.idx), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[end]];
}

function perpendicularDistance(p: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return Math.sqrt((p.x - p1.x) ** 2 + (p.y - p1.y) ** 2);
  return Math.abs(dy * p.x - dx * p.y + p2.x * p1.y - p2.y * p1.x) / len;
}

/**
 * Calculate bounding box of a stroke
 */
export function getStrokeBounds(points: RawPoint[]): BoundingBox {
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Create a StrokeElement from raw points
 */
export function createStrokeElement(points: RawPoint[], style: StrokeStyle): StrokeElement {
  const bounds = getStrokeBounds(points);
  return {
    id: nanoid(),
    type: 'stroke',
    points: points.map((p) => [p.x, p.y, p.pressure]),
    style,
    bounds,
    createdAt: Date.now(),
    zIndex: Date.now(),
  };
}

/**
 * Adjust ink color for dark mode
 * Gemini's idea: auto-adjust colors so dark mode doesn't hurt eyes
 */
export function adjustColorForDarkMode(color: string, isDarkMode: boolean): string {
  if (!isDarkMode) return color;

  // Dark colors → light equivalent for dark canvas
  const darkColorMap: Record<string, string> = {
    '#000000': '#e8e8e8',
    '#1a1a1a': '#e0e0e0',
    '#333333': '#cccccc',
    '#0000ff': '#6699ff',
    '#ff0000': '#ff6666',
    '#008000': '#66bb66',
  };

  return darkColorMap[color.toLowerCase()] ?? color;
}

/**
 * Check if a point is on/near a stroke (for eraser hit testing)
 */
export function isPointNearStroke(
  point: Point,
  strokePoints: number[][],
  tolerance: number = 10
): boolean {
  for (let i = 0; i < strokePoints.length - 1; i++) {
    const [x1, y1] = strokePoints[i];
    const [x2, y2] = strokePoints[i + 1];
    const dist = pointToSegmentDistance(point, { x: x1, y: y1 }, { x: x2, y: y2 });
    if (dist <= tolerance) return true;
  }
  return false;
}

function pointToSegmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt((p.x - (a.x + t * dx)) ** 2 + (p.y - (a.y + t * dy)) ** 2);
}

/**
 * Segment a stroke — remove points near eraser position
 * Returns remaining stroke segments as separate strokes
 */
export function eraseFromStroke(
  strokePoints: number[][],
  eraserCenter: Point,
  eraserRadius: number
): number[][][] {
  const segments: number[][][] = [];
  let current: number[][] = [];

  for (const point of strokePoints) {
    const [x, y] = point;
    const dist = Math.sqrt((x - eraserCenter.x) ** 2 + (y - eraserCenter.y) ** 2);

    if (dist <= eraserRadius) {
      // This point is erased
      if (current.length > 1) segments.push(current);
      current = [];
    } else {
      current.push(point);
    }
  }

  if (current.length > 1) segments.push(current);
  return segments;
}
