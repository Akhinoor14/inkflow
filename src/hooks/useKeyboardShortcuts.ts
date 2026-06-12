'use client';
// src/hooks/useKeyboardShortcuts.ts
// Centralized keyboard shortcut handler

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { flushSaves } from '@/lib/storage/autoSave';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Always read fresh state — never close over stale store snapshot
      const store = useAppStore.getState();
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
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
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

      // Toggle sidebar
      if (ctrl && e.key === '\\') {
        e.preventDefault();
        store.toggleSidebar();
        return;
      }

      // Zoom reset
      if (ctrl && e.key === '0') {
        e.preventDefault();
        store.resetTransform();
        return;
      }

      // Zoom in/out via keyboard
      if (ctrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        store.zoomTo(store.transform.scale * 1.25);
        return;
      }
      if (ctrl && e.key === '-') {
        e.preventDefault();
        store.zoomTo(store.transform.scale / 1.25);
        return;
      }

      // Tool shortcuts — skip if typing in input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;

      // NOTE: p/e/v/t/h/l are handled by useHotkeys in MainToolbar.
      // Only handle undo/redo here to avoid double-firing (Bug #8 fix).
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); store.undo(); return; }
      if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z')) {
        e.preventDefault(); store.redo(); return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // intentionally empty — handler always reads fresh state via getState()
}
