'use client';
// src/components/sidebar/Sidebar.tsx  (Session 4 — drag reorder + context menu)

import React, { useState, useRef } from 'react';
import { useAppStore, useActiveNotebook } from '@/store/useAppStore';
import {
  BookOpen, Plus, Trash2, ChevronRight, ChevronDown,
  Moon, Sun, Settings, Calculator, Cloud, GripVertical, Edit2, Check,
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
    setActiveNotebook, setActivePage, toggleDarkMode, reorderPages, updateNotebook,
  } = useAppStore();

  const [expandedNbs, setExpandedNbs] = useState<Set<string>>(
    new Set([activeNotebookId ?? ''])
  );
  const [showCalc, setShowCalc] = useState(false);
  const [showDrive, setShowDrive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingNb, setEditingNb] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const dragPage = useRef<{pageId:string;nbId:string}|null>(null);
  const [dragOverId, setDragOverId] = useState<string|null>(null);

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
            <img src="/logo.svg" alt="" className="w-6 h-6 rounded-md flex-shrink-0" />
            <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Foylx Note</span>
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
                  {/* Cover color dot — click to change */}
                  <input
                    type="color" value={nb.coverColor}
                    title="Notebook color"
                    onChange={e => updateNotebook(nb.id, { coverColor: e.target.value })}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 rounded-sm cursor-pointer border-0 p-0 flex-shrink-0"
                    style={{ background: nb.coverColor }}
                  />

                  {/* Editable title */}
                  {editingNb === nb.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={() => { updateNotebook(nb.id, { title: editTitle || nb.title }); setEditingNb(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') { updateNotebook(nb.id, { title: editTitle || nb.title }); setEditingNb(null); } e.stopPropagation(); }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 text-sm bg-transparent border-b border-blue-400 outline-none text-gray-800 dark:text-gray-200"
                    />
                  ) : (
                    <span className={clsx('flex-1 text-sm truncate',
                      isActive ? 'font-medium text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300')}>
                      {nb.title}
                    </span>
                  )}

                  <span className="text-xs text-gray-400 flex-shrink-0">{nbPages.length}</span>
                  {isExpanded ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
                  <button
                    onClick={e => { e.stopPropagation(); setEditingNb(nb.id); setEditTitle(nb.title); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-blue-500"
                    title="Rename"
                  >
                    <Edit2 size={10} />
                  </button>
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
                        draggable
                        onDragStart={() => { dragPage.current = {pageId:page.id,nbId:nb.id}; }}
                        onDragOver={(e) => { e.preventDefault(); setDragOverId(page.id); }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={(e) => {
                          e.preventDefault(); setDragOverId(null);
                          if(!dragPage.current||dragPage.current.nbId!==nb.id) return;
                          const ids=nbPages.map(p=>p.id);
                          const from=ids.indexOf(dragPage.current.pageId);
                          const to=ids.indexOf(page.id);
                          if(from<0||to<0||from===to) return;
                          ids.splice(from,1); ids.splice(to,0,dragPage.current.pageId);
                          reorderPages(nb.id,ids);
                          dragPage.current=null;
                        }}
                        className={clsx(
                          'flex items-center gap-1.5 px-2 py-1 my-0.5 rounded-md cursor-pointer group text-xs',
                          activePageId === page.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                          dragOverId===page.id && 'border-t-2 border-blue-400'
                        )}
                        onClick={() => { setActiveNotebook(nb.id); setActivePage(page.id); }}
                      >
                        <GripVertical size={10} className="opacity-0 group-hover:opacity-40 cursor-grab flex-shrink-0" />
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
