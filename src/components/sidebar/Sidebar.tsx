'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { BookOpen, Plus, Trash2, ChevronRight, ChevronDown, Moon, Sun, Settings, Calculator, Cloud, GripVertical, Edit2 } from 'lucide-react';
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

  const [expandedNbs, setExpandedNbs] = useState<Set<string>>(new Set([activeNotebookId ?? '']));
  const [showCalc, setShowCalc] = useState(false);
  const [showDrive, setShowDrive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingNb, setEditingNb] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const dragPage = useRef<{ pageId: string; nbId: string } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!isSidebarOpen) return null;

  const notebookList = Object.values(notebooks).sort((a, b) => b.updatedAt - a.updatedAt);
  const toggleNb = (id: string) => setExpandedNbs(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <>
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--fn-surface)',
        borderRight: '1px solid var(--fn-border)',
        display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
        fontFamily: 'var(--fn-font-ui)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 10px', height: 42,
          borderBottom: '1px solid var(--fn-border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Image src="/logo.svg" alt="" width={20} height={20} style={{ borderRadius: 6, flexShrink: 0 }} />
            {/* Caveat for the brand name — this is the signature */}
            <span style={{
              fontFamily: 'var(--fn-font-brand)', fontSize: 19, fontWeight: 700,
              color: 'var(--fn-text)', letterSpacing: '-0.01em', lineHeight: 1,
            }}>Foylx Note</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SyncIndicator />
            <SideBtn onClick={toggleDarkMode} title="Toggle theme">
              {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
            </SideBtn>
          </div>
        </div>

        {/* Notebooks */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 10px 6px' }}>
            <span style={{
              fontFamily: 'var(--fn-font-mono)', fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--fn-muted)',
            }}>Notebooks</span>
            <SideBtn onClick={() => createNotebook(`Notebook ${notebookList.length + 1}`)} title="New notebook">
              <Plus size={12} />
            </SideBtn>
          </div>

          {notebookList.length === 0 && (
            <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
              <BookOpen size={22} style={{ color: 'var(--fn-border)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, color: 'var(--fn-muted)', marginBottom: 6 }}>No notebooks yet</p>
              <button onClick={() => createNotebook('My First Notebook')}
                style={{ fontSize: 12, color: 'var(--fn-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Create one
              </button>
            </div>
          )}

          {notebookList.map((nb) => {
            const isExpanded = expandedNbs.has(nb.id);
            const isActive = activeNotebookId === nb.id;
            const nbPages = nb.pageIds.map(pid => pages[pid]).filter(Boolean);

            return (
              <div key={nb.id}>
                {/* Notebook row */}
                <div
                  onClick={() => { setActiveNotebook(nb.id); toggleNb(nb.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 8px', margin: '0 4px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? 'var(--fn-blue-dim)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--fn-border)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <input type="color" value={nb.coverColor} title="Notebook colour"
                    onChange={e => updateNotebook(nb.id, { coverColor: e.target.value })}
                    onClick={e => e.stopPropagation()}
                    style={{ width: 11, height: 11, border: 'none', borderRadius: 3, cursor: 'pointer', padding: 0, flexShrink: 0 }} />

                  {editingNb === nb.id ? (
                    <input autoFocus value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={() => { updateNotebook(nb.id, { title: editTitle || nb.title }); setEditingNb(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') { updateNotebook(nb.id, { title: editTitle || nb.title }); setEditingNb(null); } e.stopPropagation(); }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        flex: 1, fontSize: 13, background: 'transparent', outline: 'none',
                        border: 'none', borderBottom: '1px solid var(--fn-accent)',
                        color: 'var(--fn-text)', fontFamily: 'var(--fn-font-ui)',
                      }} />
                  ) : (
                    <span style={{
                      flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--fn-accent)' : 'var(--fn-text)',
                    }}>{nb.title}</span>
                  )}

                  <span style={{ fontSize: 10, color: 'var(--fn-muted)', flexShrink: 0 }}>{nbPages.length}</span>
                  {isExpanded ? <ChevronDown size={10} style={{ color: 'var(--fn-muted)', flexShrink: 0 }} /> : <ChevronRight size={10} style={{ color: 'var(--fn-muted)', flexShrink: 0 }} />}
                  <button onClick={e => { e.stopPropagation(); setEditingNb(nb.id); setEditTitle(nb.title); }}
                    title="Rename"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'transparent', padding: 1, lineHeight: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--fn-muted)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'transparent'; }}
                    className="nb-action"
                  ><Edit2 size={9} /></button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (notebookList.length <= 1) return;
                      if (window.confirm(`Delete "${nb.title}"?`)) deleteNotebook(nb.id);
                    }}
                    title="Delete"
                    style={{ border: 'none', background: 'none', cursor: notebookList.length <= 1 ? 'not-allowed' : 'pointer', color: 'transparent', padding: 1, lineHeight: 0 }}
                    onMouseEnter={e => { if (notebookList.length > 1) e.currentTarget.style.color = 'var(--fn-danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'transparent'; }}
                  ><Trash2 size={9} /></button>
                </div>

                {/* Pages */}
                {isExpanded && (
                  <div style={{ paddingLeft: 14, paddingRight: 4 }}>
                    {nbPages.map((page, idx) => (
                      <div key={page.id} draggable
                        onDragStart={() => { dragPage.current = { pageId: page.id, nbId: nb.id }; }}
                        onDragOver={e => { e.preventDefault(); setDragOverId(page.id); }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={e => {
                          e.preventDefault(); setDragOverId(null);
                          if (!dragPage.current || dragPage.current.nbId !== nb.id) return;
                          const ids = nbPages.map(p => p.id);
                          const from = ids.indexOf(dragPage.current.pageId);
                          const to = ids.indexOf(page.id);
                          if (from < 0 || to < 0 || from === to) return;
                          ids.splice(from, 1); ids.splice(to, 0, dragPage.current.pageId);
                          reorderPages(nb.id, ids); dragPage.current = null;
                        }}
                        onClick={() => { setActiveNotebook(nb.id); setActivePage(page.id); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '4px 6px', margin: '1px 0', borderRadius: 6, cursor: 'pointer',
                          fontSize: 12, transition: 'background 0.1s',
                          background: activePageId === page.id ? 'var(--fn-blue-dim)' : 'transparent',
                          color: activePageId === page.id ? 'var(--fn-accent)' : 'var(--fn-muted)',
                          fontWeight: activePageId === page.id ? 600 : 400,
                          borderTop: dragOverId === page.id ? '2px solid var(--fn-accent)' : '2px solid transparent',
                        }}
                        onMouseEnter={e => { if (activePageId !== page.id) e.currentTarget.style.background = 'var(--fn-border)'; }}
                        onMouseLeave={e => { if (activePageId !== page.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <GripVertical size={9} style={{ color: 'var(--fn-border)', cursor: 'grab', flexShrink: 0 }} />
                        {page.thumbnail ? (
                          <Image src={page.thumbnail} alt="" width={20} height={13} unoptimized
                            style={{ objectFit: 'cover', borderRadius: 3, border: '1px solid var(--fn-border)', flexShrink: 0 }} />
                        ) : (
                          <span style={{ width: 14, textAlign: 'right', color: 'var(--fn-border)', fontSize: 10 }}>{idx + 1}</span>
                        )}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {page.title || `Page ${idx + 1}`}
                        </span>
                        <button onClick={e => { e.stopPropagation(); if (nbPages.length > 1) deletePage(page.id); }}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'transparent', padding: 1, lineHeight: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--fn-danger)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'transparent'; }}
                        ><Trash2 size={9} /></button>
                      </div>
                    ))}
                    <button onClick={() => createPage(nb.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        width: '100%', padding: '4px 6px', borderRadius: 6,
                        border: 'none', background: 'none', fontSize: 12,
                        color: 'var(--fn-muted)', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--fn-accent)'; e.currentTarget.style.background = 'var(--fn-blue-dim)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fn-muted)'; e.currentTarget.style.background = 'none'; }}
                    ><Plus size={10} /> Add page</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Apps footer */}
        <div style={{ borderTop: '1px solid var(--fn-border)', padding: '7px 6px', flexShrink: 0 }}>
          <p style={{
            fontFamily: 'var(--fn-font-mono)', fontSize: 9, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--fn-muted)', padding: '0 4px', marginBottom: 5,
          }}>Apps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
            {[
              { label: 'Calc', icon: <Calculator size={14} />, onClick: () => setShowCalc(v => !v), active: showCalc },
              { label: 'Drive', icon: <Cloud size={14} />, onClick: () => setShowDrive(true), active: false },
              { label: 'Settings', icon: <Settings size={14} />, onClick: () => setShowSettings(true), active: false },
            ].map(({ label, icon, onClick, active }) => (
              <button key={label} onClick={onClick} title={label}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '6px 2px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: active ? 'var(--fn-blue-dim)' : 'transparent',
                  color: active ? 'var(--fn-accent)' : 'var(--fn-muted)',
                  fontSize: 10, fontFamily: 'var(--fn-font-ui)',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--fn-border)'; e.currentTarget.style.color = 'var(--fn-text)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fn-muted)'; } }}
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {showCalc && <CalculatorApp onClose={() => setShowCalc(false)} initialX={280} initialY={80} />}
      {showDrive && <DriveModal onClose={() => setShowDrive(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

function SideBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 24, height: 24, borderRadius: 6, border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent', color: 'var(--fn-muted)', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--fn-border)'; e.currentTarget.style.color = 'var(--fn-text)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fn-muted)'; }}
    >{children}</button>
  );
}
