'use client';
import React, { useState } from 'react';
import { useAppStore, useActivePage, useActiveNotebook } from '@/store/useAppStore';
import { PanelLeft, FileDown, Mic, MicOff, Grid3X3 } from 'lucide-react';
import { BackgroundPicker } from './BackgroundPicker';
import { ExportMenu } from './ExportMenu';

function IBtn({ onClick, title, children, active = false }: {
  onClick: () => void; title: string; children: React.ReactNode; active?: boolean;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 30, height: 30, borderRadius: 7, border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      background: active ? 'rgba(224,82,82,0.12)' : 'transparent',
      color: active ? 'var(--fn-danger)' : 'var(--fn-muted)',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--fn-border)'; e.currentTarget.style.color = 'var(--fn-text)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fn-muted)'; } }}
    >{children}</button>
  );
}

export function PageHeader() {
  const { toggleSidebar, isRecordingAudio, setIsRecordingAudio, updatePage } = useAppStore();
  const activePage = useActivePage();
  const activeNotebook = useActiveNotebook();
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showExport, setShowExport] = useState(false);

  if (!activePage) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px',
      height: 42, flexShrink: 0,
      background: 'var(--fn-surface)',
      borderBottom: '1px solid var(--fn-border)',
      fontFamily: 'var(--fn-font-ui)',
    }}>
      <IBtn onClick={toggleSidebar} title="Toggle sidebar (Ctrl+\\)">
        <PanelLeft size={15} />
      </IBtn>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, minWidth: 0 }}>
        <span style={{ color: 'var(--fn-muted)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
          {activeNotebook?.title}
        </span>
        <span style={{ color: 'var(--fn-border)', fontSize: 15 }}>/</span>
        <input
          type="text" value={activePage.title}
          onChange={e => updatePage(activePage.id, { title: e.target.value })}
          placeholder="Untitled"
          style={{
            fontWeight: 600, color: 'var(--fn-text)', background: 'transparent',
            border: 'none', outline: 'none', fontSize: 13,
            minWidth: 80, maxWidth: 170, fontFamily: 'var(--fn-font-ui)',
            borderRadius: 5, padding: '2px 4px',
          }}
          onFocus={e => { e.target.style.background = 'var(--fn-bg)'; }}
          onBlur={e => { e.target.style.background = 'transparent'; }}
        />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <IBtn
          onClick={() => setIsRecordingAudio(!isRecordingAudio)}
          title={isRecordingAudio ? 'Stop recording' : 'Record audio'}
          active={isRecordingAudio}
        >
          {isRecordingAudio ? <MicOff size={15} /> : <Mic size={15} />}
        </IBtn>

        <div style={{ position: 'relative' }}>
          <IBtn onClick={() => setShowBgPicker(!showBgPicker)} title="Background">
            <Grid3X3 size={15} />
          </IBtn>
          {showBgPicker && <BackgroundPicker onClose={() => setShowBgPicker(false)} />}
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowExport(!showExport)}
            className="fn-btn fn-btn-primary"
            style={{ fontSize: 12, padding: '0.3rem 0.75rem', gap: 5 }}
          >
            <FileDown size={13} /> Export
          </button>
          {showExport && <ExportMenu onClose={() => setShowExport(false)} />}
        </div>
      </div>
    </div>
  );
}
