import { create } from 'zustand';
import { APP_VERSION, getUpdateStorageKey } from '../config/version';

interface UpdateModalState {
  isUpdateOpen: boolean;
  isMimoIntroOpen: boolean;
  openUpdate: () => void;
  closeUpdate: () => void;
  openMimoIntro: () => void;
  closeMimoIntro: () => void;
  checkAndAutoOpen: () => void;
}

export const useUpdateModalStore = create<UpdateModalState>((set) => ({
  isUpdateOpen: false,
  isMimoIntroOpen: false,
  openUpdate: () => set({ isUpdateOpen: true }),
  closeUpdate: () => {
    try {
      localStorage.setItem(getUpdateStorageKey(APP_VERSION), 'true');
    } catch {
      // Ignore private browsing storage restriction
    }
    set({ isUpdateOpen: false });
  },
  openMimoIntro: () => set({ isMimoIntroOpen: true }),
  closeMimoIntro: () => set({ isMimoIntroOpen: false }),
  checkAndAutoOpen: () => {
    try {
      const seen = localStorage.getItem(getUpdateStorageKey(APP_VERSION));
      if (!seen) {
        set({ isUpdateOpen: true });
      }
    } catch {
      // Ignore
    }
  },
}));
