'use client';
// src/components/canvas/TextEditor.tsx
// Inline TipTap editor — appears when user clicks canvas with text tool
// or double-clicks an existing text element

import React, { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useAppStore } from '@/store/useAppStore';
import { scheduleSave } from '@/lib/storage/autoSave';
import { nanoid } from 'nanoid';
import type { TextElement } from '@/types';

interface TextEditorProps {
  // If editing existing element
  element?: TextElement;
  // If creating new at position
  x?: number;
  y?: number;
  pageId: string;
  onClose: () => void;
  transform: { x: number; y: number; scale: number };
}

export function TextEditor({ element, x, y, pageId, onClose, transform }: TextEditorProps) {
  const { addElement, updateElement } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(element?.id ?? nanoid());
  const isSaved = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: element?.content ?? '<p></p>',
    autofocus: true,
    editorProps: {
      attributes: {
        class: 'tiptap-editor outline-none min-w-[120px] min-h-[28px]',
        style: 'white-space: pre-wrap; word-break: break-word;',
      },
    },
  });

  // Save and close
  const save = useCallback(() => {
    if (isSaved.current || !editor) return;
    isSaved.current = true;

    const html = editor.getHTML();
    const text = editor.getText();
    if (!text.trim()) {
      onClose();
      return;
    }

    const el = containerRef.current;
    const w = el ? el.offsetWidth : 200;
    const h = el ? el.offsetHeight : 40;

    if (element) {
      // Update existing
      updateElement(pageId, element.id, { content: html, width: w, height: h });
    } else {
      // Create new
      const posX = x ?? 100;
      const posY = y ?? 100;
      const newEl: TextElement = {
        id: idRef.current,
        type: 'text',
        x: x ?? 0,          // canvas coords, not screen
        y: y ?? 0,
        width: Math.max(w / transform.scale, 120),
        height: Math.max(h / transform.scale, 28),
        content: html,
        fontSize: 16,
        fontFamily: 'inherit',
        color: '#1a1a1a',
        align: 'left',
        createdAt: Date.now(),
        zIndex: Date.now(),
      };
      addElement(pageId, newEl);
    }

    scheduleSave(pageId);
    onClose();
  }, [editor, element, pageId, x, y, transform.scale, addElement, updateElement, onClose]);

  // Close on Escape, save on Ctrl+Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { save(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { save(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  // Click outside → save
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        save();
      }
    };
    // Delay to avoid immediate close on the same click that opened
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [save]);

  // Position in canvas space → screen space
  const posX = element ? element.x * transform.scale + transform.x : (x ?? 0) * transform.scale + transform.x;
  const posY = element ? element.y * transform.scale + transform.y : (y ?? 0) * transform.scale + transform.y;
  const fontSize = (element?.fontSize ?? 16) * transform.scale;

  return (
    <div
      ref={containerRef}
      className="absolute z-50"
      style={{
        left: posX,
        top: posY,
        transformOrigin: 'top left',
        minWidth: 120,
      }}
    >
      {/* Mini formatting toolbar */}
      <TextFormatToolbar editor={editor} />

      {/* Editor */}
      <div
        className="bg-transparent"
        style={{ fontSize, lineHeight: 1.6 }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Resize hint */}
      <div className="text-[10px] text-gray-400 mt-0.5 select-none">
        Esc or click outside to finish
      </div>
    </div>
  );
}

// ── Formatting mini-toolbar ─────────────────────────────────

function TextFormatToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const btn = (label: string, action: () => void, active: boolean) => (
    <button
      key={label}
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={label}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-0.5 mb-1 px-1 py-0.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-fit">
      {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {btn('U', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
      {btn('S', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
      <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
      {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
      {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
      {btn('UL', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {btn('OL', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      {btn('☑', () => editor.chain().focus().toggleTaskList().run(), editor.isActive('taskList'))}
      <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
      {/* Color */}
      <input
        type="color"
        onMouseDown={(e) => e.preventDefault()}
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        className="w-5 h-5 rounded cursor-pointer border-0 p-0"
        title="Text color"
        defaultValue="#1a1a1a"
      />
      {/* Font size */}
      <select
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const size = e.target.value;
          editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
        }}
        className="text-xs bg-transparent border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 text-gray-600 dark:text-gray-300"
        defaultValue="16"
      >
        {[12, 14, 16, 18, 20, 24, 28, 32, 40, 48].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
