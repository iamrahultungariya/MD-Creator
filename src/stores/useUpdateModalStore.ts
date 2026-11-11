import { create } from 'zustand';
import { APP_VERSION, getUpdateStorageKey } from '../config/version';

interface UpdateModalState {
  isUpdateOpen: boolean;
  isMimoIntroOpen: boolean;
  hasPendingAppUpdate: boolean;
  newServerVersion: string | null;
  openUpdate: () => void;
  closeUpdate: () => void;
  openMimoIntro: () => void;
  closeMimoIntro: () => void;
  checkAndAutoOpen: () => void;
  setPendingAppUpdate: (version: string) => void;
  dismissPendingAppUpdate: () => void;
}

const DISMISSED_BANNER_KEY = 'md_writer_dismissed_update_banner_';

export const useUpdateModalStore = create<UpdateModalState>((set, get) => ({
  isUpdateOpen: false,
  isMimoIntroOpen: false,
  hasPendingAppUpdate: false,
  newServerVersion: null,
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
  setPendingAppUpdate: (version: string) => {
    try {
      const isDismissed = sessionStorage.getItem(`${DISMISSED_BANNER_KEY}${version}`);
      if (isDismissed) return;
    } catch {}
    set({ hasPendingAppUpdate: true, newServerVersion: version });
  },
  dismissPendingAppUpdate: () => {
    const version = get().newServerVersion;
    if (version) {
      try {
        sessionStorage.setItem(`${DISMISSED_BANNER_KEY}${version}`, 'true');
      } catch {}
    }
    set({ hasPendingAppUpdate: false });
  },
}));
