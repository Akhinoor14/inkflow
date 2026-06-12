// src/lib/ocr/handwritingConversion.ts
// Handwriting → Text using Tesseract.js (offline, EN + বাংলা)

export type OCRLanguage = 'eng' | 'ben' | 'eng+ben';
export type ConversionMode = 'manual' | 'auto' | 'off';

export interface HandwritingSettings {
  conversionMode: ConversionMode;
  language: OCRLanguage;
  autoConvertDelay: number;        // ms after stroke ends
  shapeAutoConvert: boolean;       // freehand → perfect shape
  geometrySnapThreshold: number;   // 0.55–0.95
  keepOriginalStroke: boolean;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  showConfidence: boolean;
  correctionMode: boolean;         // show edit UI before insert
}

export const DEFAULT_HANDWRITING_SETTINGS: HandwritingSettings = {
  conversionMode: 'manual',
  language: 'eng+ben',
  autoConvertDelay: 1500,
  shapeAutoConvert: true,
  geometrySnapThreshold: 0.72,
  keepOriginalStroke: false,
  fontSize: 16,
  fontFamily: 'Noto Sans Bengali, sans-serif',
  textColor: '#1a1a1a',
  showConfidence: true,
  correctionMode: true,
};

let _worker: any = null;
let _workerLang = '';

async function getWorker(lang: OCRLanguage) {
  if (_worker && _workerLang === lang) return _worker;
  if (_worker) { try { await _worker.terminate(); } catch {} }
  const { createWorker } = await import('tesseract.js');
  _worker = await createWorker(lang, 1, {
    logger: () => {},
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js',
  });
  _workerLang = lang;
  return _worker;
}

export interface ConvertResult {
  text: string;
  confidence: number;
  x: number; y: number; width: number; height: number;
}

/**
 * Render strokes to canvas then OCR
 * strokes: StrokeElement[] — points: number[][] [[x,y,pressure],...]
 */
export async function convertRegionToText(
  strokes: Array<{ points: number[][]; style?: { size?: number; color?: string } }>,
  settings: HandwritingSettings,
): Promise<ConvertResult> {
  if (!strokes.length) return { text: '', confidence: 0, x: 0, y: 0, width: 200, height: 60 };

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of strokes) {
    for (const pt of s.points) {
      if (pt[0] < minX) minX = pt[0]; if (pt[1] < minY) minY = pt[1];
      if (pt[0] > maxX) maxX = pt[0]; if (pt[1] > maxY) maxY = pt[1];
    }
  }
  if (!isFinite(minX)) return { text: '', confidence: 0, x: 0, y: 0, width: 200, height: 60 };

  const PAD = 24;
  const bx = Math.max(0, minX - PAD);
  const by = Math.max(0, minY - PAD);
  const bw = maxX - minX + PAD * 2;
  const bh = maxY - minY + PAD * 2;

  // Render at 2.5× scale for better OCR accuracy
  const SCALE = 2.5;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(bw * SCALE);
  canvas.height = Math.ceil(bh * SCALE);
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each stroke in black (best OCR accuracy)
  ctx.strokeStyle = '#111111';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.lineWidth = Math.max((stroke.style?.size ?? 2) * SCALE, 2.5);
    ctx.beginPath();
    const [first, ...rest] = stroke.points;
    ctx.moveTo((first[0] - bx) * SCALE, (first[1] - by) * SCALE);
    for (const pt of rest) {
      ctx.lineTo((pt[0] - bx) * SCALE, (pt[1] - by) * SCALE);
    }
    ctx.stroke();
  }

  try {
    const worker = await getWorker(settings.language);
    const { data } = await worker.recognize(canvas);
    return {
      text: data.text.trim(),
      confidence: data.confidence,
      x: bx, y: by, width: bw, height: bh,
    };
  } catch (e) {
    console.error('[OCR]', e);
    return { text: '', confidence: 0, x: bx, y: by, width: bw, height: bh };
  }
}
