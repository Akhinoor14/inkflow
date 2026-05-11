// src/types/index.ts
// Core types for Foylx Note

export type ToolType =
  | 'pen'
  | 'eraser'
  | 'select'
  | 'text'
  | 'shape'
  | 'pan'
  | 'lasso'
  | 'highlighter'
  | 'image';

export type ShapeType =
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'arrow'
  | 'line'
  | 'star';

export type ElementType = 'stroke' | 'text' | 'shape' | 'image' | 'audio-mark';

export type BackgroundType = 'blank' | 'lined' | 'grid' | 'dotted' | 'isometric' | 'music';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StrokeStyle {
  color: string;
  size: number;
  opacity: number;
  thinning: number;     // perfect-freehand thinning
  smoothing: number;    // perfect-freehand smoothing
  streamline: number;   // perfect-freehand streamline
  simulatePressure: boolean;
}

export interface StrokeElement {
  id: string;
  type: 'stroke';
  points: number[][];   // [[x, y, pressure], ...]
  style: StrokeStyle;
  bounds: BoundingBox;
  recognizedText?: string;  // after OCR
  audioTimestamp?: number;  // for audio sync
  createdAt: number;
  zIndex: number;
}

export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;      // TipTap JSON string
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  audioTimestamp?: number;
  createdAt: number;
  zIndex: number;
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  audioTimestamp?: number;
  createdAt: number;
  zIndex: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;          // base64 or URL
  rotation: number;
  opacity: number;
  createdAt: number;
  zIndex: number;
}

export interface AudioMarkElement {
  id: string;
  type: 'audio-mark';
  x: number;
  y: number;
  timestamp: number;    // ms into the audio recording
  createdAt: number;
  zIndex: number;
}

export type CanvasElement =
  | StrokeElement
  | TextElement
  | ShapeElement
  | ImageElement
  | AudioMarkElement;

export interface AudioRecording {
  id: string;
  pageId: string;
  blob?: Blob;
  url?: string;         // object URL or Drive URL
  duration: number;
  createdAt: number;
}

export interface PageBackground {
  type: BackgroundType;
  color: string;
  lineColor?: string;
  lineSpacing?: number;
}

export interface Page {
  id: string;
  notebookId: string;
  order: number;
  title: string;
  elements: CanvasElement[];
  background: PageBackground;
  thumbnail?: string;   // base64 small preview
  audioRecording?: AudioRecording;
  version: number;
  createdAt: number;
  updatedAt: number;
  driveFileId?: string;
}

export interface Notebook {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverColor: string;
  coverImage?: string;
  pageIds: string[];
  tags: string[];
  driveFolderId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
  driveConnected: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultTool: ToolType;
  defaultPenSize: number;
  defaultPenColor: string;
  defaultBackground: BackgroundType;
  language: 'en' | 'bn';
  autoSave: boolean;
  autoSaveInterval: number;   // seconds
  inkAutoAdjustDarkMode: boolean;
  showRuler: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface SelectionState {
  selectedIds: string[];
  bounds?: BoundingBox;
  isSelecting: boolean;
  lassoPoints?: Point[];
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface HistoryEntry {
  id: string;
  type: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
}

// Drive sync types
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'conflict';
  lastSynced?: Date;
  error?: string;
}

// OCR types
export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: BoundingBox;
  }>;
}

// Shape recognition
export interface ShapeRecognitionResult {
  shape: ShapeType | null;
  confidence: number;
  boundingBox: BoundingBox;
}

// Export types
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'png' | 'svg';
  quality?: number;       // 1-4 for PDF DPI multiplier
  includeBackground?: boolean;
  pages?: string[];       // pageIds, empty = all
  filename?: string;
}
