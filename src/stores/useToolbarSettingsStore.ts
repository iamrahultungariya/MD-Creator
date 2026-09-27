import { create } from 'zustand';

export type FormatAction = 
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bold' 
  | 'italic' 
  | 'strike' 
  | 'highlight'
  | 'code' 
  | 'link' 
  | 'quote'
  | 'bullet' 
  | 'ordered' 
  | 'task'
  | 'hr';

export type ActionCategory = 'headings' | 'styling' | 'lists' | 'structure';

export interface ActionMetadata {
  id: FormatAction;
  label: string;
  category: ActionCategory;
  categoryLabel: string;
  description: string;
  syntax: string;
  shortcut?: string;
}

export const ALL_TOOLBAR_ACTIONS: ActionMetadata[] = [
  // Headings
  { id: 'h1', label: 'H1', category: 'headings', categoryLabel: 'Typography & Headings', description: 'Primary Section Heading', syntax: '# Title', shortcut: 'Ctrl+1' },
  { id: 'h2', label: 'H2', category: 'headings', categoryLabel: 'Typography & Headings', description: 'Secondary Section Heading', syntax: '## Subtitle', shortcut: 'Ctrl+2' },
  { id: 'h3', label: 'H3', category: 'headings', categoryLabel: 'Typography & Headings', description: 'Subsection Header', syntax: '### Header', shortcut: 'Ctrl+3' },

  // Styling & Emphasis
  { id: 'bold', label: 'B', category: 'styling', categoryLabel: 'Styling & Emphasis', description: 'Bold Strong Emphasis', syntax: '**bold**', shortcut: 'Ctrl+B' },
  { id: 'italic', label: 'I', category: 'styling', categoryLabel: 'Styling & Emphasis', description: 'Italic Emphasis', syntax: '*italic*', shortcut: 'Ctrl+I' },
  { id: 'strike', label: 'S', category: 'styling', categoryLabel: 'Styling & Emphasis', description: 'Strikethrough', syntax: '~~strike~~', shortcut: 'Alt+Shift+5' },
  { id: 'highlight', label: 'HL', category: 'styling', categoryLabel: 'Styling & Emphasis', description: 'Text Highlight Marker', syntax: '==highlight==', shortcut: '==text==' },
  { id: 'code', label: '</>', category: 'styling', categoryLabel: 'Styling & Emphasis', description: 'Inline Monospace Code', syntax: '`code`', shortcut: 'Ctrl+`' },

  // Lists & Citations
  { id: 'bullet', label: '• List', category: 'lists', categoryLabel: 'Lists & Quotes', description: 'Unordered Bullet List', syntax: '- item', shortcut: 'Ctrl+Shift+8' },
  { id: 'ordered', label: '1. List', category: 'lists', categoryLabel: 'Lists & Quotes', description: 'Numbered Ordered List', syntax: '1. item', shortcut: 'Ctrl+Shift+7' },
  { id: 'task', label: '☑ Task', category: 'lists', categoryLabel: 'Lists & Quotes', description: 'Interactive Todo Checkbox', syntax: '- [ ] task', shortcut: '- [ ]' },
  { id: 'quote', label: 'Quote', category: 'lists', categoryLabel: 'Lists & Quotes', description: 'Indented Blockquote', syntax: '> quote', shortcut: 'Ctrl+Shift+.' },

  // Structure
  { id: 'link', label: 'Link', category: 'structure', categoryLabel: 'Structure & Links', description: 'Markdown Hyperlink', syntax: '[label](url)', shortcut: 'Ctrl+K' },
  { id: 'hr', label: 'Divider', category: 'structure', categoryLabel: 'Structure & Links', description: 'Horizontal Rule Separator', syntax: '---', shortcut: '---' },
];

export const DEFAULT_ENABLED_ACTIONS: FormatAction[] = [
  'bold',
  'italic',
  'strike',
  'code',
  'link',
  'quote',
  'bullet',
  'ordered'
];

const STORAGE_KEY = 'md_writer_floating_toolbar_config_v2';

interface ToolbarSettingsState {
  enabledActions: FormatAction[];
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleAction: (id: FormatAction) => void;
  enableAction: (id: FormatAction) => void;
  disableAction: (id: FormatAction) => void;
  moveAction: (fromIndex: number, toIndex: number) => void;
  reorderActions: (newActions: FormatAction[]) => void;
  resetDefaults: () => void;
}

const loadSavedActions = (): FormatAction[] => {
  if (typeof window === 'undefined') return DEFAULT_ENABLED_ACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ENABLED_ACTIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const valid = parsed.filter((id) => ALL_TOOLBAR_ACTIONS.some((a) => a.id === id));
      if (valid.length > 0) return valid;
    }
  } catch (e) {
    console.warn('Failed to parse toolbar settings', e);
  }
  return DEFAULT_ENABLED_ACTIONS;
};

export const useToolbarSettingsStore = create<ToolbarSettingsState>((set) => ({
  enabledActions: loadSavedActions(),
  isOpen: false,
  openSettings: () => set({ isOpen: true }),
  closeSettings: () => set({ isOpen: false }),
  toggleAction: (id) =>
    set((state) => {
      let updated: FormatAction[];
      if (state.enabledActions.includes(id)) {
        if (state.enabledActions.length <= 1) return state; // Preserve at least one active tool
        updated = state.enabledActions.filter((a) => a !== id);
      } else {
        updated = [...state.enabledActions, id];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save toolbar settings', e);
      }
      return { enabledActions: updated };
    }),
  enableAction: (id) =>
    set((state) => {
      if (state.enabledActions.includes(id)) return state;
      const updated = [...state.enabledActions, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save toolbar settings', e);
      }
      return { enabledActions: updated };
    }),
  disableAction: (id) =>
    set((state) => {
      if (!state.enabledActions.includes(id)) return state;
      if (state.enabledActions.length <= 1) return state;
      const updated = state.enabledActions.filter((a) => a !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save toolbar settings', e);
      }
      return { enabledActions: updated };
    }),
  moveAction: (fromIndex, toIndex) =>
    set((state) => {
      if (fromIndex < 0 || fromIndex >= state.enabledActions.length) return state;
      if (toIndex < 0 || toIndex >= state.enabledActions.length) return state;
      const updated = [...state.enabledActions];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save toolbar settings', e);
      }
      return { enabledActions: updated };
    }),
  reorderActions: (newActions) =>
    set(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newActions));
      } catch (e) {
        console.warn('Failed to save toolbar settings', e);
      }
      return { enabledActions: newActions };
    }),
  resetDefaults: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENABLED_ACTIONS));
    } catch (e) {
      console.warn('Failed to save toolbar settings', e);
    }
    set({ enabledActions: DEFAULT_ENABLED_ACTIONS });
  },
}));
