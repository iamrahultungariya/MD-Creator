import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DocumentFilterState {
  searchQuery: string;
  activeTag: string;
  currentTab: 'active' | 'trash';
  viewMode: 'grid' | 'list';
  setSearchQuery: (query: string) => void;
  setActiveTag: (tag: string) => void;
  setCurrentTab: (tab: 'active' | 'trash') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  resetFilters: () => void;
}

export const useDocumentFilterStore = create<DocumentFilterState>()(
  persist(
    (set) => ({
      searchQuery: '',
      activeTag: 'All',
      currentTab: 'active',
      viewMode: 'grid',

      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setActiveTag: (tag: string) => set({ activeTag: tag }),
      setCurrentTab: (tab: 'active' | 'trash') => set({ currentTab: tab }),
      setViewMode: (mode: 'grid' | 'list') => set({ viewMode: mode }),
      resetFilters: () => set({ searchQuery: '', activeTag: 'All' }),
    }),
    {
      name: 'md-writer-document-filters',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
