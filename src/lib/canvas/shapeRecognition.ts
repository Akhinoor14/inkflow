// src/lib/canvas/shapeRecognition.ts
// Offline shape recognition using $1 Unistroke Recognizer algorithm
// Free alternative to Azure Ink Recognizer

import type { Point, ShapeType, ShapeRecognitionResult, BoundingBox } from '@/types';

// ──────────────────────────────────────────────
// $1 Unistroke Recognizer (simplified implementation)
// ──────────────────────────────────────────────

const NUM_POINTS = 64;
const SQUARE_SIZE = 250;
const ORIGIN: Point = { x: 0, y: 0 };
const DIAGONAL = Math.sqrt(SQUARE_SIZE * SQUARE_SIZE + SQUARE_SIZE * SQUARE_SIZE);
const HALF_DIAGONAL = 0.5 * DIAGONAL;
const ANGLE_RANGE = deg2rad(45);
const ANGLE_PRECISION = deg2rad(2);
const PHI = 0.5 * (-1 + Math.sqrt(5)); // golden ratio

function deg2rad(d: number) { return d * (Math.PI / 180); }

interface Unistroke {
  name: ShapeType;
  points: Point[];
}

// Template shapes for recognition
const TEMPLATES: Unistroke[] = [
  // Rectangle — draw 4 corners clockwise
  {
    name: 'rect',
    points: buildRectTemplate(),
  },
  // Circle — approximate with many points
  {
    name: 'circle',
    points: buildCircleTemplate(),
  },
  // Triangle
  {
    name: 'triangle',
    points: buildTriangleTemplate(),
  },
  // Arrow
  {
    name: 'arrow',
    points: buildArrowTemplate(),
  },
  // Line
  {
    name: 'line',
    points: [
      { x: 0, y: 125 },
      { x: 250, y: 125 },
    ],
  },
];

function buildRectTemplate(): Point[] {
  const pts: Point[] = [];
  for (let x = 0; x <= 250; x += 10) pts.push({ x, y: 0 });
  for (let y = 0; y <= 250; y += 10) pts.push({ x: 250, y });
  for (let x = 250; x >= 0; x -= 10) pts.push({ x, y: 250 });
  for (let y = 250; y >= 0; y -= 10) pts.push({ x: 0, y });
  return pts;
}

function buildCircleTemplate(): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * 2 * Math.PI;
    pts.push({ x: 125 + 100 * Math.cos(angle), y: 125 + 100 * Math.sin(angle) });
  }
  return pts;
}

function buildTriangleTemplate(): Point[] {
  return [
    { x: 125, y: 0 },
    { x: 250, y: 250 },
    { x: 0, y: 250 },
    { x: 125, y: 0 },
  ];
}

function buildArrowTemplate(): Point[] {
  return [
    { x: 0, y: 125 },
    { x: 250, y: 125 },
    { x: 180, y: 60 },
    { x: 250, y: 125 },
    { x: 180, y: 190 },
  ];
}

// Process templates
const processedTemplates = TEMPLATES.map((t) => ({
  name: t.name,
  points: indicativeAngle(resample(t.points, NUM_POINTS)),
}));

function resample(points: Point[], n: number): Point[] {
  let I = pathLength(points) / (n - 1);
  let D = 0;
  const newPoints: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const d = distance(points[i - 1], points[i]);
    if (D + d >= I) {
      const qx = points[i - 1].x + ((I - D) / d) * (points[i].x - points[i - 1].x);
      const qy = points[i - 1].y + ((I - D) / d) * (points[i].y - points[i - 1].y);
      const q: Point = { x: qx, y: qy };
      newPoints.push(q);
      points = [q, ...points.slice(i)];
      i = 0;
      D = 0;
    } else {
      D += d;
    }
  }
  while (newPoints.length < n) newPoints.push(points[points.length - 1]);
  return newPoints;
}

function indicativeAngle(points: Point[]): Point[] {
  const c = centroid(points);
  const radians = Math.atan2(c.y - points[0].y, c.x - points[0].x);
  return rotateBy(points, -radians);
}

function rotateBy(points: Point[], radians: number): Point[] {
  const c = centroid(points);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map((p) => ({
    x: (p.x - c.x) * cos - (p.y - c.y) * sin + c.x,
    y: (p.x - c.x) * sin + (p.y - c.y) * cos + c.y,
  }));
}

function scaleTo(points: Point[], size: number): Point[] {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const scale = size / Math.max(maxX - minX, maxY - minY);
  return points.map((p) => ({ x: p.x * scale, y: p.y * scale }));
}

function translateTo(points: Point[], pt: Point): Point[] {
  const c = centroid(points);
  return points.map((p) => ({ x: p.x + pt.x - c.x, y: p.y + pt.y - c.y }));
}

function centroid(points: Point[]): Point {
  let x = 0, y = 0;
  for (const p of points) { x += p.x; y += p.y; }
  return { x: x / points.length, y: y / points.length };
}

function pathLength(points: Point[]): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) d += distance(points[i - 1], points[i]);
  return d;
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function pathDistance(pts1: Point[], pts2: Point[]): number {
  let d = 0;
  for (let i = 0; i < pts1.length; i++) d += distance(pts1[i], pts2[i]);
  return d / pts1.length;
}

function distanceAtBestAngle(points: Point[], T: Point[], a: number, b: number, threshold: number): number {
  let x1 = PHI * a + (1 - PHI) * b;
  let f1 = pathDistance(rotateBy(points, x1), T);
  let x2 = (1 - PHI) * a + PHI * b;
  let f2 = pathDistance(rotateBy(points, x2), T);
  while (Math.abs(b - a) > threshold) {
    if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = PHI * a + (1 - PHI) * b; f1 = pathDistance(rotateBy(points, x1), T); }
    else { a = x1; x1 = x2; f1 = f2; x2 = (1 - PHI) * a + PHI * b; f2 = pathDistance(rotateBy(points, x2), T); }
  }
  return Math.min(f1, f2);
}

function recognize(points: Point[]): { name: ShapeType; score: number } | null {
  const resampled = resample(points, NUM_POINTS);
  const rotated = indicativeAngle(resampled);
  const scaled = scaleTo(rotated, SQUARE_SIZE);
  const translated = translateTo(scaled, ORIGIN);

  let bestScore = -Infinity;
  let bestTemplate: ShapeType | null = null;

  for (const t of processedTemplates) {
    const d = distanceAtBestAngle(translated, t.points, -ANGLE_RANGE, ANGLE_RANGE, ANGLE_PRECISION);
    const score = 1 - d / HALF_DIAGONAL;
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = t.name;
    }
  }

  return bestTemplate ? { name: bestTemplate, score: bestScore } : null;
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.70; // 70% — only snap if confident

export function recognizeShape(
  rawPoints: Array<[number, number, number]>,
): ShapeRecognitionResult {
  const points: Point[] = rawPoints.map(([x, y]) => ({ x, y }));

  if (points.length < 5) {
    return { shape: null, confidence: 0, boundingBox: getBounds(points) };
  }

  const result = recognize(points);

  if (!result || result.score < CONFIDENCE_THRESHOLD) {
    return { shape: null, confidence: result?.score ?? 0, boundingBox: getBounds(points) };
  }

  return {
    shape: result.name,
    confidence: result.score,
    boundingBox: getBounds(points),
  };
}

function getBounds(points: Point[]): BoundingBox {
  if (!points.length) return { x: 0, y: 0, width: 10, height: 10 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Optional: Azure Ink Recognizer (disabled by default, requires API key)
// Set NEXT_PUBLIC_AZURE_INK_KEY in .env.local to enable
export async function recognizeShapeCloud(
  strokes: Array<{ points: Array<[number, number]> }>
): Promise<ShapeRecognitionResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_AZURE_INK_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      'https://api.cognitive.microsoft.com/inkrecognizer/v1.0-preview/recognize',
      {
        method: 'PUT',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationType: 'drawing',
          strokes: strokes.map((s, i) => ({
            id: i,
            points: s.points.map(([x, y]) => ({ x, y })),
          })),
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();

    // Parse Azure response
    const drawing = data.recognitionUnits?.find((u: any) => u.category === 'inkDrawing');
    if (!drawing) return null;

    const shapeMap: Record<string, ShapeType> = {
      rectangle: 'rect',
      circle: 'circle',
      ellipse: 'ellipse',
      triangle: 'triangle',
      'drawing': 'arrow',
    };

    const shape = shapeMap[drawing.recognizedShape?.toLowerCase()] ?? null;
    return shape ? { shape, confidence: drawing.confidence ?? 0.9, boundingBox: getBounds([]) } : null;
  } catch {
    return null;
  }
}
