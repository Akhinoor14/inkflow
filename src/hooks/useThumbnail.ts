// src/hooks/useThumbnail.ts
// Generate small thumbnail previews for pages (for sidebar)

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { updatePageThumbnail } from '@/lib/storage/db';
import { getSvgPath } from '@/lib/canvas/strokeEngine';

const THUMB_W = 160;
const THUMB_H = 120;
const THUMB_SCALE = 0.067; // approx ratio for A4

export function useThumbnailGenerator(pageId: string | null) {
  const pages = useAppStore((s) => s.pages);

  const generate = useCallback(async () => {
    if (!pageId) return;
    const page = pages[pageId];
    if (!page) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = THUMB_W;
      canvas.height = THUMB_H;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = page.background.color;
      ctx.fillRect(0, 0, THUMB_W, THUMB_H);

      // Draw lines for lined background
      if (page.background.type === 'lined') {
        ctx.strokeStyle = page.background.lineColor ?? '#e5e5e0';
        ctx.lineWidth = 0.5;
        const spacing = (page.background.lineSpacing ?? 32) * THUMB_SCALE;
        for (let y = spacing; y < THUMB_H; y += spacing) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(THUMB_W, y); ctx.stroke();
        }
      } else if (page.background.type === 'grid') {
        ctx.strokeStyle = page.background.lineColor ?? '#e5e5e0';
        ctx.lineWidth = 0.5;
        const spacing = (page.background.lineSpacing ?? 32) * THUMB_SCALE;
        for (let y = spacing; y < THUMB_H; y += spacing) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(THUMB_W, y); ctx.stroke();
        }
        for (let x = spacing; x < THUMB_W; x += spacing) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, THUMB_H); ctx.stroke();
        }
      }

      // Draw strokes (scaled down)
      for (const el of page.elements) {
        if (el.type !== 'stroke') continue;
        const rawPts = el.points.map(([x, y, p]) => ({
          x: x * THUMB_SCALE,
          y: y * THUMB_SCALE,
          pressure: p ?? 0.5,
        }));
        const path2d = new Path2D(getSvgPath(rawPts, el.style));
        ctx.fillStyle = el.style.color;
        ctx.globalAlpha = el.style.opacity;
        ctx.fill(path2d);
        ctx.globalAlpha = 1;
      }

      // Draw shapes
      for (const el of page.elements) {
        if (el.type !== 'shape') continue;
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = el.strokeWidth * THUMB_SCALE;
        ctx.globalAlpha = el.opacity;
        const x = el.x * THUMB_SCALE;
        const y = el.y * THUMB_SCALE;
        const w = el.width * THUMB_SCALE;
        const h = el.height * THUMB_SCALE;
        ctx.beginPath();
        if (el.shapeType === 'rect') ctx.rect(x, y, w, h);
        else if (el.shapeType === 'circle' || el.shapeType === 'ellipse') {
          ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      await updatePageThumbnail(pageId, dataUrl);
      useAppStore.getState().updatePage(pageId, { thumbnail: dataUrl });
    } catch (e) {
      // Thumbnail generation is non-critical
      console.warn('[Thumbnail] Failed to generate', e);
    }
  }, [pageId, pages]);

  // Generate thumbnail when page is inactive (500ms after last change)
  useEffect(() => {
    const timer = setTimeout(generate, 500);
    return () => clearTimeout(timer);
  }, [generate]);
}
