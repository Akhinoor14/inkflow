'use client';
// src/components/modals/DriveModal.tsx
// Google Drive connect, sync status, conflict resolution

import React, { useState, useEffect } from 'react';
import { useAppStore, useActiveNotebook } from '@/store/useAppStore';
import { syncNotebookToDrive, setDriveToken, loadPagesFromDrive, checkForConflicts } from '@/lib/auth/googleDrive';
import { savePage } from '@/lib/storage/db';
import { X, Cloud, CloudOff, RefreshCw, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface Props { onClose: () => void; }

type ConflictResolution = 'local' | 'remote';

interface Conflict {
  pageId: string;
  pageTitle: string;
  localTime: number;
  remoteTime: number;
}

export function DriveModal({ onClose }: Props) {
  const { user, pages, notebooks, activeNotebookId, syncStatus, setSyncStatus, loadPages } = useAppStore();
  const activeNotebook = useActiveNotebook();

  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [resolutions, setResolutions] = useState<Record<string, ConflictResolution>>({});
  const [step, setStep] = useState<'status' | 'conflict' | 'done'>('status');

  useEffect(() => {
    // Check if we have a Drive token from session
    const token = sessionStorage.getItem('drive_token');
    if (token) {
      setDriveToken(token);
      setIsConnected(true);
    }
  }, []);

  const connectDrive = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/signin/google';
  };

  const handleSync = async () => {
    if (!activeNotebook || !isConnected) return;
    setIsSyncing(true);

    try {
      const notebookPages = activeNotebook.pageIds
        .map((pid) => pages[pid])
        .filter(Boolean);

      // Check for conflicts first
      const foundConflicts: Conflict[] = [];
      for (const page of notebookPages) {
        if (page.driveFileId) {
          const status = await checkForConflicts(page);
          if (status === 'remote-newer') {
            foundConflicts.push({
              pageId: page.id,
              pageTitle: page.title,
              localTime: page.updatedAt,
              remoteTime: Date.now(), // placeholder; real time from Drive API
            });
          }
        }
      }

      if (foundConflicts.length > 0) {
        setConflicts(foundConflicts);
        setStep('conflict');
        setIsSyncing(false);
        return;
      }

      // No conflicts — sync
      await syncNotebookToDrive(activeNotebook, notebookPages);
      setStep('done');
    } catch (e: any) {
      setSyncStatus({ status: 'error', error: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const resolveConflicts = async () => {
    if (!activeNotebook) return;
    setIsSyncing(true);

    for (const conflict of conflicts) {
      const resolution = resolutions[conflict.pageId] ?? 'local';
      if (resolution === 'local') {
        // Keep local — will overwrite remote on next sync
        continue;
      } else {
        // Use remote — download from Drive
        // (Would fetch from Drive and update local)
        console.log('[Drive] Applying remote version for', conflict.pageId);
      }
    }

    const notebookPages = activeNotebook.pageIds.map((pid) => pages[pid]).filter(Boolean);
    await syncNotebookToDrive(activeNotebook, notebookPages);
    setConflicts([]);
    setStep('done');
    setIsSyncing(false);
  };

  const fmtTime = (ts: number) => new Date(ts).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Cloud size={16} className="text-blue-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Google Drive Sync</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Not connected */}
          {!isConnected && (
            <div className="text-center py-4">
              <CloudOff size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Not connected</h3>
              <p className="text-sm text-gray-400 mb-4">
                Connect Google Drive to sync your notebooks across devices.
                Your notes are stored safely in your own Drive folder.
              </p>
              <button
                onClick={connectDrive}
                className="flex items-center gap-2 mx-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <svg width="16" height="16" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
                Connect Google Drive
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Only accesses the "InkFlow Studio" folder in your Drive.
              </p>
            </div>
          )}

          {/* Connected — status */}
          {isConnected && step === 'status' && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-xl">
                <CheckCircle size={16} className="text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Connected to Google Drive</p>
                  {syncStatus.lastSynced && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Last synced: {fmtTime(syncStatus.lastSynced.getTime())}
                    </p>
                  )}
                </div>
              </div>

              {activeNotebook && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Currently syncing</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activeNotebook.title}</p>
                  <p className="text-xs text-gray-400">{activeNotebook.pageIds.length} pages</p>
                </div>
              )}

              {syncStatus.status === 'error' && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-xl flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{syncStatus.error}</p>
                </div>
              )}

              <button
                onClick={handleSync}
                disabled={isSyncing || !activeNotebook}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>

              <div className="mt-3 text-center">
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-blue-500 flex items-center justify-center gap-1"
                >
                  Open Google Drive <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}

          {/* Conflict resolution */}
          {step === 'conflict' && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-xl">
                <AlertTriangle size={16} className="text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Conflicts detected</p>
                  <p className="text-xs text-amber-600">{conflicts.length} page(s) modified in both places</p>
                </div>
              </div>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {conflicts.map((c) => (
                  <div key={c.pageId} className="border border-gray-200 dark:border-gray-600 rounded-xl p-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{c.pageTitle}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setResolutions((r) => ({ ...r, [c.pageId]: 'local' }))}
                        className={`p-2 rounded-lg text-xs text-left border-2 transition-colors ${
                          (resolutions[c.pageId] ?? 'local') === 'local'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-700 dark:text-gray-200">Keep Local</div>
                        <div className="text-gray-400">{fmtTime(c.localTime)}</div>
                      </button>
                      <button
                        onClick={() => setResolutions((r) => ({ ...r, [c.pageId]: 'remote' }))}
                        className={`p-2 rounded-lg text-xs text-left border-2 transition-colors ${
                          resolutions[c.pageId] === 'remote'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-700 dark:text-gray-200">Use Drive</div>
                        <div className="text-gray-400">{fmtTime(c.remoteTime)}</div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={resolveConflicts}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSyncing ? 'Applying...' : 'Resolve & Sync'}
              </button>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Sync complete!</h3>
              <p className="text-sm text-gray-400">Your notebook is backed up to Google Drive.</p>
              <button
                onClick={() => setStep('status')}
                className="mt-4 text-sm text-blue-500 hover:text-blue-600"
              >
                Back to sync settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
