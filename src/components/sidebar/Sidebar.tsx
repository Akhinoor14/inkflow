'use client';
// src/components/sidebar/Sidebar.tsx  (Session 4 — with Calculator app)

import React, { useState } from 'react';
import { useAppStore, useActiveNotebook } from '@/store/useAppStore';
import {
  BookOpen, Plus, Trash2, ChevronRight, ChevronDown,
  Moon, Sun, Settings, Calculator, Cloud,
} from 'lucide-react';
import { clsx } from 'clsx';
import { SyncIndicator } from './SyncIndicator';
import { CalculatorApp } from '@/components/apps/Calculator';
import { DriveModal } from '@/components/modals/DriveModal';
import { SettingsModal } from '@/components/modals/SettingsModal';

export function Sidebar() {
  const {
    notebooks, pages, activeNotebookId, activePageId,
    isSidebarOpen, isDarkMode,
    createNotebook, createPage, deletePage, deleteNotebook,
    setActiveNotebook, setActivePage, toggleDarkMode,
  } = useAppStore();

  const [expandedNbs, setExpandedNbs] = useState<Set<string>>(
    new Set([activeNotebookId ?? ''])
  );
  const [showCalc, setShowCalc] = useState(false);
  const [showDrive, setShowDrive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!isSidebarOpen) return null;

  const notebookList = Object.values(notebooks).sort((a, b) => b.updatedAt - a.updatedAt);

  const toggleNb = (id: string) => {
    setExpandedNbs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <aside className="w-60 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖊</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">InkFlow</span>
          </div>
          <div className="flex items-center gap-0.5">
            <SyncIndicator />
            <button onClick={toggleDarkMode}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* Notebooks */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notebooks</span>
            <button
              onClick={() => createNotebook(`Notebook ${notebookList.length + 1}`)}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
              title="New Notebook"
            >
              <Plus size={13} />
            </button>
          </div>

          {notebookList.length === 0 && (
            <div className="px-4 py-6 text-center">
              <BookOpen size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">No notebooks yet</p>
              <button onClick={() => createNotebook('My First Notebook')}
                className="mt-2 text-xs text-blue-500 hover:text-blue-600">
                Create one
              </button>
            </div>
          )}

          {notebookList.map((nb) => {
            const isExpanded = expandedNbs.has(nb.id);
            const isActive = activeNotebookId === nb.id;
            const nbPages = nb.pageIds.map((pid) => pages[pid]).filter(Boolean);

            return (
              <div key={nb.id} className="mb-0.5">
                <div
                  className={clsx(
                    'flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded-lg cursor-pointer group',
                    isActive ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  onClick={() => { setActiveNotebook(nb.id); toggleNb(nb.id); }}
                >
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: nb.coverColor }} />
                  <span className={clsx('flex-1 text-sm truncate',
                    isActive ? 'font-medium text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300')}>
                    {nb.title}
                  </span>
                  <span className="text-xs text-gray-400">{nbPages.length}</span>
                  {isExpanded ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotebook(nb.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="pl-4 pr-1">
                    {nbPages.map((page, idx) => (
                      <div
                        key={page.id}
                        className={clsx(
                          'flex items-center gap-1.5 px-2 py-1 my-0.5 rounded-md cursor-pointer group text-xs',
                          activePageId === page.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                        onClick={() => { setActiveNotebook(nb.id); setActivePage(page.id); }}
                      >
                        {/* Thumbnail */}
                        {page.thumbnail ? (
                          <img src={page.thumbnail} alt="" className="w-6 h-4 object-cover rounded flex-shrink-0 border border-gray-200 dark:border-gray-700" />
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600 w-4 text-right">{idx + 1}</span>
                        )}
                        <span className="flex-1 truncate">{page.title || `Page ${idx + 1}`}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (nbPages.length > 1) deletePage(page.id); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => createPage(nb.id)}
                      className="flex items-center gap-1.5 px-2 py-1 w-full text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md transition-colors"
                    >
                      <Plus size={10} />
                      Add page
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Apps section ─────────────────────────────────── */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-1.5">Apps</div>
          <div className="grid grid-cols-3 gap-1">
            {/* Calculator */}
            <button
              onClick={() => setShowCalc((v) => !v)}
              className={clsx(
                'flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-colors',
                showCalc
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}
              title="fx-991EX Calculator (Alt+C)"
            >
              <Calculator size={16} />
              <span>Calculator</span>
            </button>

            {/* Drive */}
            <button
              onClick={() => setShowDrive(true)}
              className="flex flex-col items-center gap-1 py-2 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Google Drive Sync"
            >
              <Cloud size={16} />
              <span>Drive</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="flex flex-col items-center gap-1 py-2 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Settings"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Calculator floating window */}
      {showCalc && (
        <CalculatorApp onClose={() => setShowCalc(false)} initialX={280} initialY={80} />
      )}

      {showDrive && <DriveModal onClose={() => setShowDrive(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
