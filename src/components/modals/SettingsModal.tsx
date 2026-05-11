'use client';
// src/components/modals/SettingsModal.tsx

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { savePreferences } from '@/lib/storage/db';
import { X, Palette, Save, Globe, Keyboard, Sliders, Languages } from 'lucide-react';
import type { BackgroundType } from '@/types';
import { HandwritingSettingsPanel } from '@/components/modals/HandwritingSettingsPanel';

interface Props { onClose: () => void; }

type Tab = 'general' | 'drawing' | 'handwriting' | 'shortcuts' | 'about';

export function SettingsModal({ onClose }: Props) {
  const { preferences, updatePreferences, isDarkMode, toggleDarkMode, handwritingSettings, setHandwritingSettings } = useAppStore();
  const [tab, setTab] = useState<Tab>('general');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await savePreferences(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Sliders size={14} /> },
    { id: 'drawing', label: 'Drawing', icon: <Palette size={14} /> },
    { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={14} /> },
    { id: 'handwriting', label: 'Handwriting', icon: <Languages size={14} /> },
    { id: 'about', label: 'About', icon: null },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                saved ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saved ? '✓ Saved' : 'Save'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.id
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {tab === 'general' && (
            <div>
              <Row label="Dark Mode" desc="Switch between light and dark theme">
                <Toggle value={isDarkMode} onChange={() => toggleDarkMode()} />
              </Row>
              <Row label="Theme" desc="Color scheme preference">
                <select
                  value={preferences.theme}
                  onChange={(e) => updatePreferences({ theme: e.target.value as any })}
                  className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </Row>
              <Row label="Language" desc="UI language">
                <select
                  value={preferences.language}
                  onChange={(e) => updatePreferences({ language: e.target.value as any })}
                  className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="en">English</option>
                  <option value="bn">বাংলা</option>
                </select>
              </Row>
              <Row label="Auto Save" desc="Automatically save changes">
                <Toggle value={preferences.autoSave} onChange={(v) => updatePreferences({ autoSave: v })} />
              </Row>
              <Row label="Auto Save Interval" desc="How often to auto-save (seconds)">
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={5} max={120} step={5}
                    value={preferences.autoSaveInterval}
                    onChange={(e) => updatePreferences({ autoSaveInterval: +e.target.value })}
                    className="w-24"
                  />
                  <span className="text-xs text-gray-500 w-8">{preferences.autoSaveInterval}s</span>
                </div>
              </Row>
              <Row label="Show Ruler" desc="Display ruler on canvas edges">
                <Toggle value={preferences.showRuler} onChange={(v) => updatePreferences({ showRuler: v })} />
              </Row>
              <Row label="Snap to Grid" desc="Snap elements to grid">
                <Toggle value={preferences.snapToGrid} onChange={(v) => updatePreferences({ snapToGrid: v })} />
              </Row>
              {preferences.snapToGrid && (
                <Row label="Grid Size" desc="Size of grid cells (px)">
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={8} max={64} step={4}
                      value={preferences.gridSize}
                      onChange={(e) => updatePreferences({ gridSize: +e.target.value })}
                      className="w-24"
                    />
                    <span className="text-xs text-gray-500 w-8">{preferences.gridSize}px</span>
                  </div>
                </Row>
              )}
            </div>
          )}

          {tab === 'drawing' && (
            <div>
              <Row label="Default Tool" desc="Tool selected when opening a page">
                <select
                  value={preferences.defaultTool}
                  onChange={(e) => updatePreferences({ defaultTool: e.target.value as any })}
                  className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="pen">Pen</option>
                  <option value="highlighter">Highlighter</option>
                  <option value="select">Select</option>
                </select>
              </Row>
              <Row label="Default Pen Size">
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={1} max={20} step={1}
                    value={preferences.defaultPenSize}
                    onChange={(e) => updatePreferences({ defaultPenSize: +e.target.value })}
                    className="w-24"
                  />
                  <span className="text-xs text-gray-500 w-6">{preferences.defaultPenSize}</span>
                </div>
              </Row>
              <Row label="Default Pen Color">
                <input
                  type="color"
                  value={preferences.defaultPenColor}
                  onChange={(e) => updatePreferences({ defaultPenColor: e.target.value })}
                  className="w-8 h-8 rounded-full cursor-pointer border-0"
                />
              </Row>
              <Row label="Default Background">
                <select
                  value={preferences.defaultBackground}
                  onChange={(e) => updatePreferences({ defaultBackground: e.target.value as BackgroundType })}
                  className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="blank">Blank</option>
                  <option value="lined">Lined</option>
                  <option value="grid">Grid</option>
                  <option value="dotted">Dotted</option>
                  <option value="isometric">Isometric</option>
                  <option value="music">Music Staff</option>
                </select>
              </Row>
              <Row label="Auto-adjust Ink in Dark Mode" desc="Lighten dark ink automatically">
                <Toggle
                  value={preferences.inkAutoAdjustDarkMode}
                  onChange={(v) => updatePreferences({ inkAutoAdjustDarkMode: v })}
                />
              </Row>
            </div>
          )}

          {tab === 'shortcuts' && (
            <div className="space-y-1">
              {[
                ['P', 'Pen tool'],
                ['H', 'Highlighter'],
                ['E', 'Eraser'],
                ['V', 'Select tool'],
                ['T', 'Text tool'],
                ['Space (hold)', 'Pan canvas'],
                ['Ctrl + Z', 'Undo'],
                ['Ctrl + Shift + Z', 'Redo'],
                ['Ctrl + S', 'Save now'],
                ['Ctrl + A', 'Select all'],
                ['Ctrl + Enter', 'New page'],
                ['Ctrl + \\', 'Toggle sidebar'],
                ['Ctrl + 0', 'Reset zoom'],
                ['Ctrl + =', 'Zoom in'],
                ['Ctrl + -', 'Zoom out'],
                ['Delete / Backspace', 'Delete selected'],
                ['Escape', 'Deselect / close'],
                ['Double-click', 'Edit text / create text'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{desc}</span>
                  <kbd className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{key}</kbd>
                </div>
              ))}
            </div>
          )}

          {tab === 'handwriting' && (
            <div className="p-1">
              <HandwritingSettingsPanel
                settings={handwritingSettings}
                onChange={setHandwritingSettings}
              />
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-xl text-xs text-blue-600 dark:text-blue-400">
                <b>How to use:</b> Select strokes with the Select tool, then press the
                <b> 🌐 Convert</b> button in the toolbar to convert handwriting to text.
                Set mode to <b>Auto</b> for automatic conversion after each stroke.
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div className="py-4 text-center">
              <div className="text-4xl mb-3">🖊</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Foylx Note</h3>
              <p className="text-xs text-gray-400 mt-1">Version 0.1.0 — Session 3</p>
              <div className="mt-6 text-left space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>✅ <strong>Cost:</strong> $0/month (fully free stack)</p>
                <p>✅ <strong>Storage:</strong> Local IndexedDB + optional Google Drive</p>
                <p>✅ <strong>OCR:</strong> Tesseract.js (offline, English + বাংলা)</p>
                <p>✅ <strong>Shape recognition:</strong> $1 Unistroke (offline)</p>
                <p>✅ <strong>Export:</strong> PDF, DOCX, PNG</p>
                <p>✅ <strong>PWA:</strong> Works offline</p>
              </div>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-xl text-xs text-amber-700 dark:text-amber-300 text-left">
                <strong>Optional paid upgrades (disabled by default):</strong><br />
                Azure Ink Recognizer (~$1/1k calls)<br />
                Google Vision OCR (~$1.50/1k images)<br />
                MyScript iinkJS (~$500/yr)<br />
                Enable via .env.local when ready.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
