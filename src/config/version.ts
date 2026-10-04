export const APP_VERSION = '1.0.0';
export const APP_VERSION_LABEL = 'v1.0.0';
export const APP_VERSION_FULL = 'v1.0.0 (Official Launch)';
export const getUpdateStorageKey = (version: string = APP_VERSION) => `md_writer_seen_update_${version}`;
