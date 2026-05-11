// src/lib/export/exportEngine.ts
// PDF and DOCX export using jsPDF + html2canvas + docx.js

import type { Page, ExportOptions } from '@/types';
import { getSvgPath } from '@/lib/canvas/strokeEngine';

/**
 * Export a page as PDF
 * Uses html2canvas to rasterize the SVG canvas, then jsPDF
 */
export async function exportToPDF(
  svgElement: SVGSVGElement,
  pages: Page[],
  options: ExportOptions
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const A4_W = 595.28;
  const A4_H = 841.89;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i > 0) pdf.addPage();

    try {
      // Build an off-screen SVG for this page
      const offSvg = buildPageSVG(page, A4_W, A4_H);
      document.body.appendChild(offSvg);

      const canvas = await html2canvas(offSvg as unknown as HTMLElement, {
        scale: (options.quality ?? 2),
        useCORS: true,
        backgroundColor: page.background.color,
        width: A4_W,
        height: A4_H,
        logging: false,
      });

      document.body.removeChild(offSvg);

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W, A4_H);
    } catch (err) {
      console.error('[Export] Page render failed', err);
    }
  }

  const filename = options.filename ?? 'foylx-export';
  pdf.save(`${filename}.pdf`);
}

/**
 * Export page as DOCX
 * Text elements → paragraphs, drawings → embedded PNG
 */
export async function exportToDOCX(
  pages: Page[],
  options: ExportOptions
): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel,
  } = await import('docx');

  const children: any[] = [];

  for (const page of pages) {
    // Page title
    children.push(
      new Paragraph({
        text: page.title,
        heading: HeadingLevel.HEADING_1,
      })
    );

    // Extract text elements
    const textEls = page.elements.filter((e) => e.type === 'text');
    for (const el of textEls) {
      const text = el.type === 'text' ? stripHtml(el.content) : '';
      if (text.trim()) {
        children.push(new Paragraph({ children: [new TextRun(text)] }));
      }
    }

    // Extract stroke OCR text
    const strokeEls = page.elements.filter((e) => e.type === 'stroke' && e.recognizedText);
    if (strokeEls.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '— Handwriting —', italics: true, color: '888888' })],
      }));
      for (const el of strokeEls) {
        if (el.type === 'stroke' && el.recognizedText) {
          children.push(new Paragraph({ children: [new TextRun(el.recognizedText)] }));
        }
      }
    }

    // Render drawing as image
    const hasDrawing = page.elements.some((e) => e.type === 'stroke' || e.type === 'shape');
    if (hasDrawing) {
      try {
        const imgData = await renderPageToDataURL(page);
        const base64 = imgData.split(',')[1];
        const buf = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: buf,
                transformation: { width: 480, height: 340 },
              }),
            ],
          })
        );
      } catch (e) {
        console.warn('[DOCX] Could not embed drawing', e);
      }
    }

    // Page break between pages
    children.push(new Paragraph({ pageBreakBefore: true }));
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${options.filename ?? 'foylx-export'}.docx`);
}

/**
 * Export current canvas view as PNG
 */
export async function exportToPNG(
  svgElement: SVGSVGElement,
  filename: string = 'foylx-export'
): Promise<void> {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgElement);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  // Convert SVG to PNG via canvas
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgElement.clientWidth * 2;
    canvas.height = svgElement.clientHeight * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    canvas.toBlob((pngBlob) => {
      if (pngBlob) downloadBlob(pngBlob, `${filename}.png`);
    }, 'image/png');
  };
  img.src = url;
}

// ── Helpers ──────────────────────────────────

function buildPageSVG(page: Page, width: number, height: number): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.position = 'absolute';
  svg.style.left = '-9999px';
  svg.style.top = '-9999px';

  // Background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', String(width));
  bg.setAttribute('height', String(height));
  bg.setAttribute('fill', page.background.color);
  svg.appendChild(bg);

  // Strokes
  for (const el of page.elements) {
    if (el.type !== 'stroke') continue;
    const rawPts = el.points.map(([x, y, p]) => ({ x, y, pressure: p ?? 0.5 }));
    const pathData = getSvgPath(rawPts, el.style);
    if (!pathData) continue;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', el.style.color);
    path.setAttribute('opacity', String(el.style.opacity));
    svg.appendChild(path);
  }

  return svg;
}

async function renderPageToDataURL(page: Page): Promise<string> {
  const svg = buildPageSVG(page, 800, 600);
  document.body.appendChild(svg);
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(svg as unknown as HTMLElement, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: page.background.color,
    logging: false,
  });
  document.body.removeChild(svg);
  return canvas.toDataURL('image/png');
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? div.innerText ?? '';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
