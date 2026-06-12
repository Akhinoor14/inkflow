// src/lib/ocr/tesseractOCR.ts
// Free offline OCR using Tesseract.js
// Supports English + Bangla
// MyScript iinkJS is disabled by default (requires paid license)

import type { OCRResult } from '@/types';

let worker: any = null;
let workerLang = '';

async function getWorker(lang: string = 'eng') {
  if (worker && workerLang === lang) return worker;

  // Cleanup old worker
  if (worker) await worker.terminate();

  const { createWorker } = await import('tesseract.js');
  worker = await createWorker(lang, 1, {
    logger: () => {}, // suppress logs
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js',
  });
  workerLang = lang;
  return worker;
}

/**
 * Run OCR on a canvas element or image data URL
 * lang: 'eng' | 'ben' | 'eng+ben'
 */
export async function runOCR(
  imageData: string | HTMLCanvasElement,
  lang: 'eng' | 'ben' | 'eng+ben' = 'eng'
): Promise<OCRResult> {
  const w = await getWorker(lang);

  const source = typeof imageData === 'string' ? imageData : imageData.toDataURL();

  const { data } = await w.recognize(source);

  return {
    text: data.text.trim(),
    confidence: data.confidence / 100,
    words: data.words.map((word: any) => ({
      text: word.text,
      confidence: word.confidence / 100,
      bbox: {
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
      },
    })),
  };
}

/**
 * Extract strokes into a temporary canvas and run OCR
 * Used for "convert selection to text" feature
 */
export async function ocrStrokes(
  svgPaths: string[],
  bounds: { x: number; y: number; width: number; height: number },
  lang: 'eng' | 'ben' | 'eng+ben' = 'eng'
): Promise<OCRResult> {
  const canvas = document.createElement('canvas');
  const padding = 20;
  canvas.width = bounds.width + padding * 2;
  canvas.height = bounds.height + padding * 2;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw strokes in black for best OCR accuracy
  ctx.fillStyle = '#000000';
  for (const pathData of svgPaths) {
    const path2d = new Path2D(pathData);
    ctx.save();
    ctx.translate(padding - bounds.x, padding - bounds.y);
    ctx.fill(path2d);
    ctx.restore();
  }

  return runOCR(canvas, lang);
}

/**
 * Optional: Google Vision OCR (requires API key)
 * Set NEXT_PUBLIC_GOOGLE_VISION_KEY in .env.local to enable
 * Higher accuracy for complex handwriting
 */
export async function runGoogleVisionOCR(imageBase64: string): Promise<OCRResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_VISION_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '') },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          }],
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const textAnnotations = data.responses?.[0]?.textAnnotations;
    if (!textAnnotations?.length) return null;

    return {
      text: textAnnotations[0].description,
      confidence: 0.9,
      words: textAnnotations.slice(1).map((ann: any) => ({
        text: ann.description,
        confidence: 0.9,
        bbox: {
          x: ann.boundingPoly.vertices[0].x,
          y: ann.boundingPoly.vertices[0].y,
          width: ann.boundingPoly.vertices[2].x - ann.boundingPoly.vertices[0].x,
          height: ann.boundingPoly.vertices[2].y - ann.boundingPoly.vertices[0].y,
        },
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Cleanup worker when app unmounts
 */
export async function terminateOCRWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
