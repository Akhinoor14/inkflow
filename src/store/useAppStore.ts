// src/store/useAppStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type {
  ToolType,
  StrokeStyle,
  CanvasElement,
  Page,
  Notebook,
  User,
  SelectionState,
  CanvasTransform,
  UserPreferences,
  SyncStatus,
  ShapeType,
} from '@/types';

interface AppState {
  // Auth
  user: User | null;
  isAuthLoading: boolean;

  // Notebooks
  notebooks: Record<string, Notebook>;
  activeNotebookId: string | null;

  // Pages
  pages: Record<string, Page>;
  activePageId: string | null;

  // Canvas tool state
  activeTool: ToolType;
  activeShapeType: ShapeType;
  strokeStyle: StrokeStyle;
  highlighterStyle: StrokeStyle;

  // Canvas transform (pan/zoom)
  transform: CanvasTransform;

  // Selection
  selection: SelectionState;

  // History (undo/redo)
  historyStack: Array<{ elements: CanvasElement[]; description: string }>;
  historyIndex: number;

  // UI state
  isSidebarOpen: boolean;
  isToolbarFloating: boolean;
  toolbarPosition: { x: number; y: number };
  activeModal: string | null;
  isDarkMode: boolean;
  isRecordingAudio: boolean;
  audioDuration: number;

  // Sync
  syncStatus: SyncStatus;

  // Preferences
  preferences: UserPreferences;
}

interface AppActions {
  // Auth
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // Notebooks
  createNotebook: (title: string, coverColor?: string) => Notebook;
  updateNotebook: (id: string, updates: Partial<Notebook>) => void;
  deleteNotebook: (id: string) => void;
  setActiveNotebook: (id: string | null) => void;

  // Pages
  createPage: (notebookId: string) => Page;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  setActivePage: (id: string | null) => void;
  reorderPages: (notebookId: string, pageIds: string[]) => void;

  // Elements
  addElement: (pageId: string, element: CanvasElement) => void;
  updateElement: (pageId: string, elementId: string, updates: Partial<CanvasElement>) => void;
  deleteElements: (pageId: string, elementIds: string[]) => void;
  moveElements: (pageId: string, elementIds: string[], dx: number, dy: number) => void;

  // History
  pushHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;

  // Tool
  setActiveTool: (tool: ToolType) => void;
  setActiveShapeType: (shape: ShapeType) => void;
  setStrokeStyle: (style: Partial<StrokeStyle>) => void;

  // Canvas transform
  setTransform: (transform: Partial<CanvasTransform>) => void;
  resetTransform: () => void;
  zoomTo: (scale: number, centerX?: number, centerY?: number) => void;

  // Selection
  setSelection: (selection: Partial<SelectionState>) => void;
  clearSelection: () => void;
  selectAll: (pageId: string) => void;

  // UI
  toggleSidebar: () => void;
  setActiveModal: (modal: string | null) => void;
  toggleDarkMode: () => void;
  setToolbarPosition: (pos: { x: number; y: number }) => void;
  setIsToolbarFloating: (floating: boolean) => void;
  setIsRecordingAudio: (recording: boolean) => void;

  // Sync
  setSyncStatus: (status: SyncStatus) => void;

  // Preferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // Bulk load (from IndexedDB)
  loadNotebooks: (notebooks: Notebook[]) => void;
  loadPages: (pages: Page[]) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  defaultTool: 'pen',
  defaultPenSize: 4,
  defaultPenColor: '#1a1a1a',
  defaultBackground: 'lined',
  language: 'en',
  autoSave: true,
  autoSaveInterval: 15,
  inkAutoAdjustDarkMode: true,
  showRuler: false,
  snapToGrid: false,
  gridSize: 20,
};

const defaultStrokeStyle: StrokeStyle = {
  color: '#1a1a1a',
  size: 4,
  opacity: 1,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  simulatePressure: true,
};

const highlighterStyle: StrokeStyle = {
  color: '#FFE066',
  size: 20,
  opacity: 0.4,
  thinning: 0,
  smoothing: 0.3,
  streamline: 0.4,
  simulatePressure: false,
};

export const useAppStore = create<AppState & AppActions>()(
  immer((set, get) => ({
    // Initial state
    user: null,
    isAuthLoading: true,
    notebooks: {},
    activeNotebookId: null,
    pages: {},
    activePageId: null,
    activeTool: 'pen',
    activeShapeType: 'rect',
    strokeStyle: defaultStrokeStyle,
    highlighterStyle,
    transform: { x: 0, y: 0, scale: 1 },
    selection: { selectedIds: [], isSelecting: false },
    historyStack: [],
    historyIndex: -1,
    isSidebarOpen: true,
    isToolbarFloating: false,
    toolbarPosition: { x: 80, y: 300 },
    activeModal: null,
    isDarkMode: false,
    isRecordingAudio: false,
    audioDuration: 0,
    syncStatus: { status: 'idle' },
    preferences: defaultPreferences,

    // Auth
    setUser: (user) => set((s) => { s.user = user; }),
    setAuthLoading: (loading) => set((s) => { s.isAuthLoading = loading; }),

    // Notebooks
    createNotebook: (title, coverColor = '#4f46e5') => {
      const notebook: Notebook = {
        id: nanoid(),
        userId: get().user?.id ?? 'local',
        title,
        coverColor,
        pageIds: [],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((s) => {
        s.notebooks[notebook.id] = notebook;
        s.activeNotebookId = notebook.id;
      });
      // Auto-create first page
      get().createPage(notebook.id);
      return notebook;
    },

    updateNotebook: (id, updates) => set((s) => {
      if (s.notebooks[id]) {
        Object.assign(s.notebooks[id], { ...updates, updatedAt: Date.now() });
      }
    }),

    deleteNotebook: (id) => set((s) => {
      const nb = s.notebooks[id];
      if (nb) {
        nb.pageIds.forEach((pid) => { delete s.pages[pid]; });
        delete s.notebooks[id];
        if (s.activeNotebookId === id) {
          const ids = Object.keys(s.notebooks);
          s.activeNotebookId = ids[0] ?? null;
          s.activePageId = ids[0] ? s.notebooks[ids[0]].pageIds[0] ?? null : null;
        }
      }
    }),

    setActiveNotebook: (id) => set((s) => {
      s.activeNotebookId = id;
      if (id && s.notebooks[id]) {
        s.activePageId = s.notebooks[id].pageIds[0] ?? null;
        s.transform = { x: 0, y: 0, scale: 1 };
        s.selection = { selectedIds: [], isSelecting: false };
      }
    }),

    // Pages
    createPage: (notebookId) => {
      const prefs = get().preferences;
      const page: Page = {
        id: nanoid(),
        notebookId,
        order: get().notebooks[notebookId]?.pageIds.length ?? 0,
        title: `Page ${(get().notebooks[notebookId]?.pageIds.length ?? 0) + 1}`,
        elements: [],
        background: {
          type: prefs.defaultBackground,
          color: '#fafaf8',
          lineColor: '#e5e5e0',
          lineSpacing: 32,
        },
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((s) => {
        s.pages[page.id] = page;
        if (s.notebooks[notebookId]) {
          s.notebooks[notebookId].pageIds.push(page.id);
          s.notebooks[notebookId].updatedAt = Date.now();
        }
        s.activePageId = page.id;
      });
      return page;
    },

    updatePage: (id, updates) => set((s) => {
      if (s.pages[id]) {
        Object.assign(s.pages[id], { ...updates, updatedAt: Date.now(), version: s.pages[id].version + 1 });
      }
    }),

    deletePage: (id) => set((s) => {
      const page = s.pages[id];
      if (!page) return;
      const nb = s.notebooks[page.notebookId];
      if (nb) {
        nb.pageIds = nb.pageIds.filter((pid) => pid !== id);
      }
      delete s.pages[id];
      if (s.activePageId === id) {
        s.activePageId = nb?.pageIds[0] ?? null;
      }
    }),

    setActivePage: (id) => set((s) => {
      s.activePageId = id;
      s.selection = { selectedIds: [], isSelecting: false };
      s.transform = { x: 0, y: 0, scale: 1 };
    }),

    reorderPages: (notebookId, pageIds) => set((s) => {
      if (s.notebooks[notebookId]) {
        s.notebooks[notebookId].pageIds = pageIds;
        pageIds.forEach((pid, i) => {
          if (s.pages[pid]) s.pages[pid].order = i;
        });
      }
    }),

    // Elements
    addElement: (pageId, element) => {
      get().pushHistory('add element');
      set((s) => {
        if (s.pages[pageId]) {
          s.pages[pageId].elements.push(element);
          s.pages[pageId].updatedAt = Date.now();
        }
      });
    },

    updateElement: (pageId, elementId, updates) => set((s) => {
      if (s.pages[pageId]) {
        const idx = s.pages[pageId].elements.findIndex((e) => e.id === elementId);
        if (idx !== -1) {
          Object.assign(s.pages[pageId].elements[idx], updates);
          s.pages[pageId].updatedAt = Date.now();
        }
      }
    }),

    deleteElements: (pageId, elementIds) => {
      get().pushHistory('delete elements');
      set((s) => {
        if (s.pages[pageId]) {
          const ids = new Set(elementIds);
          s.pages[pageId].elements = s.pages[pageId].elements.filter((e) => !ids.has(e.id));
          s.pages[pageId].updatedAt = Date.now();
        }
        s.selection.selectedIds = s.selection.selectedIds.filter((id) => !elementIds.includes(id));
      });
    },

    moveElements: (pageId, elementIds, dx, dy) => set((s) => {
      if (!s.pages[pageId]) return;
      const ids = new Set(elementIds);
      s.pages[pageId].elements.forEach((el) => {
        if (!ids.has(el.id)) return;
        if (el.type === 'stroke') {
          // Move stroke points
          el.points = el.points.map(([x, y, p]) => [x + dx, y + dy, p ?? 0.5]);
          el.bounds = { ...el.bounds, x: el.bounds.x + dx, y: el.bounds.y + dy };
        } else if ('x' in el) {
          (el as any).x += dx;
          (el as any).y += dy;
        }
      });
    }),

    // History (simplified — stores element snapshots)
    pushHistory: (description) => set((s) => {
      const pageId = s.activePageId;
      if (!pageId || !s.pages[pageId]) return;
      const snapshot = {
        elements: JSON.parse(JSON.stringify(s.pages[pageId].elements)),
        description,
      };
      // Trim future if we undid then did something
      s.historyStack = s.historyStack.slice(0, s.historyIndex + 1);
      s.historyStack.push(snapshot);
      // Keep max 100 history entries
      if (s.historyStack.length > 100) s.historyStack.shift();
      s.historyIndex = s.historyStack.length - 1;
    }),

    undo: () => set((s) => {
      if (s.historyIndex <= 0 || !s.activePageId) return;
      s.historyIndex -= 1;
      const snapshot = s.historyStack[s.historyIndex];
      if (snapshot && s.pages[s.activePageId]) {
        s.pages[s.activePageId].elements = JSON.parse(JSON.stringify(snapshot.elements));
      }
    }),

    redo: () => set((s) => {
      if (s.historyIndex >= s.historyStack.length - 1 || !s.activePageId) return;
      s.historyIndex += 1;
      const snapshot = s.historyStack[s.historyIndex];
      if (snapshot && s.pages[s.activePageId]) {
        s.pages[s.activePageId].elements = JSON.parse(JSON.stringify(snapshot.elements));
      }
    }),

    // Tool
    setActiveTool: (tool) => set((s) => { s.activeTool = tool; }),
    setActiveShapeType: (shape) => set((s) => { s.activeShapeType = shape; }),
    setStrokeStyle: (style) => set((s) => { Object.assign(s.strokeStyle, style); }),

    // Canvas transform
    setTransform: (t) => set((s) => { Object.assign(s.transform, t); }),
    resetTransform: () => set((s) => { s.transform = { x: 0, y: 0, scale: 1 }; }),
    zoomTo: (scale, centerX = 0, centerY = 0) => set((s) => {
      const clampedScale = Math.min(Math.max(scale, 0.1), 5);
      const ratio = clampedScale / s.transform.scale;
      s.transform = {
        x: centerX - ratio * (centerX - s.transform.x),
        y: centerY - ratio * (centerY - s.transform.y),
        scale: clampedScale,
      };
    }),

    // Selection
    setSelection: (sel) => set((s) => { Object.assign(s.selection, sel); }),
    clearSelection: () => set((s) => {
      s.selection = { selectedIds: [], isSelecting: false };
    }),
    selectAll: (pageId) => set((s) => {
      const page = s.pages[pageId];
      if (page) {
        s.selection.selectedIds = page.elements.map((e) => e.id);
      }
    }),

    // UI
    toggleSidebar: () => set((s) => { s.isSidebarOpen = !s.isSidebarOpen; }),
    setActiveModal: (modal) => set((s) => { s.activeModal = modal; }),
    toggleDarkMode: () => set((s) => { s.isDarkMode = !s.isDarkMode; }),
    setToolbarPosition: (pos) => set((s) => { s.toolbarPosition = pos; }),
    setIsToolbarFloating: (floating) => set((s) => { s.isToolbarFloating = floating; }),
    setIsRecordingAudio: (recording) => set((s) => { s.isRecordingAudio = recording; }),

    // Sync
    setSyncStatus: (status) => set((s) => { s.syncStatus = status; }),

    // Preferences
    updatePreferences: (prefs) => set((s) => { Object.assign(s.preferences, prefs); }),

    // Bulk load
    loadNotebooks: (notebooks) => set((s) => {
      notebooks.forEach((nb) => { s.notebooks[nb.id] = nb; });
    }),
    loadPages: (pages) => set((s) => {
      pages.forEach((p) => { s.pages[p.id] = p; });
    }),
  }))
);

// Selector hooks for performance
export const useActivePage = () => {
  const pages = useAppStore((s) => s.pages);
  const activePageId = useAppStore((s) => s.activePageId);
  return activePageId ? pages[activePageId] : null;
};

export const useActiveNotebook = () => {
  const notebooks = useAppStore((s) => s.notebooks);
  const activeNotebookId = useAppStore((s) => s.activeNotebookId);
  return activeNotebookId ? notebooks[activeNotebookId] : null;
};

export const useCanUndo = () => useAppStore((s) => s.historyIndex > 0);
export const useCanRedo = () => useAppStore((s) => s.historyIndex < s.historyStack.length - 1);
