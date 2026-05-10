// src/lib/auth/googleDrive.ts
// Google Drive API v3 integration
// Local-first: IndexedDB is always the source of truth
// Drive is optional cloud backup

import type { Page, Notebook, DriveFile, SyncStatus } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const DRIVE_FOLDER_NAME = 'InkFlow Studio';
const PAGE_MIME = 'application/json';

let driveToken: string | null = null;

export function setDriveToken(token: string) {
  driveToken = token;
}

function authHeaders() {
  if (!driveToken) throw new Error('Not authenticated with Google Drive');
  return {
    Authorization: `Bearer ${driveToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Get or create the root InkFlow folder in Drive
 */
export async function getOrCreateRootFolder(): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name%3D%22${encodeURIComponent(DRIVE_FOLDER_NAME)}%22+and+mimeType%3D%22application%2Fvnd.google-apps.folder%22+and+trashed%3Dfalse&fields=files(id,name)`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  if (data.files?.length > 0) return data.files[0].id;

  // Create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const folder = await createRes.json();
  return folder.id;
}

/**
 * Get or create a notebook subfolder
 */
export async function getOrCreateNotebookFolder(
  rootFolderId: string,
  notebookTitle: string,
  notebookId: string
): Promise<string> {
  const folderName = `${notebookTitle}_${notebookId}`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name%3D%22${encodeURIComponent(folderName)}%22+and+mimeType%3D%22application%2Fvnd.google-apps.folder%22+and+%27${rootFolderId}%27+in+parents+and+trashed%3Dfalse&fields=files(id)`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  if (data.files?.length > 0) return data.files[0].id;

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootFolderId],
    }),
  });
  const folder = await createRes.json();
  return folder.id;
}

/**
 * Upload or update a page JSON to Drive
 */
export async function syncPageToDrive(page: Page, notebookFolderId: string): Promise<string> {
  const filename = `page_${page.id}.json`;
  const content = JSON.stringify(page);

  if (page.driveFileId) {
    // Update existing file
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${page.driveFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${driveToken}`,
          'Content-Type': PAGE_MIME,
        },
        body: content,
      }
    );
    const data = await res.json();
    return data.id;
  } else {
    // Create new file
    const metadata = {
      name: filename,
      parents: [notebookFolderId],
      mimeType: PAGE_MIME,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: PAGE_MIME }));

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${driveToken}` },
        body: form,
      }
    );
    const data = await res.json();
    return data.id;
  }
}

/**
 * Full notebook sync to Drive
 * Syncs all pages in a notebook
 */
export async function syncNotebookToDrive(
  notebook: Notebook,
  pages: Page[]
): Promise<void> {
  const store = useAppStore.getState();
  store.setSyncStatus({ status: 'syncing' });

  try {
    const rootId = await getOrCreateRootFolder();
    const nbFolderId = await getOrCreateNotebookFolder(rootId, notebook.title, notebook.id);

    // Update notebook record with folder ID
    store.updateNotebook(notebook.id, { driveFolderId: nbFolderId });

    // Sync each page
    for (const page of pages) {
      const fileId = await syncPageToDrive(page, nbFolderId);
      store.updatePage(page.id, { driveFileId: fileId });
    }

    store.setSyncStatus({ status: 'synced', lastSynced: new Date() });
  } catch (err: any) {
    console.error('[Drive] Sync failed', err);
    store.setSyncStatus({ status: 'error', error: err.message });
  }
}

/**
 * Load pages from Drive for a notebook
 * Used for initial load / conflict resolution
 */
export async function loadPagesFromDrive(notebookFolderId: string): Promise<Page[]> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=%27${notebookFolderId}%27+in+parents+and+trashed%3Dfalse&fields=files(id,name,modifiedTime)`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  const files: DriveFile[] = data.files ?? [];

  const pages: Page[] = [];
  for (const file of files) {
    if (!file.name.startsWith('page_')) continue;
    const pageRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      { headers: authHeaders() }
    );
    const page: Page = await pageRes.json();
    pages.push({ ...page, driveFileId: file.id });
  }

  return pages;
}

/**
 * Check for conflicts: compare Drive modifiedTime vs local updatedAt
 */
export async function checkForConflicts(
  page: Page
): Promise<'local-newer' | 'remote-newer' | 'same'> {
  if (!page.driveFileId || !driveToken) return 'local-newer';

  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${page.driveFileId}?fields=modifiedTime`,
      { headers: authHeaders() }
    );
    const data = await res.json();
    const remoteTime = new Date(data.modifiedTime).getTime();
    const localTime = page.updatedAt;

    if (Math.abs(remoteTime - localTime) < 5000) return 'same';
    return localTime > remoteTime ? 'local-newer' : 'remote-newer';
  } catch {
    return 'local-newer';
  }
}
