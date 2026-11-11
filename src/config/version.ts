export const APP_VERSION = '2.2.1';
export const APP_VERSION_LABEL = 'v2.2.1';
export const APP_VERSION_FULL = 'v2.2.1 (Instant Cross-Device Sync, Realtime Conflict Guard & Sub-3s Update Detection)';
export const MIMO_VERSION = '2.2.1';
export const MIMO_VERSION_LABEL = 'v2.2.1';
export const getUpdateStorageKey = (version: string = APP_VERSION) => `md_writer_seen_update_${version}`;
