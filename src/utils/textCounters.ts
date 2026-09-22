/**
 * High-performance, zero-allocation text analysis counters.
 * Specially designed for 5,000+ line torture tests and real-time 60FPS editor typing.
 * Never creates intermediate arrays or splits strings in memory.
 */

/**
 * Counts total words in a string with a single-pass character scan.
 * O(N) time complexity, O(1) space complexity, zero garbage collector pressure.
 */
export function fastCountWords(str: string): number {
  if (!str) return 0;
  let count = 0;
  let inWord = false;
  const len = str.length;

  for (let i = 0; i < len; i++) {
    const code = str.charCodeAt(i);
    // ASCII whitespace codes: \t (9), \n (10), \v (11), \f (12), \r (13), space (32)
    if (code <= 32) {
      inWord = false;
    } else if (!inWord) {
      inWord = true;
      count++;
    }
  }

  return count;
}

/**
 * Counts total lines in a string by scanning newline characters (\n).
 * Zero string splits, zero array allocations.
 */
export function fastCountLines(str: string): number {
  if (!str) return 1;
  let count = 1;
  const len = str.length;

  for (let i = 0; i < len; i++) {
    if (str.charCodeAt(i) === 10) {
      count++;
    }
  }

  return count;
}

/**
 * Calculates approximate reading time in minutes (assumes standard 200 WPM).
 */
export function fastCalculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}
