import { create } from 'zustand';

export interface RemoteDeletionConflict {
  id: string;
  title: string;
  deletedAt: number;
  localUpdatedAt: number;
  snippet?: string;
  wordCount?: number;
}

const RESOLVED_TOMBSTONES_KEY = 'md_writer_resolved_tombstones';
const LOCAL_ONLY_DOCS_KEY = 'md_writer_local_only_docs';

export function getResolvedTombstones(): Record<string, number> {
  try {
    const raw = localStorage.getItem(RESOLVED_TOMBSTONES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markTombstoneResolved(docId: string, deletedAt: number): void {
  try {
    const map = getResolvedTombstones();
    map[docId] = deletedAt;
    localStorage.setItem(RESOLVED_TOMBSTONES_KEY, JSON.stringify(map));
  } catch {}
}

export function isTombstoneResolved(docId: string, deletedAt: number): boolean {
  const map = getResolvedTombstones();
  const recorded = map[docId];
  return recorded !== undefined && recorded >= deletedAt;
}

export function getLocalOnlyDocs(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_ONLY_DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markDocLocalOnly(docId: string): void {
  try {
    const list = getLocalOnlyDocs();
    if (!list.includes(docId)) {
      localStorage.setItem(LOCAL_ONLY_DOCS_KEY, JSON.stringify([...list, docId]));
    }
  } catch {}
}

export function removeDocLocalOnly(docId: string): void {
  try {
    const list = getLocalOnlyDocs().filter((id) => id !== docId);
    localStorage.setItem(LOCAL_ONLY_DOCS_KEY, JSON.stringify(list));
  } catch {}
}

export function isDocumentLocalOnly(docId: string): boolean {
  return getLocalOnlyDocs().includes(docId);
}

interface CrossDeviceConflictState {
  conflicts: RemoteDeletionConflict[];
  isOpen: boolean;
  setConflicts: (conflicts: RemoteDeletionConflict[]) => void;
  addConflicts: (newConflicts: RemoteDeletionConflict[]) => void;
  removeConflict: (id: string) => void;
  clearConflicts: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useCrossDeviceConflictStore = create<CrossDeviceConflictState>((set) => ({
  conflicts: [],
  isOpen: false,
  setConflicts: (conflicts) => set({ conflicts, isOpen: conflicts.length > 0 }),
  addConflicts: (newConflicts) =>
    set((state) => {
      const existingIds = new Set(state.conflicts.map((c) => c.id));
      const filteredNew = newConflicts.filter((c) => !existingIds.has(c.id));
      if (filteredNew.length === 0) return state;
      const merged = [...state.conflicts, ...filteredNew];
      return { conflicts: merged, isOpen: true };
    }),
  removeConflict: (id) =>
    set((state) => {
      const remaining = state.conflicts.filter((c) => c.id !== id);
      return { conflicts: remaining, isOpen: remaining.length > 0 };
    }),
  clearConflicts: () => set({ conflicts: [], isOpen: false }),
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
