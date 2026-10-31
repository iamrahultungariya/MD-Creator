import { MimoDiffHunk, MimoToolCall } from '../types/mimoTypes';

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

/**
 * Extracts structured tool calls (```tool_call { ... } ```) emitted by Mimo,
 * parsing arguments and cleaning the chat text.
 */
export function extractToolCallFromResponse(aiResponse: string): {
  cleanText: string;
  toolCall: MimoToolCall | null;
} {
  const toolCallRegex = /```(?:tool_call|tool|action|json:tool)\n([\s\S]*?)```/i;
  const match = aiResponse.match(toolCallRegex);

  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && parsed.name) {
        const toolCall: MimoToolCall = {
          id: `tool-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: parsed.name,
          arguments: parsed.arguments || parsed.args || {},
          isApplied: false,
          isDiscarded: false,
        };
        const cleanText = aiResponse.replace(toolCallRegex, '').trim();
        return { cleanText, toolCall };
      }
    } catch {
      // If JSON parsing fails, retain raw text
    }
  }

  return { cleanText: aiResponse, toolCall: null };
}

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
      if (l.startsWith('-')) {
        removed.push(l.replace(/^-\s?/, ''));
      } else if (l.startsWith('+')) {
        added.push(l.replace(/^\+\s?/, ''));
      }
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
 * Employs multi-tier matching:
 * 1. Exact substring match
 * 2. Trimmed match
 * 3. Normalized line-endings match (\r\n vs \n)
 * 4. Whitespace-tolerant sliding window line scan
 * 5. Safe append fallback for pure additions
 */
export function applyDiffHunkToDocument(
  currentContent: string,
  hunk: MimoDiffHunk
): { nextContent: string; success: boolean } {
  const orig = hunk.originalLines;
  const prop = hunk.proposedLines;

  // Tier 1: Pure insertion / generation
  if (!orig && prop) {
    const nextContent = currentContent.trim()
      ? `${currentContent.trim()}\n\n${prop}\n`
      : `${prop}\n`;
    return { nextContent, success: true };
  }

  // Tier 2: Exact substring match
  if (orig && currentContent.includes(orig)) {
    const nextContent = currentContent.replace(orig, prop);
    return { nextContent, success: true };
  }

  // Tier 3: Trimmed substring match
  const origTrimmed = orig.trim();
  if (origTrimmed && currentContent.includes(origTrimmed)) {
    const nextContent = currentContent.replace(origTrimmed, prop.trim());
    return { nextContent, success: true };
  }

  // Tier 4: Normalized line-endings match (\r\n vs \n)
  const normDoc = currentContent.replace(/\r\n/g, '\n');
  const normOrig = orig.replace(/\r\n/g, '\n');
  if (normDoc.includes(normOrig)) {
    const nextContent = normDoc.replace(normOrig, prop);
    return { nextContent, success: true };
  }

  // Tier 5: Line-by-line whitespace-tolerant sliding window scan
  const docLines = normDoc.split('\n');
  const origLines = normOrig.split('\n').filter((l) => l.trim().length > 0);

  if (origLines.length > 0) {
    const firstOrigTrim = origLines[0].trim();

    for (let i = 0; i < docLines.length; i++) {
      if (docLines[i].trim() === firstOrigTrim) {
        let allMatch = true;
        for (let j = 1; j < origLines.length; j++) {
          if (i + j >= docLines.length || docLines[i + j].trim() !== origLines[j].trim()) {
            allMatch = false;
            break;
          }
        }

        if (allMatch) {
          const before = docLines.slice(0, i);
          const after = docLines.slice(i + origLines.length);
          const nextLines = [...before, prop, ...after];
          return { nextContent: nextLines.join('\n'), success: true };
        }
      }
    }
  }

  return { nextContent: currentContent, success: false };
}
