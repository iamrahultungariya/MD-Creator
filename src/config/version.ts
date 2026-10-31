export const APP_VERSION = '3.0.0';
export const APP_VERSION_LABEL = 'v3.0.0';
export const APP_VERSION_FULL = 'v3.0.0 (Mimo 2.0.0 & Ultra Performance)';
export const MIMO_VERSION = '2.0.0';
export const MIMO_VERSION_LABEL = 'v2.0.0';
export const getUpdateStorageKey = (version: string = APP_VERSION) => `md_writer_seen_update_${version}`;
