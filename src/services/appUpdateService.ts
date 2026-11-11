import { APP_VERSION } from '../config/version';
import { useUpdateModalStore } from '../stores/useUpdateModalStore';

let swRegistration: ServiceWorkerRegistration | null = null;
let updateSWFn: ((reloadPage?: boolean) => Promise<void>) | null = null;
let isCheckingUpdate = false;
let lastCheckTime = 0;

/**
 * Compares two semantic version strings (e.g., '2.2.2' vs '2.2.1').
 * Returns 1 if a > b, -1 if a < b, 0 if equal.
 */
export function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^[vV]/, '').split('.').map((x) => parseInt(x, 10) || 0);
  const pb = b.replace(/^[vV]/, '').split('.').map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export const appUpdateService = {
  /**
   * Captures the active ServiceWorker registration and reload function from virtual:pwa-register.
   */
  setRegistration(
    registration?: ServiceWorkerRegistration | null,
    updateFn?: ((reloadPage?: boolean) => Promise<void>) | null
  ) {
    if (registration) swRegistration = registration;
    if (updateFn) updateSWFn = updateFn;
  },

  /**
   * Pings /version.json with cache-busting to detect if a newer release has been deployed.
   * Throttled to at most once every 10 seconds to prevent excess network hits.
   */
  async checkForAppUpdate(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - lastCheckTime < 10000) {
      return false;
    }
    if (isCheckingUpdate) return false;

    isCheckingUpdate = true;
    lastCheckTime = now;

    try {
      // 1. Proactively prompt the ServiceWorker to check for script updates
      if (swRegistration && typeof swRegistration.update === 'function') {
        swRegistration.update().catch(() => {});
      }

      // 2. Query tiny static endpoint (<100 bytes) with cache: no-store
      const res = await fetch(`/version.json?_t=${now}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (!res.ok) return false;

      const data = await res.json();
      const serverVersion = typeof data?.version === 'string' ? data.version : null;

      if (serverVersion && compareSemver(serverVersion, APP_VERSION) > 0) {
        useUpdateModalStore.getState().setPendingAppUpdate(serverVersion);
        window.dispatchEvent(
          new CustomEvent('md-writer-app-update-available', { detail: { version: serverVersion } })
        );
        return true;
      }
      return false;
    } catch {
      // Gracefully ignore offline or intermittent network glitches
      return false;
    } finally {
      isCheckingUpdate = false;
    }
  },

  /**
   * Flushes any in-flight local notes, activates the waiting service worker,
   * and refreshes the application seamlessly.
   */
  async applyAppUpdate(): Promise<void> {
    // 1. Notify open editors to flush unsaved text to Dexie
    window.dispatchEvent(new CustomEvent('md-writer-flush-drafts'));

    // Allow 80ms for synchronous IndexedDB transactions to queue
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (updateSWFn) {
      try {
        await updateSWFn(true);
        return;
      } catch (err) {
        console.warn('[AppUpdateService] SW update error, falling back to window.location.reload:', err);
      }
    }

    // Direct fallback reload
    window.location.reload();
  },
};
