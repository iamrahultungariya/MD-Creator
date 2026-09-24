import { db, StoredImage } from '../db';
import { optimizeImage, CompressionOptions } from '../utils/imageCompressor';

// In-memory cache for zero-latency synchronous preview lookups
const inMemoryImageCache = new Map<string, string>();

/**
 * Generates a collision-resistant image ID using cryptographic randomness.
 * Format: "img_" + 12 alphanumeric characters.
 * Example: "img_k9x2m4p8w1q7"
 */
export function generateShortImageId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 12; i++) array[i] = Math.floor(Math.random() * 256);
  }
  let rand = '';
  for (let i = 0; i < 12; i++) {
    rand += chars[array[i] % chars.length];
  }
  return `img_${rand}`;
}

export interface StoredImageResult {
  id: string;
  name: string;
  shortUrl: string; // e.g. "image://img_k9x2m4p8w1q7"
  markdownTag: string; // e.g. "![My Photo](image://img_k9x2m4p8w1q7)"
  dataUrl: string;
  sizeBytes: number;
}

/**
 * Compresses an image and stores it locally in Dexie IndexedDB.
 * Returns a short image identifier and clean markdown tag,
 * avoiding polluting the markdown text with 500+ lines of raw Base64.
 */
export async function storeOptimizedImage(
  fileOrBlob: File | Blob,
  fileName?: string,
  options?: CompressionOptions
): Promise<StoredImageResult> {
  const name = fileName || (fileOrBlob instanceof File ? fileOrBlob.name : 'image.png');
  const cleanDisplayName = name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Image';

  // Compress using client-side canvas WebP optimizer
  const compressionResult = await optimizeImage(fileOrBlob, name, options);
  
  // Generate unique collision-checked ID
  let id = generateShortImageId();
  try {
    let attempts = 0;
    while (attempts < 5 && (await db.images.get(id))) {
      id = generateShortImageId();
      attempts++;
    }
  } catch {}

  const record: StoredImage = {
    id,
    name: cleanDisplayName,
    dataUrl: compressionResult.dataUrl,
    mimeType: compressionResult.mimeType,
    sizeBytes: compressionResult.compressedSize,
    createdAt: Date.now()
  };

  // Cache in memory immediately
  inMemoryImageCache.set(id, record.dataUrl);
  inMemoryImageCache.set(`image://${id}`, record.dataUrl);

  // Persist into Dexie IndexedDB
  try {
    await db.images.put(record);
  } catch (err) {
    console.warn('[ImageStorage] Failed to persist into Dexie:', err);
  }

  const shortUrl = `image://${id}`;
  const markdownTag = `![${cleanDisplayName}](${shortUrl})`;

  return {
    id,
    name: cleanDisplayName,
    shortUrl,
    markdownTag,
    dataUrl: record.dataUrl,
    sizeBytes: record.sizeBytes
  };
}

/**
 * Directly store a pre-existing Data URL (e.g. from an image embed modal) with a short ID.
 */
export async function storeDataUrlImage(
  dataUrl: string,
  fileName = 'image.png'
): Promise<StoredImageResult> {
  const cleanDisplayName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Image';
  const id = generateShortImageId();

  const mimeMatch = dataUrl.match(/^data:(image\/[a-zA-Z+]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const estimatedSize = Math.round((dataUrl.length * 3) / 4);

  const record: StoredImage = {
    id,
    name: cleanDisplayName,
    dataUrl,
    mimeType,
    sizeBytes: estimatedSize,
    createdAt: Date.now()
  };

  inMemoryImageCache.set(id, dataUrl);
  inMemoryImageCache.set(`image://${id}`, dataUrl);

  try {
    await db.images.put(record);
  } catch (err) {
    console.warn('[ImageStorage] Failed to persist dataUrl into Dexie:', err);
  }

  const shortUrl = `image://${id}`;
  const markdownTag = `![${cleanDisplayName}](${shortUrl})`;

  return {
    id,
    name: cleanDisplayName,
    shortUrl,
    markdownTag,
    dataUrl,
    sizeBytes: estimatedSize
  };
}

/**
 * Synchronously checks in-memory cache for a resolved image src.
 */
export function getCachedImageSrc(srcOrId: string): string | null {
  if (!srcOrId) return null;
  const cleanId = srcOrId.replace(/^image:\/\//, '').trim();
  return inMemoryImageCache.get(cleanId) || inMemoryImageCache.get(srcOrId) || null;
}

/**
 * Resolves a markdown image URI (e.g. "image://img_a8f2q" or "img_a8f2q") to its real Data URL from IndexedDB.
 * If the src is an external URL (http://, https://) or raw data URL, it returns it directly.
 */
export async function resolveImageSrc(srcOrId: string): Promise<string> {
  if (!srcOrId) return '';

  // If already a web URL or data URL, return as is
  if (srcOrId.startsWith('http://') || srcOrId.startsWith('https://') || srcOrId.startsWith('data:')) {
    return srcOrId;
  }

  // Extract ID from "image://img_xxxx" or "img_xxxx"
  const cleanId = srcOrId.replace(/^image:\/\//, '').trim();

  // Check in-memory cache first
  const cached = inMemoryImageCache.get(cleanId) || inMemoryImageCache.get(srcOrId);
  if (cached) return cached;

  try {
    const record = await db.images.get(cleanId);
    if (record?.dataUrl) {
      inMemoryImageCache.set(cleanId, record.dataUrl);
      inMemoryImageCache.set(`image://${cleanId}`, record.dataUrl);
      return record.dataUrl;
    }
  } catch (err) {
    console.warn('[ImageStorage] Error resolving image from Dexie:', err);
  }

  return srcOrId;
}

/**
 * Delete a stored image by ID.
 */
export async function deleteStoredImage(id: string): Promise<void> {
  const cleanId = id.replace(/^image:\/\//, '').trim();
  inMemoryImageCache.delete(cleanId);
  inMemoryImageCache.delete(`image://${cleanId}`);
  try {
    await db.images.delete(cleanId);
  } catch (err) {
    console.warn('[ImageStorage] Failed to delete image from Dexie:', err);
  }
}
