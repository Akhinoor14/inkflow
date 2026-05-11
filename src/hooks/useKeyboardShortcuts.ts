'use client';
// src/hooks/useKeyboardShortcuts.ts
// Centralized keyboard shortcut handler

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { flushSaves } from '@/lib/storage/autoSave';

export function useKeyboardShortcuts() {
  const store = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Save
      if (ctrl && e.key === 's') {
        e.preventDefault();
        flushSaves();
        return;
      }

      // Select all
      if (ctrl && e.key === 'a') {
        e.preventDefault();
        const { activePageId } = store;
        if (activePageId) store.selectAll(activePageId);
        return;
      }

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selection.selectedIds.length > 0) {
        // Don't interfere with text inputs
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
        e.preventDefault();
        const { activePageId, selection } = store;
        if (activePageId) store.deleteElements(activePageId, selection.selectedIds);
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        store.clearSelection();
        store.setActiveModal(null);
        return;
      }

      // New page
      if (ctrl && e.key === 'Enter') {
        e.preventDefault();
        const { activeNotebookId } = store;
        if (activeNotebookId) store.createPage(activeNotebookId);
        return;
      }

      // Zoom reset
      if (ctrl && e.key === '0') {
        e.preventDefault();
        store.resetTransform();
        return;
      }

      // Tool shortcuts (skip if typing in input)
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      const toolMap: Record<string,string> = {
        p:'pen', h:'highlighter', e:'eraser', s:'select', t:'text', l:'lasso', v:'pan', q:'shape',
      };
      if (!ctrl && !e.shiftKey && e.key.length===1 && toolMap[e.key.toLowerCase()]) {
        store.setActiveTool(toolMap[e.key.toLowerCase()] as any);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line
}
