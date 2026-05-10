// src/lib/storage/autoSave.ts
// Auto-save logic: IndexedDB first, then optionally Drive

import { savePage, saveNotebook } from './db';
import { useAppStore } from '@/store/useAppStore';
import type { Page, Notebook } from '@/types';

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPageIds = new Set<string>();
let pendingNotebookIds = new Set<string>();

export function scheduleSave(pageId?: string, notebookId?: string) {
  if (pageId) pendingPageIds.add(pageId);
  if (notebookId) pendingNotebookIds.add(notebookId);

  if (saveTimer) clearTimeout(saveTimer);

  const interval = useAppStore.getState().preferences.autoSaveInterval * 1000;

  saveTimer = setTimeout(async () => {
    await flushSaves();
  }, interval);
}

export async function flushSaves() {
  const state = useAppStore.getState();

  // Save pending pages
  const pageIds = Array.from(pendingPageIds);
  pendingPageIds.clear();
  for (const pid of pageIds) {
    const page = state.pages[pid];
    if (page) {
      try {
        await savePage(page);
      } catch (e) {
        console.error('[AutoSave] Failed to save page', pid, e);
      }
    }
  }

  // Save pending notebooks
  const notebookIds = Array.from(pendingNotebookIds);
  pendingNotebookIds.clear();
  for (const nid of notebookIds) {
    const nb = state.notebooks[nid];
    if (nb) {
      try {
        await saveNotebook(nb);
      } catch (e) {
        console.error('[AutoSave] Failed to save notebook', nid, e);
      }
    }
  }

  state.setSyncStatus({ status: 'synced', lastSynced: new Date() });
}

export function cancelScheduledSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
}
