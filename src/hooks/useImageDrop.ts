'use client';
// src/hooks/useImageDrop.ts

import { useCallback, useEffect } from 'react';
import { useAppStore, useActivePage } from '@/store/useAppStore';
import { nanoid } from 'nanoid';
import type { ImageElement } from '@/types';

export function useImageDrop(containerRef: React.RefObject<HTMLElement>) {
  const activePage = useActivePage();
  const { addElement, transform } = useAppStore();

  const handleFile = useCallback(async (file: File, dropX: number, dropY: number) => {
    if (!activePage || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return;

      // Get canvas coords
      const rect = containerRef.current!.getBoundingClientRect();
      const x = (dropX - rect.left - transform.x) / transform.scale;
      const y = (dropY - rect.top - transform.y) / transform.scale;

      // Get natural image dimensions
      const img = new Image();
      img.onload = () => {
        const maxW = 400;
        const ratio = Math.min(1, maxW / img.naturalWidth);
        const element: ImageElement = {
          id: nanoid(),
          type: 'image',
          x: x - (img.naturalWidth * ratio) / 2,
          y: y - (img.naturalHeight * ratio) / 2,
          width: img.naturalWidth * ratio,
          height: img.naturalHeight * ratio,
          src,
          rotation: 0,
          opacity: 1,
          createdAt: Date.now(),
          zIndex: Date.now(),
        };
        addElement(activePage.id, element);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [activePage, addElement, transform, containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onDragOver = (e: DragEvent) => { e.preventDefault(); e.dataTransfer!.dropEffect = 'copy'; };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files ?? []);
      const imageFile = files.find((f) => f.type.startsWith('image/'));
      if (imageFile) handleFile(imageFile, e.clientX, e.clientY);
    };

    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((i) => i.type.startsWith('image/'));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          // Drop at center of viewport
          const rect = el.getBoundingClientRect();
          handleFile(file, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);
    window.addEventListener('paste', onPaste);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('drop', onDrop);
      window.removeEventListener('paste', onPaste);
    };
  }, [handleFile, containerRef]);
}
