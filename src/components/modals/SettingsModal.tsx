'use client';
import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { savePreferences } from '@/lib/storage/db';
import { X, Palette, Keyboard, Sliders, Languages } from 'lucide-react';
import type { BackgroundType } from '@/types';
import type { Language } from '@/lib/i18n';
import { HandwritingSettingsPanel } from '@/components/modals/HandwritingSettingsPanel';

interface Props { onClose: () => void; }
type Tab = 'general' | 'drawing' | 'handwriting' | 'shortcuts' | 'about';

export function SettingsModal({ onClose }: Props) {
  const { preferences, updatePreferences, isDarkMode, toggleDarkMode, handwritingSettings, setHandwritingSettings } = useAppStore();
  const { language, setLanguage, t } = useLanguage();
  const [tab, setTab] = useState<Tab>('general');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await savePreferences(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.65rem 0', borderBottom: '1px solid var(--fn-border)',
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fn-text)', margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: 'var(--fn-muted)', margin: '2px 0 0', fontFamily: 'var(--fn-font-mono)' }}>{desc}</p>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 16 }}>{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} style={{
      position: 'relative', width: 36, height: 19, borderRadius: 999,
      border: 'none', cursor: 'pointer',
      background: value ? 'var(--fn-accent)' : 'var(--fn-border)',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        width: 13, height: 13, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        left: value ? 19 : 3,
        transition: 'left 0.18s',
      }} />
    </button>
  );

  const Select = ({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) => (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      fontSize: 12, padding: '0.3rem 0.5rem',
      background: 'var(--fn-bg)', color: 'var(--fn-text)',
      border: '1px solid var(--fn-border)', borderRadius: 7,
      fontFamily: 'var(--fn-font-ui)', outline: 'none', cursor: 'pointer',
    }}>{children}</select>
  );

  const tabs: { id: Tab; label: string; icon?: React.ReactNode }[] = [
    { id: 'general',     label: t.settings.tabs.general,     icon: <Sliders size={12} /> },
    { id: 'drawing',     label: t.settings.tabs.drawing,     icon: <Palette size={12} /> },
    { id: 'shortcuts',   label: t.settings.tabs.shortcuts,   icon: <Keyboard size={12} /> },
    { id: 'handwriting', label: t.settings.tabs.handwriting, icon: <Languages size={12} /> },
    { id: 'about',       label: t.settings.tabs.about },
  ];

  return (
    <div className="fn-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fn-modal" style={{ width: '100%', maxWidth: 480, maxHeight: '85vh' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--fn-border)', flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fn-text)', margin: 0,
            fontFamily: 'var(--fn-font-display)' }}>{t.settings.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={save} className="fn-btn fn-btn-primary"
              style={{
                fontSize: 12, padding: '0.3rem 0.8rem',
                background: saved ? 'var(--fn-success)' : undefined,
              }}
            >
              {saved ? `✓ ${t.settings.saved}` : t.settings.save}
            </button>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: 'transparent', color: 'var(--fn-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--fn-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            ><X size={15} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, padding: '0.6rem 1rem 0', flexShrink: 0, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
              fontFamily: 'var(--fn-font-ui)',
              background: tab === t.id ? 'var(--fn-blue-dim)' : 'transparent',
              color: tab === t.id ? 'var(--fn-accent)' : 'var(--fn-muted)',
            }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = 'var(--fn-border)'; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.2rem 1rem' }}>
          {tab === 'general' && (
            <div>
              <Row label={t.settings.general.darkMode} desc={t.settings.general.darkModeDesc}>
                <Toggle value={isDarkMode} onChange={() => toggleDarkMode()} />
              </Row>
              <Row label={t.settings.general.theme} desc={t.settings.general.themeDesc}>
                <Select value={preferences.theme} onChange={v => updatePreferences({ theme: v as any })}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
              </Row>
              <Row label={t.settings.general.language} desc={t.settings.general.languageDesc}>
                <Select value={language} onChange={v => { setLanguage(v as Language); updatePreferences({ language: v as Language }); }}>
                  <option value="en">English</option>
                  <option value="bn">বাংলা</option>
                </Select>
              </Row>
              <Row label={t.settings.general.autoSave} desc={t.settings.general.autoSaveDesc}>
                <Toggle value={preferences.autoSave} onChange={v => updatePreferences({ autoSave: v })} />
              </Row>
              <Row label={t.settings.general.autoSaveInterval} desc={t.settings.general.autoSaveIntervalDesc}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="range" min={5} max={120} step={5}
                    value={preferences.autoSaveInterval}
                    onChange={e => updatePreferences({ autoSaveInterval: +e.target.value })}
                    style={{ width: 90 }} />
                  <span style={{ fontSize: 11, color: 'var(--fn-muted)', fontFamily: 'var(--fn-font-mono)', width: 30 }}>
                    {preferences.autoSaveInterval}s
                  </span>
                </div>
              </Row>
              <Row label={t.settings.general.showRuler} desc={t.settings.general.showRulerDesc}>
                <Toggle value={preferences.showRuler} onChange={v => updatePreferences({ showRuler: v })} />
              </Row>
              <Row label={t.settings.general.snapToGrid} desc={t.settings.general.snapToGridDesc}>
                <Toggle value={preferences.snapToGrid} onChange={v => updatePreferences({ snapToGrid: v })} />
              </Row>
              {preferences.snapToGrid && (
                <Row label={t.settings.general.gridSize} desc={t.settings.general.gridSizeDesc}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="range" min={8} max={64} step={4}
                      value={preferences.gridSize}
                      onChange={e => updatePreferences({ gridSize: +e.target.value })}
                      style={{ width: 90 }} />
                    <span style={{ fontSize: 11, color: 'var(--fn-muted)', fontFamily: 'var(--fn-font-mono)', width: 34 }}>
                      {preferences.gridSize}px
                    </span>
                  </div>
                </Row>
              )}
            </div>
          )}

          {tab === 'drawing' && (
            <div>
              <Row label={t.settings.drawing.defaultTool} desc={t.settings.drawing.defaultToolDesc}>
                <Select value={preferences.defaultTool} onChange={v => updatePreferences({ defaultTool: v as any })}>
                  <option value="pen">Pen</option>
                  <option value="highlighter">Highlighter</option>
                  <option value="select">Select</option>
                </Select>
              </Row>
              <Row label={t.settings.drawing.defaultPenSize}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="range" min={1} max={20} step={1}
                    value={preferences.defaultPenSize}
                    onChange={e => updatePreferences({ defaultPenSize: +e.target.value })}
                    style={{ width: 90 }} />
                  <span style={{ fontSize: 11, color: 'var(--fn-muted)', fontFamily: 'var(--fn-font-mono)', width: 20 }}>
                    {preferences.defaultPenSize}
                  </span>
                </div>
              </Row>
              <Row label={t.settings.drawing.defaultPenColor}>
                <input type="color" value={preferences.defaultPenColor}
                  onChange={e => updatePreferences({ defaultPenColor: e.target.value })}
                  style={{ width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', border: 'none' }} />
              </Row>
              <Row label={t.settings.drawing.defaultBackground}>
                <Select value={preferences.defaultBackground} onChange={v => updatePreferences({ defaultBackground: v as BackgroundType })}>
                  <option value="blank">Blank</option>
                  <option value="lined">Lined</option>
                  <option value="grid">Grid</option>
                  <option value="dotted">Dotted</option>
                  <option value="isometric">Isometric</option>
                  <option value="music">Music Staff</option>
                </Select>
              </Row>
              <Row label={t.settings.drawing.autoAdjustDarkMode} desc={t.settings.drawing.autoAdjustDarkModeDesc}>
                <Toggle value={preferences.inkAutoAdjustDarkMode} onChange={v => updatePreferences({ inkAutoAdjustDarkMode: v })} />
              </Row>
            </div>
          )}

          {tab === 'shortcuts' && (
            <div style={{ paddingTop: 4 }}>
              {[
                ['P', 'Pen tool'], ['H', 'Highlighter'], ['E', 'Eraser'],
                ['V', 'Select tool'], ['T', 'Text tool'], ['Space (hold)', 'Pan canvas'],
                ['Ctrl + Z', 'Undo'], ['Ctrl + Shift + Z', 'Redo'], ['Ctrl + S', 'Save'],
                ['Ctrl + A', 'Select all'], ['Ctrl + Enter', 'New page'],
                ['Ctrl + \\', 'Toggle sidebar'], ['Ctrl + 0', 'Reset zoom'],
                ['Ctrl + =', 'Zoom in'], ['Ctrl + -', 'Zoom out'],
                ['Delete', 'Delete selected'], ['Escape', 'Deselect / close'],
                ['Double-click', 'Edit / create text'],
              ].map(([key, desc]) => (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0', borderBottom: '1px solid var(--fn-border)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--fn-text)' }}>{desc}</span>
                  <kbd style={{
                    fontFamily: 'var(--fn-font-mono)', fontSize: 11,
                    background: 'var(--fn-surface)', color: 'var(--fn-muted)',
                    padding: '0.15rem 0.5rem', borderRadius: 5,
                    border: '1px solid var(--fn-border)',
                  }}>{key}</kbd>
                </div>
              ))}
            </div>
          )}

          {tab === 'handwriting' && (
            <div style={{ paddingTop: 4 }}>
              <HandwritingSettingsPanel settings={handwritingSettings} onChange={setHandwritingSettings} />
              <div style={{
                marginTop: 12, padding: '0.75rem', borderRadius: 8,
                background: 'var(--fn-blue-dim)', border: '1px solid var(--fn-blue-glow)',
                fontSize: 12, color: 'var(--fn-accent)', lineHeight: 1.6,
                fontFamily: 'var(--fn-font-ui)',
              }}>
                Select strokes → press <b>🌐 Convert</b> in toolbar to convert handwriting.
                Set mode to <b>Auto</b> for per-stroke conversion.
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div style={{ padding: '0.75rem 0', fontFamily: 'var(--fn-font-ui)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  fontFamily: 'var(--fn-font-brand)', fontSize: 28, fontWeight: 700,
                  color: 'var(--fn-text)', marginBottom: 4,
                }}>Foylx Note</div>
                <p style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 11, color: 'var(--fn-muted)' }}>
                  v0.1.0 · local-first · offline-ready
                </p>
              </div>

              <div style={{
                background: 'var(--fn-bg)', borderRadius: 10, padding: '0.75rem 1rem',
                marginBottom: '0.75rem', border: '1px solid var(--fn-border)',
              }}>
                {[
                  ['Storage', 'Local IndexedDB + optional Google Drive'],
                  ['OCR', 'Tesseract.js — offline, English + বাংলা'],
                  ['Shapes', '$1 Unistroke (offline)'],
                  ['Export', 'PDF · DOCX · PNG'],
                  ['Cost', '$0 / month'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 5, fontSize: 12 }}>
                    <span style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 10, color: 'var(--fn-accent)',
                      minWidth: 60, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{k}</span>
                    <span style={{ color: 'var(--fn-muted)' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'var(--fn-bg)', borderRadius: 10, padding: '0.75rem 1rem',
                border: '1px solid var(--fn-border)',
              }}>
                <p style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 9, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: 'var(--fn-muted)', marginBottom: 8 }}>Developer</p>
                <p style={{ fontFamily: 'var(--fn-font-display)', fontSize: 16, fontWeight: 700,
                  color: 'var(--fn-text)', margin: '0 0 2px' }}>Md Akhinoor Islam</p>
                <p style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 10, color: 'var(--fn-accent)', margin: '0 0 8px' }}>
                  Lead Developer &amp; Founder · A3KM Studio
                </p>
                <p style={{ fontSize: 11, color: 'var(--fn-muted)', margin: '0 0 10px' }}>
                  Energy Science &amp; Engineering · KUET
                </p>
                {[
                  { k: 'email', v: 'mdakhinoorislam.official.2005@gmail.com', href: 'mailto:mdakhinoorislam.official.2005@gmail.com' },
                  { k: 'whatsapp', v: '01724812042', href: 'https://wa.me/8801724812042' },
                  { k: 'github', v: 'Akhinoor14', href: 'https://github.com/Akhinoor14' },
                  { k: 'portfolio', v: 'a3kmstudio.vercel.app', href: 'https://a3kmstudio.vercel.app/Portfolio_Clients/Mr_Akhinoor_Portfolio/Home/index.html' },
                ].map(({ k, v, href }) => (
                  <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 5, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--fn-font-mono)', fontSize: 9, color: 'var(--fn-muted)',
                      minWidth: 58, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</span>
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: 'var(--fn-muted)', textDecoration: 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--fn-accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--fn-muted)')}
                    >{v}</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
