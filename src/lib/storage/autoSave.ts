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

  const { preferences } = useAppStore.getState();
  // Respect the autoSave toggle — but always allow manual flushSaves()
  if (!preferences.autoSave) return;
  const interval = preferences.autoSaveInterval * 1000;

  saveTimer = setTimeout(async () => {
    await flushSaves();
  }, interval);
}

export async function flushSaves() {
  const state = useAppStore.getState();
  let hadFailure = false;

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
        hadFailure = true;
        // Re-queue so the next flush (or retry) attempts it again instead
        // of silently dropping the unsaved page.
        pendingPageIds.add(pid);
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
        hadFailure = true;
        pendingNotebookIds.add(nid);
      }
    }
  }

  if (hadFailure) {
    // Surface the failure rather than reporting "synced" when data wasn't
    // actually persisted (e.g. IndexedDB quota exceeded, private browsing
    // restrictions). Retry shortly so transient failures self-heal.
    state.setSyncStatus({ status: 'error', lastSynced: state.syncStatus.lastSynced, error: 'Could not save to local storage' });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { void flushSaves(); }, 5000);
  } else {
    state.setSyncStatus({ status: 'synced', lastSynced: new Date() });
  }
}

export function cancelScheduledSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
}
