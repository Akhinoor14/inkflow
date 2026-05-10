// src/lib/storage/db.ts
// IndexedDB database using Dexie.js for local-first storage

import Dexie, { type Table } from 'dexie';
import type { Notebook, Page, User, UserPreferences, AudioRecording } from '@/types';

export class InkFlowDB extends Dexie {
  notebooks!: Table<Notebook, string>;
  pages!: Table<Page, string>;
  users!: Table<User, string>;
  audioRecordings!: Table<AudioRecording, string>;
  preferences!: Table<{ id: string } & UserPreferences, string>;

  constructor() {
    super('InkFlowStudio');

    this.version(1).stores({
      notebooks: 'id, userId, title, updatedAt, createdAt',
      pages: 'id, notebookId, order, updatedAt, createdAt',
      users: 'id, email, googleId',
      audioRecordings: 'id, pageId, createdAt',
      preferences: 'id',
    });
  }
}

export const db = new InkFlowDB();

// Helper functions
export async function saveNotebook(notebook: Notebook): Promise<void> {
  await db.notebooks.put(notebook);
}

export async function saveNotebooks(notebooks: Notebook[]): Promise<void> {
  await db.notebooks.bulkPut(notebooks);
}

export async function getNotebook(id: string): Promise<Notebook | undefined> {
  return db.notebooks.get(id);
}

export async function getAllNotebooks(userId: string): Promise<Notebook[]> {
  return db.notebooks.where('userId').equals(userId).sortBy('updatedAt');
}

export async function deleteNotebook(id: string): Promise<void> {
  await db.transaction('rw', db.notebooks, db.pages, async () => {
    const pages = await db.pages.where('notebookId').equals(id).toArray();
    await Promise.all(pages.map((p) => db.pages.delete(p.id)));
    await db.notebooks.delete(id);
  });
}

export async function savePage(page: Page): Promise<void> {
  await db.pages.put(page);
}

export async function savePages(pages: Page[]): Promise<void> {
  await db.pages.bulkPut(pages);
}

export async function getPage(id: string): Promise<Page | undefined> {
  return db.pages.get(id);
}

export async function getPagesForNotebook(notebookId: string): Promise<Page[]> {
  return db.pages.where('notebookId').equals(notebookId).sortBy('order');
}

export async function deletePage(id: string): Promise<void> {
  await db.pages.delete(id);
}

export async function saveAudioRecording(recording: AudioRecording): Promise<void> {
  await db.audioRecordings.put(recording);
}

export async function getAudioRecording(id: string): Promise<AudioRecording | undefined> {
  return db.audioRecordings.get(id);
}

export async function getPageAudioRecording(pageId: string): Promise<AudioRecording | undefined> {
  return db.audioRecordings.where('pageId').equals(pageId).first();
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await db.preferences.put({ id: 'local', ...prefs });
}

export async function loadPreferences(): Promise<UserPreferences | null> {
  const prefs = await db.preferences.get('local');
  if (!prefs) return null;
  const { id, ...rest } = prefs;
  return rest as UserPreferences;
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.notebooks, db.pages, db.audioRecordings, async () => {
    await db.notebooks.clear();
    await db.pages.clear();
    await db.audioRecordings.clear();
  });
}

// Thumbnail helper — save a small preview image for pages
export async function updatePageThumbnail(pageId: string, thumbnail: string): Promise<void> {
  await db.pages.update(pageId, { thumbnail });
}
