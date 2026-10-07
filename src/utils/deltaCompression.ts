import DiffMatchPatch from 'diff-match-patch';
import LZString from 'lz-string';

const dmp = new DiffMatchPatch();

// Configure diff-match-patch for fast text processing
dmp.Diff_Timeout = 1.0; // 1 second timeout
dmp.Diff_EditCost = 4;
dmp.Match_Distance = 1000;

export const SNAPSHOT_INTERVAL = 20; // Every 20 revisions is a full snapshot
export const MAX_REVISIONS_CAP = 50; // Cap revisions per document to 50
export const IDLE_COALESCE_MS = 45000; // 45 seconds idle coalesce debounce

/**
 * Compresses string using LZString UTF16 encoding.
 * Achieves 3x - 5x compression on Markdown documents.
 */
export function compressText(text: string): string {
  if (!text) return '';
  try {
    return LZString.compressToUTF16(text);
  } catch (err) {
    console.warn('[DeltaCompression] Compression failed, returning uncompressed:', err);
    return text;
  }
}

/**
 * Decompresses LZString UTF16 encoded string.
 */
export function decompressText(compressed: string): string {
  if (!compressed) return '';
  try {
    const result = LZString.decompressFromUTF16(compressed);
    return result !== null ? result : compressed;
  } catch (err) {
    console.warn('[DeltaCompression] Decompression failed, returning raw:', err);
    return compressed;
  }
}

/**
 * Generates a diff-match-patch delta patch string from baseText to newText.
 */
export function createDeltaPatch(baseText: string, newText: string): string {
  try {
    const patches = dmp.patch_make(baseText, newText);
    return dmp.patch_toText(patches);
  } catch (err) {
    console.warn('[DeltaCompression] Patch generation failed:', err);
    return '';
  }
}

/**
 * Applies a diff-match-patch delta patch onto baseText to reconstruct newText.
 */
export function applyDeltaPatch(baseText: string, patchText: string): string {
  if (!patchText) return baseText;
  try {
    const patches = dmp.patch_fromText(patchText);
    const [result] = dmp.patch_apply(patches, baseText);
    return result;
  } catch (err) {
    console.warn('[DeltaCompression] Patch application failed, returning base:', err);
    return baseText;
  }
}

/**
 * Calculates compression percentage saved (e.g. 74%).
 */
export function calculateSpaceSavings(rawBytes: number, compressedBytes: number): number {
  if (rawBytes <= 0) return 0;
  const saved = Math.max(0, rawBytes - compressedBytes);
  return Math.round((saved / rawBytes) * 100);
}
