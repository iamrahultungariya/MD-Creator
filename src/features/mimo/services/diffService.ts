import { MimoDiffHunk } from '../types/mimoTypes';

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  originalLineNum?: number;
  proposedLineNum?: number;
}

/**
 * Computes a line-level diff between original and proposed text,
 * extracting only the changed lines and minimal surrounding context.
 */
export function computeLineDiff(original: string, proposed: string): {
  lines: DiffLine[];
  additions: number;
  deletions: number;
} {
  const origLines = original.split('\n');
  const propLines = proposed.split('\n');

  let additions = 0;
  let deletions = 0;
  const result: DiffLine[] = [];

  // Simple and resilient Myers-style line diffing
  let i = 0;
  let j = 0;

  while (i < origLines.length || j < propLines.length) {
    if (i < origLines.length && j < propLines.length && origLines[i] === propLines[j]) {
      result.push({
        type: 'unchanged',
        text: origLines[i],
        originalLineNum: i + 1,
        proposedLineNum: j + 1,
      });
      i++;
      j++;
    } else {
      // Look ahead for resynchronization
      let foundJ = -1;
      let foundI = -1;
      for (let k = 1; k <= 5; k++) {
        if (i + k < origLines.length && origLines[i + k] === propLines[j]) {
          foundI = i + k;
          break;
        }
        if (j + k < propLines.length && origLines[i] === propLines[j + k]) {
          foundJ = j + k;
          break;
        }
      }

      if (foundJ !== -1) {
        // Additions in proposed
        while (j < foundJ) {
          result.push({
            type: 'added',
            text: propLines[j],
            proposedLineNum: j + 1,
          });
          additions++;
          j++;
        }
      } else if (foundI !== -1) {
        // Deletions from original
        while (i < foundI) {
          result.push({
            type: 'removed',
            text: origLines[i],
            originalLineNum: i + 1,
          });
          deletions++;
          i++;
        }
      } else {
        // Line replacement
        if (i < origLines.length) {
          result.push({
            type: 'removed',
            text: origLines[i],
            originalLineNum: i + 1,
          });
          deletions++;
          i++;
        }
        if (j < propLines.length) {
          result.push({
            type: 'added',
            text: propLines[j],
            proposedLineNum: j + 1,
          });
          additions++;
          j++;
        }
      }
    }
  }

  return { lines: result, additions, deletions };
}

/**
 * Parses an AI response for structured diff or code blocks.
 * Looks for ```diff ... ``` or structured <<<ORIGINAL / <<<PROPOSED blocks.
 */
export function extractDiffHunkFromResponse(
  aiResponse: string,
  _currentDocContent: string
): { cleanText: string; hunk: MimoDiffHunk | null } {
  // Pattern 1: Explicit diff code block
  const diffBlockRegex = /```diff\n([\s\S]*?)```/;
  const match = aiResponse.match(diffBlockRegex);

  if (match) {
    const rawDiff = match[1];
    const removed: string[] = [];
    const added: string[] = [];

    const lines = rawDiff.split('\n');
    for (const l of lines) {
      if (l.startsWith('-')) removed.push(l.slice(1));
      else if (l.startsWith('+')) added.push(l.slice(1));
    }

    const orig = removed.join('\n');
    const prop = added.join('\n');

    if (orig || prop) {
      const hunk: MimoDiffHunk = {
        id: `hunk-${Date.now()}`,
        originalLines: orig,
        proposedLines: prop,
        explanation: 'Review the modified lines below before applying.',
      };
      const cleanText = aiResponse.replace(diffBlockRegex, '').trim();
      return { cleanText, hunk };
    }
  }

  // Pattern 2: Proposed replacement block
  const replaceBlockRegex = /```replacement\n([\s\S]*?)```/;
  const repMatch = aiResponse.match(replaceBlockRegex);
  if (repMatch) {
    const prop = repMatch[1].trim();
    const hunk: MimoDiffHunk = {
      id: `hunk-${Date.now()}`,
      originalLines: '', // will be located or appended
      proposedLines: prop,
      explanation: 'Mimo proposed new content to insert into your document.',
    };
    const cleanText = aiResponse.replace(replaceBlockRegex, '').trim();
    return { cleanText, hunk };
  }

  return { cleanText: aiResponse, hunk: null };
}

/**
 * Safely applies a MimoDiffHunk to document content without overwriting unrelated lines.
 */
export function applyDiffHunkToDocument(
  currentContent: string,
  hunk: MimoDiffHunk
): { nextContent: string; success: boolean } {
  const orig = hunk.originalLines.trim();
  const prop = hunk.proposedLines;

  // If original lines were found in the doc, replace only that exact slice
  if (orig && currentContent.includes(orig)) {
    const nextContent = currentContent.replace(orig, prop);
    return { nextContent, success: true };
  }

  // If original lines with normalized line breaks match
  const normalizedDoc = currentContent.replace(/\r\n/g, '\n');
  const normalizedOrig = orig.replace(/\r\n/g, '\n');
  if (normalizedDoc.includes(normalizedOrig)) {
    const nextContent = normalizedDoc.replace(normalizedOrig, prop);
    return { nextContent, success: true };
  }

  // If no original lines specified (pure insertion/generation), append cleanly
  if (!orig && prop) {
    const nextContent = currentContent.trim()
      ? `${currentContent.trim()}\n\n${prop}\n`
      : `${prop}\n`;
    return { nextContent, success: true };
  }

  return { nextContent: currentContent, success: false };
}
