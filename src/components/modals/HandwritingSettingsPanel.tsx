'use client';
// src/components/modals/HandwritingSettingsPanel.tsx
// Full handwriting conversion settings with all customization options

import React from 'react';
import type { HandwritingSettings, OCRLanguage, ConversionMode } from '@/lib/ocr/handwritingConversion';

interface Props {
  settings: HandwritingSettings;
  onChange: (s: HandwritingSettings) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function Select<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as T)}
      className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function HandwritingSettingsPanel({ settings, onChange }: Props) {
  const set = <K extends keyof HandwritingSettings>(key: K, value: HandwritingSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-0">
      {/* Conversion mode */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Handwriting Conversion</p>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { val: 'off', label: '✕ Off', desc: 'Manual only' },
            { val: 'manual', label: '⊙ Manual', desc: 'Select & convert' },
            { val: 'auto', label: '⚡ Auto', desc: 'On stroke end' },
          ] as { val: ConversionMode; label: string; desc: string }[]).map(({ val, label, desc }) => (
            <button key={val} onClick={() => set('conversionMode', val)}
              className={`p-2 rounded-xl border-2 text-left transition-colors ${settings.conversionMode === val ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <Row label="Language">
        <Select<OCRLanguage> value={settings.language} onChange={v => set('language', v)}
          options={[
            { value: 'eng', label: 'English' },
            { value: 'ben', label: 'বাংলা' },
            { value: 'eng+ben', label: 'English + বাংলা' },
          ]} />
      </Row>

      {settings.conversionMode === 'auto' && (
        <Row label={`Auto-convert delay: ${settings.autoConvertDelay}ms`}>
          <input type="range" min={500} max={4000} step={100} value={settings.autoConvertDelay}
            onChange={e => set('autoConvertDelay', Number(e.target.value))}
            className="w-28 accent-blue-500" />
        </Row>
      )}

      <Row label="Show correction UI before commit">
        <Toggle value={settings.correctionMode} onChange={v => set('correctionMode', v)} />
      </Row>

      <Row label="Keep original ink after conversion">
        <Toggle value={settings.keepOriginalStroke} onChange={v => set('keepOriginalStroke', v)} />
      </Row>

      <Row label="Show OCR confidence %">
        <Toggle value={settings.showConfidence} onChange={v => set('showConfidence', v)} />
      </Row>

      <div className="mt-3 mb-1">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Shape Recognition</p>
      </div>

      <Row label="Auto-convert freehand → perfect shape">
        <Toggle value={settings.shapeAutoConvert} onChange={v => set('shapeAutoConvert', v)} />
      </Row>

      {settings.shapeAutoConvert && (
        <Row label={`Snap threshold: ${Math.round(settings.geometrySnapThreshold * 100)}%`}>
          <input type="range" min={55} max={95} step={1} value={settings.geometrySnapThreshold * 100}
            onChange={e => set('geometrySnapThreshold', Number(e.target.value) / 100)}
            className="w-28 accent-blue-500" />
        </Row>
      )}

      <div className="mt-3 mb-1">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Converted Text Style</p>
      </div>

      <Row label={`Font size: ${settings.fontSize}px`}>
        <input type="range" min={10} max={36} step={1} value={settings.fontSize}
          onChange={e => set('fontSize', Number(e.target.value))}
          className="w-28 accent-blue-500" />
      </Row>

      <Row label="Font family">
        <Select value={settings.fontFamily} onChange={v => set('fontFamily', v)}
          options={[
            { value: 'Noto Sans Bengali, sans-serif', label: 'Noto Sans Bengali' },
            { value: 'Georgia, serif', label: 'Georgia' },
            { value: 'Arial, sans-serif', label: 'Arial' },
            { value: 'Courier New, monospace', label: 'Courier New' },
          ]} />
      </Row>

      <Row label="Text color">
        <input type="color" value={settings.textColor}
          onChange={e => set('textColor', e.target.value)}
          className="w-8 h-7 rounded cursor-pointer border border-gray-200" />
      </Row>
    </div>
  );
}
