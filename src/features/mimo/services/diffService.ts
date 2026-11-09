import DiffMatchPatch from 'diff-match-patch';
import { MimoDiffHunk, MimoToolCall, MimoClarificationData } from '../types/mimoTypes';

const dmp = new DiffMatchPatch();
dmp.Match_Distance = 5000;
dmp.Match_Threshold = 0.5; // Resilient fuzzy match threshold
dmp.Patch_DeleteThreshold = 0.5;

export function extractClarificationFromResponse(aiResponse: string): {
  cleanText: string;
  clarification: MimoClarificationData | null;
} {
  const clarificationRegex = /```(?:json:)?(?:mimo-clarification|mimo-quiz|clarification)\s*([\s\S]*?)```/i;
  const match = aiResponse.match(clarificationRegex);
  if (match) {
    try {
      // Clean up common AI JSON formatting quirks (trailing commas, escaped quotes)
      const sanitizedJsonStr = match[1]
        .trim()
        .replace(/,\s*([\]}])/g, '$1');

      const parsed = JSON.parse(sanitizedJsonStr);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        const clarification: MimoClarificationData = {
          id: `clarification-${Date.now()}`,
          title: parsed.title || 'Interactive Questions from your Document',
          description: parsed.description,
          questions: parsed.questions.map((q: any, idx: number) => ({
            id: q.id || `q-${idx}`,
            question: q.question || 'Please select an option:',
            type: q.type === 'multi' ? 'multi' : 'single',
            options: Array.isArray(q.options) && q.options.length > 0
              ? q.options.slice(0, 4)
              : ['Option A', 'Option B', 'Option C'],
            allowCustom: q.allowCustom ?? true,
          })),
          isSubmitted: false,
        };
        let cleanText = aiResponse.replace(clarificationRegex, '').trim();
        // Prevent empty response rendering if AI only emitted the clarification block
        if (!cleanText) {
          cleanText = parsed.title || 'Here are interactive questions based on your document:';
        }
        return { cleanText, clarification };
      }
    } catch (err) {
      console.warn('[extractClarificationFromResponse] JSON parse failed:', err);
    }
  }
  return { cleanText: aiResponse, clarification: null };
}

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
  // Pattern 0: Search / Replace blocks (<<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE)
  const searchReplaceRegex = /<<<<<<< SEARCH\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> REPLACE/;
  const srMatch = aiResponse.match(searchReplaceRegex);
  if (srMatch) {
    const orig = srMatch[1];
    const prop = srMatch[2];
    const hunk: MimoDiffHunk = {
      id: `hunk-${Date.now()}`,
      originalLines: orig,
      proposedLines: prop,
      explanation: 'Review the modified lines below before applying.',
    };
    const cleanText = aiResponse.replace(searchReplaceRegex, '').trim();
    return { cleanText, hunk };
  }

  // Pattern 1: Explicit diff code block
  const diffBlockRegex = /```diff\r?\n([\s\S]*?)```/;
  const match = aiResponse.match(diffBlockRegex);

  if (match) {
    const rawDiff = match[1];

    // Check if inner diff contains SEARCH/REPLACE
    const innerSr = rawDiff.match(/<<<<<<< SEARCH\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> REPLACE/);
    if (innerSr) {
      const orig = innerSr[1];
      const prop = innerSr[2];
      const hunk: MimoDiffHunk = {
        id: `hunk-${Date.now()}`,
        originalLines: orig,
        proposedLines: prop,
        explanation: 'Review the modified lines below before applying.',
      };
      const cleanText = aiResponse.replace(diffBlockRegex, '').trim();
      return { cleanText, hunk };
    }

    const removed: string[] = [];
    const added: string[] = [];

    const lines = rawDiff.split('\n');
    for (const l of lines) {
      if (l.startsWith('@@') || l.startsWith('---') || l.startsWith('+++')) {
        continue;
      }
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
  const replaceBlockRegex = /```replacement\r?\n([\s\S]*?)```/;
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
 * 1. Pure insertion / generation fallback
 * 2. Exact substring match
 * 3. Trimmed substring match
 * 4. Normalized line-endings match (\r\n vs \n)
 * 5. Whitespace-tolerant line-by-line sliding window scan with internal blank-line preservation
 * 6. DiffMatchPatch fuzzy patch application (Google DMP algorithm with tolerance)
 * 7. First/Last Anchor Matching for refactored sections
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
  const normProp = prop.replace(/\r\n/g, '\n');

  if (normDoc.includes(normOrig)) {
    const nextContent = normDoc.replace(normOrig, normProp);
    return { nextContent, success: true };
  }

  if (origTrimmed && normDoc.includes(normOrig.trim())) {
    const nextContent = normDoc.replace(normOrig.trim(), normProp.trim());
    return { nextContent, success: true };
  }

  // Tier 5: Line-by-line whitespace-tolerant sliding window scan
  // Note: We trim leading/trailing blank lines but PRESERVE internal blank lines for accurate line mapping!
  const docLines = normDoc.split('\n');
  const rawOrigLines = normOrig.split('\n');

  let startIdx = 0;
  while (startIdx < rawOrigLines.length && !rawOrigLines[startIdx].trim()) startIdx++;
  let endIdx = rawOrigLines.length - 1;
  while (endIdx >= 0 && !rawOrigLines[endIdx].trim()) endIdx--;

  const origLines = rawOrigLines.slice(startIdx, endIdx + 1);

  if (origLines.length > 0) {
    const origLen = origLines.length;
    const firstOrigTrim = origLines[0].trim();

    for (let i = 0; i <= docLines.length - origLen; i++) {
      if (docLines[i].trim() === firstOrigTrim) {
        let allMatch = true;
        for (let j = 1; j < origLen; j++) {
          if (docLines[i + j].trim() !== origLines[j].trim()) {
            allMatch = false;
            break;
          }
        }

        if (allMatch) {
          const before = docLines.slice(0, i);
          const after = docLines.slice(i + origLen);
          const nextLines = [...before, normProp, ...after];
          return { nextContent: nextLines.join('\n'), success: true };
        }
      }
    }
  }

  // Tier 6: DiffMatchPatch fuzzy patch fallback
  // Tolerant to minor indentation, spacing, or surrounding context drift
  try {
    const patches = dmp.patch_make(normOrig, normProp);
    if (patches && patches.length > 0) {
      const [patchedResult, results] = dmp.patch_apply(patches, normDoc);
      if (results && results.some(Boolean)) {
        return { nextContent: patchedResult, success: true };
      }
    }
  } catch (err) {
    console.warn('[applyDiffHunkToDocument] DMP patch fallback error:', err);
  }

  // Tier 7: Anchor matching (first and last significant line)
  if (origLines.length >= 3) {
    const firstAnchor = origLines[0].trim();
    const lastAnchor = origLines[origLines.length - 1].trim();

    let firstMatchIdx = -1;
    let matchCountFirst = 0;
    for (let i = 0; i < docLines.length; i++) {
      if (docLines[i].trim() === firstAnchor) {
        firstMatchIdx = i;
        matchCountFirst++;
      }
    }

    if (matchCountFirst === 1 && firstMatchIdx !== -1) {
      for (let j = firstMatchIdx + 1; j < Math.min(docLines.length, firstMatchIdx + origLines.length * 3); j++) {
        if (docLines[j].trim() === lastAnchor) {
          const before = docLines.slice(0, firstMatchIdx);
          const after = docLines.slice(j + 1);
          const nextLines = [...before, normProp, ...after];
          return { nextContent: nextLines.join('\n'), success: true };
        }
      }
    }
  }

  return { nextContent: currentContent, success: false };
}
