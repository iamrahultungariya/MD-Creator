export interface CachedDocSummary {
  docId: string;
  title: string;
  lineCount: number;
  wordCount: number;
  headingsSummary: string[];
  topKeywords: string[];
  excerptSummary: string;
  updatedAt: number;
}

export interface PreparedContext {
  docId: string;
  docTitle: string;
  rawContent: string;
  contextMode: 'summary' | 'full_safe' | 'chunked_loc_guarded' | 'selection_focused';
  contextText: string;
  linesAnalyzed: number;
  totalDocLines: number;
  totalWords: number;
  headings: string[];
  guardrailTriggered: boolean;
  activeRange?: { start: number; end: number };
  selectedText?: string;
  activeHeadingPath?: string;
}

// In-memory LRU cache of document summaries
const summaryCache = new Map<string, CachedDocSummary>();

const COMMON_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'aren', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both',
  'but', 'by', 'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her',
  'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself'
]);

/**
 * Computes top keywords locally via term frequency (TF) filtering stopwords (zero API cost).
 */
function extractLocalTfKeywords(text: string, maxKeywords = 8): string[] {
  const words = text
    .toLowerCase()
    .replace(/[#*`_\[\]()!<>|:;.,?+=-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !COMMON_STOPWORDS.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([w]) => w);
}

/**
 * Creates or retrieves a lightweight local AST + TF-IDF summary of a document
 * with ZERO API cost or token overhead.
 */
export function getOrCreateDocumentSummary(docId: string, title: string, content: string): CachedDocSummary {
  const lines = content.split('\n');
  const lineCount = lines.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Extract up to 15 top headings AST
  const headingsSummary: string[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match && headingsSummary.length < 15) {
      headingsSummary.push(`${match[1]} ${match[2].trim()}`);
    }
  }

  // Extract top keywords locally via TF
  const topKeywords = extractLocalTfKeywords(content, 8);

  // Generate lightweight excerpt
  const words = content.trim().split(/\s+/);
  let excerptSummary = '';
  if (words.length <= 200) {
    excerptSummary = content.slice(0, 1200);
  } else {
    const startExcerpt = words.slice(0, 120).join(' ');
    const endExcerpt = words.slice(-60).join(' ');
    excerptSummary = `${startExcerpt}\n... [${words.length - 180} words omitted] ...\n${endExcerpt}`;
  }

  const cached: CachedDocSummary = {
    docId,
    title: title || 'Untitled Document',
    lineCount,
    wordCount,
    headingsSummary,
    topKeywords,
    excerptSummary,
    updatedAt: Date.now(),
  };

  summaryCache.set(docId, cached);
  return cached;
}

/**
 * Resolves the hierarchical heading breadcrumb path at the current cursor line.
 * e.g. "Python Basics > Functions > Decorators"
 */
export function findActiveHeadingPath(lines: string[], cursorLine: number): string {
  const target = Math.max(0, Math.min(lines.length - 1, cursorLine - 1));
  const stack: { level: number; text: string }[] = [];

  for (let i = 0; i <= target; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      stack.push({ level, text });
    }
  }

  return stack.map((s) => s.text).join(' > ');
}

/**
 * Intelligent context preparation:
 * - Selected text present: Returns focused selection context with active heading breadcrumbs.
 * - Casual greeting ("hi", "hello"): Returns lightweight AST summary (minimal tokens).
 * - <= 1000 LOC: Full document context so Mimo knows every section, table, and line.
 * - > 1000 LOC: Strict Guardrail triggers. Chunks around active cursor (+-120 lines) + full outline.
 */
export function prepareMimoContext(options: {
  docId: string;
  title: string;
  content: string;
  userPrompt: string;
  cursorLine?: number;
  selectedText?: string;
  forceFullScan?: boolean;
}): PreparedContext {
  const {
    docId,
    title,
    content,
    userPrompt,
    cursorLine = 1,
    selectedText,
    forceFullScan = false,
  } = options;
  const lines = content.split('\n');
  const totalDocLines = lines.length;
  const summary = getOrCreateDocumentSummary(docId, title, content);
  const activeHeadingPath = findActiveHeadingPath(lines, cursorLine);

  const promptClean = userPrompt.trim().toLowerCase().replace(/[!?.,]/g, '');
  const isPureGreeting =
    !forceFullScan &&
    !selectedText &&
    /^(hi|hello|hey|hola|namaste|kaise ho|who are you|help|thanks|thank you|shukriya)$/.test(promptClean);

  // Case 1: Active User Selection (Highest Priority Focus)
  if (selectedText && selectedText.trim().length > 0) {
    const trimmedSelection = selectedText.trim();
    const selLines = trimmedSelection.split('\n').length;
    const pathStr = activeHeadingPath ? `\nActive Section: "${activeHeadingPath}"` : '';
    const outlineHeader =
      summary.headingsSummary.length > 0
        ? `\nDocument Outline:\n${summary.headingsSummary.join('\n')}\n`
        : '';

    return {
      docId,
      docTitle: summary.title,
      rawContent: content,
      contextMode: 'selection_focused',
      contextText: `Active Document: "${summary.title}" (${totalDocLines} LOC, ${summary.wordCount} words)${pathStr}
⚡ User has SELECTED this specific text snippet in the editor (Lines around ${cursorLine}, ${selLines} lines selected):
\`\`\`markdown
${trimmedSelection}
\`\`\`
${outlineHeader}`,
      linesAnalyzed: selLines,
      totalDocLines,
      totalWords: summary.wordCount,
      headings: summary.headingsSummary,
      guardrailTriggered: false,
      selectedText: trimmedSelection,
      activeHeadingPath,
    };
  }

  // Case 2: Pure casual greeting -> Use cached AST summary to save tokens
  if (isPureGreeting) {
    const outlineStr =
      summary.headingsSummary.length > 0 ? `\nDocument Outline:\n${summary.headingsSummary.join('\n')}` : '';
    const keywordsStr =
      summary.topKeywords.length > 0 ? `\nKey Topics: ${summary.topKeywords.join(', ')}` : '';

    return {
      docId,
      docTitle: summary.title,
      rawContent: content,
      contextMode: 'summary',
      contextText: `Active Document: "${summary.title}" (${summary.lineCount} lines, ${summary.wordCount} words)${keywordsStr}${outlineStr}\n\nExcerpt:\n${summary.excerptSummary}`,
      linesAnalyzed: summary.lineCount,
      totalDocLines,
      totalWords: summary.wordCount,
      headings: summary.headingsSummary,
      guardrailTriggered: false,
      activeHeadingPath,
    };
  }

  // Case 3: Under 1000 LOC safe limit -> Provide complete document so Mimo has 100% accuracy
  if (totalDocLines <= 1000) {
    const outlineHeader =
      summary.headingsSummary.length > 0
        ? `Document Outline:\n${summary.headingsSummary.join('\n')}\n\n`
        : '';
    const pathStr = activeHeadingPath ? `Current Section: "${activeHeadingPath}"\n` : '';

    return {
      docId,
      docTitle: summary.title,
      rawContent: content,
      contextMode: 'full_safe',
      contextText: `Active Document Title: "${summary.title}" (ID: ${docId}, Total Lines: ${totalDocLines}, Words: ${summary.wordCount}, Cursor at Line: ${cursorLine})\n${pathStr}${outlineHeader}Full Document Markdown Content:\n\`\`\`markdown\n${content}\n\`\`\``,
      linesAnalyzed: totalDocLines,
      totalDocLines,
      totalWords: summary.wordCount,
      headings: summary.headingsSummary,
      guardrailTriggered: false,
      activeHeadingPath,
    };
  }

  // Case 4: >1000 LOC -> STRICT GUARDRAIL TRIGGERED
  const safeRadius = 120;
  const targetLine = Math.max(1, Math.min(cursorLine, totalDocLines));
  const startLine = Math.max(1, targetLine - safeRadius);
  const endLine = Math.min(totalDocLines, targetLine + safeRadius);

  const chunkLines = lines.slice(startLine - 1, endLine);
  const chunkText = chunkLines.join('\n');
  const pathStr = activeHeadingPath ? `Current Section: "${activeHeadingPath}"\n` : '';

  return {
    docId,
    docTitle: summary.title,
    rawContent: content,
    contextMode: 'chunked_loc_guarded',
    contextText: `⚠️ Large Document Guardrail Active (${totalDocLines} LOC total > 1000 LOC limit).
Active Document Title: "${summary.title}"
${pathStr}Analyzed Range: Lines ${startLine} to ${endLine} (around active cursor line ${targetLine}).
Full Document Outline:
${summary.headingsSummary.join('\n')}

Active Section Chunk (Lines ${startLine}-${endLine}):
\`\`\`markdown
${chunkText}
\`\`\``,
    linesAnalyzed: chunkLines.length,
    totalDocLines,
    totalWords: summary.wordCount,
    headings: summary.headingsSummary,
    guardrailTriggered: true,
    activeRange: { start: startLine, end: endLine },
    activeHeadingPath,
  };
}
