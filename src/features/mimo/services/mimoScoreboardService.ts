import { db, saveDocument, getDocumentContent } from '../../../db';
import { syncDocumentToSupabase, supabase } from '../../../lib/supabase';
import { MimoMessage } from '../types/mimoTypes';

export const SCOREBOARD_DOC_ID = 'mimo_task_scoreboard';
export const SCOREBOARD_FILENAME = 'mimo_task_scoreboard.md';

export interface TaskScore {
  task: string;
  label: string;
  score: number;
  lastUsedAt: number;
}

// Canonical Intent Mapping & Synonym Lexicon
const CANONICAL_INTENTS: Record<string, { label: string; keywords: string[] }> = {
  summarization: {
    label: 'Summarize Key Takeaways',
    keywords: ['summar', 'gist', 'takeaway', 'bullet', 'brief', 'synopsis', 'overview', 'tldr'],
  },
  grammar_polish: {
    label: 'Polish Flow & Grammar',
    keywords: ['polish', 'grammar', 'improve', 'clarity', 'refine', 'proofread', 'flow', 'spelling'],
  },
  table_synthesis: {
    label: 'Synthesize Comparison Table',
    keywords: ['table', 'tabulate', 'matrix', 'comparison', 'grid', 'columns', 'rows'],
  },
  explain_hinglish: {
    label: 'Explain in Hinglish',
    keywords: ['hinglish', 'hindi', 'samjha', 'batao', 'explain in hindi'],
  },
  chaos_to_clarity: {
    label: 'Chaos to Clarity Brain-Dump',
    keywords: ['chaos', 'brain dump', 'dump', 'structure notes', 'organize thoughts', 'stream of consciousness'],
  },
  code_analysis: {
    label: 'Analyze Code & Architecture',
    keywords: ['code', 'debug', 'typescript', 'javascript', 'python', 'refactor', 'function', 'syntax'],
  },
  outline_expansion: {
    label: 'Expand Outline & Headings',
    keywords: ['outline', 'heading', 'sections', 'toc', 'draft next', 'continue writing'],
  },
  qa_explanation: {
    label: 'Explain Core Concepts',
    keywords: ['what is', 'how does', 'explain', 'why', 'define', 'meaning'],
  },
};

// Default seed scoreboard if none exists yet
const DEFAULT_SCORES: Record<string, number> = {
  summarization: 3,
  grammar_polish: 2,
  table_synthesis: 1,
  explain_hinglish: 1,
  chaos_to_clarity: 1,
};

let debouncedSyncTimer: ReturnType<typeof setTimeout> | null = null;
let cachedScoreboard: TaskScore[] | null = null;
let isScoreboardDirty = false;

/**
 * Parses markdown bullet points into TaskScore objects
 */
function parseScoreboardMarkdown(markdown: string): TaskScore[] {
  const scores: TaskScore[] = [];
  const lines = markdown.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^[-*]\s*([a-zA-Z0-9_-]+)\s*:\s*(\d+)/);
    if (match) {
      const task = match[1].toLowerCase().trim();
      const score = parseInt(match[2], 10);
      const canonical = CANONICAL_INTENTS[task];
      scores.push({
        task,
        label: canonical?.label || task.replace(/_/g, ' '),
        score,
        lastUsedAt: Date.now(),
      });
    }
  }

  return scores;
}

/**
 * Serializes TaskScore objects into human-readable Markdown with YAML frontmatter
 */
function serializeScoreboardMarkdown(scores: TaskScore[]): string {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const now = Date.now();

  const lines = [
    '---',
    'type: mimo_task_scoreboard',
    'version: 1',
    `updatedAt: ${now}`,
    'description: "Mimo Autonomous Task Frequency & Preference Profile"',
    '---',
    '',
    '# Mimo Task Preference Scoreboard',
    '',
  ];

  for (const s of sorted) {
    lines.push(`- ${s.task}: ${s.score}`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Classifies an incoming user prompt or action string into a canonical task key.
 * Merges synonyms automatically into higher-scoring canonical keys.
 */
export function classifyPromptIntent(rawPrompt: string): string {
  const lower = rawPrompt.toLowerCase().trim();

  // 1. Direct quick action match
  if (lower === 'summarize' || lower === 'summary') return 'summarization';
  if (lower === 'improve' || lower === 'polish') return 'grammar_polish';
  if (lower === 'table' || lower === 'make table') return 'table_synthesis';
  if (lower === 'translate' || lower === 'hinglish') return 'explain_hinglish';
  if (lower === 'chaos-to-clarity' || lower === 'chaos') return 'chaos_to_clarity';

  // 2. Keyword heuristic scan
  for (const [key, config] of Object.entries(CANONICAL_INTENTS)) {
    for (const kw of config.keywords) {
      if (lower.includes(kw)) {
        return key;
      }
    }
  }

  // 3. Normalized dynamic fallback for new unique user tasks
  const words = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    return words.slice(0, 2).join('_');
  }

  return 'general_assistance';
}

/**
 * Loads the current scoreboard from Dexie IndexedDB.
 * Initializes default file if first time.
 */
export async function loadScoreboard(): Promise<TaskScore[]> {
  if (cachedScoreboard && !isScoreboardDirty) {
    return cachedScoreboard;
  }

  try {
    const existing = await getDocumentContent(SCOREBOARD_DOC_ID);
    if (existing && existing.includes('mimo_task_scoreboard')) {
      const parsed = parseScoreboardMarkdown(existing);
      if (parsed.length > 0) {
        cachedScoreboard = parsed;
        return parsed;
      }
    }
  } catch {
    // Document does not exist yet; initialize below
  }

  // Initialize fresh scoreboard in IndexedDB
  const initial: TaskScore[] = Object.entries(DEFAULT_SCORES).map(([task, score]) => ({
    task,
    label: CANONICAL_INTENTS[task]?.label || task,
    score,
    lastUsedAt: Date.now(),
  }));

  // Hydrate from Supabase RPC if user is logged in
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
      if (session?.user) {
        const { data: remoteScores } = await supabase.rpc('get_mimo_task_scores');
        if (Array.isArray(remoteScores) && remoteScores.length > 0) {
          for (const r of remoteScores) {
            const idx = initial.findIndex((it) => it.task === r.task);
            if (idx >= 0) {
              initial[idx].score = Math.max(initial[idx].score, r.score);
              initial[idx].lastUsedAt = Math.max(initial[idx].lastUsedAt, new Date(r.last_used_at).getTime());
            } else {
              initial.push({
                task: r.task,
                label: r.label || r.task,
                score: r.score,
                lastUsedAt: new Date(r.last_used_at).getTime(),
              });
            }
          }
        }
      }
    } catch {
      // Offline or table not migrated yet
    }
  }

  const initialMd = serializeScoreboardMarkdown(initial);
  await saveDocument(
    SCOREBOARD_DOC_ID,
    SCOREBOARD_FILENAME,
    initialMd,
    ['system', 'ai_profile']
  ).catch(console.warn);

  // Shield from general AI ingestion
  await db.documents.update(SCOREBOARD_DOC_ID, {
    isAiExcluded: true,
  }).catch(() => {});

  cachedScoreboard = initial;
  return initial;
}

/**
 * Schedules a debounced background push to Supabase after 10s of idle user inactivity
 */
function scheduleDebouncedCloudSync(): void {
  if (debouncedSyncTimer) {
    clearTimeout(debouncedSyncTimer);
  }

  debouncedSyncTimer = setTimeout(async () => {
    if (!isScoreboardDirty) return;

    try {
      const meta = await db.documents.get(SCOREBOARD_DOC_ID);
      const content = await getDocumentContent(SCOREBOARD_DOC_ID);
      if (meta && content) {
        await syncDocumentToSupabase(meta, content);
      }

      // Also sync to dedicated public.mimo_task_scores table if available
      if (supabase && cachedScoreboard && cachedScoreboard.length > 0) {
        const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        if (session?.user) {
          await supabase.rpc('sync_mimo_task_scores', {
            p_scores: cachedScoreboard.map((s) => ({
              task: s.task,
              label: s.label,
              score: s.score,
              lastUsedAt: new Date(s.lastUsedAt).toISOString(),
            })),
          }).catch(() => {});
        }
      }

      isScoreboardDirty = false;
    } catch (err) {
      console.warn('[MimoScoreboard] Debounced cloud push deferred (offline or unauthenticated):', err);
    }
  }, 10000); // 10-Second Inactivity Window
}

/**
 * Increments the score for a completed task or user prompt by +1.
 * Deduplicates and merges semantically identical tasks into the higher-scoring entry.
 */
export async function recordTaskExecution(promptOrAction: string): Promise<void> {
  const current = await loadScoreboard();
  const matchedTask = classifyPromptIntent(promptOrAction);

  let taskFound = false;
  const updated: TaskScore[] = [];

  for (const item of current) {
    if (item.task === matchedTask) {
      updated.push({
        ...item,
        score: item.score + 1,
        lastUsedAt: Date.now(),
      });
      taskFound = true;
    } else {
      updated.push(item);
    }
  }

  // Create new task if not found
  if (!taskFound) {
    const canonical = CANONICAL_INTENTS[matchedTask];
    updated.push({
      task: matchedTask,
      label: canonical?.label || matchedTask.replace(/_/g, ' '),
      score: 1,
      lastUsedAt: Date.now(),
    });
  }

  cachedScoreboard = updated;
  isScoreboardDirty = true;

  // Persist locally in IndexedDB immediately
  const markdown = serializeScoreboardMarkdown(updated);
  await saveDocument(
    SCOREBOARD_DOC_ID,
    SCOREBOARD_FILENAME,
    markdown,
    ['system', 'ai_profile']
  ).catch(console.warn);

  // Trigger 10-second inactivity debounce sync
  scheduleDebouncedCloudSync();
}

/**
 * Generates exactly 3 suggestions for empty chat state based on document content & scoreboard
 */
export async function getDocumentContextSuggestions(
  docTitle: string,
  docContent: string
): Promise<Array<{ id: string; label: string; prompt: string }>> {
  const scoreboard = await loadScoreboard();
  const sorted = [...scoreboard].sort((a, b) => b.score - a.score);
  const topTask = sorted[0]?.task || 'summarization';

  const len = docContent.length;
  const hasTables = docContent.includes('|---') || docContent.includes('| --');
  const hasHeadings = /^#{1,4}\s+/m.test(docContent);

  const suggestions: Array<{ id: string; label: string; prompt: string }> = [];

  // Suggestion 1: Document structural need
  if (len < 100) {
    suggestions.push({
      id: 'sugg_expand',
      label: 'Draft outline & intro',
      prompt: `Help me flesh out "${docTitle || 'this note'}" with clear headings, core arguments, and an executive summary.`,
    });
  } else if (!hasHeadings && len > 300) {
    suggestions.push({
      id: 'sugg_structure',
      label: 'Structure with headings',
      prompt: 'Organize this document into structured logical sections with clean H2 and H3 markdown headings.',
    });
  } else {
    suggestions.push({
      id: 'sugg_summarize',
      label: 'Summarize key takeaways',
      prompt: 'Extract the core takeaways, decisions, and action items from this document in structured bullets.',
    });
  }

  // Suggestion 2: Data synthesis or clarity
  if (!hasTables && len > 200) {
    suggestions.push({
      id: 'sugg_table',
      label: 'Synthesize comparison table',
      prompt: 'Extract key parameters, specs, or comparisons from this note into a clean, formatted Markdown table.',
    });
  } else {
    suggestions.push({
      id: 'sugg_polish',
      label: 'Polish flow & grammar',
      prompt: 'Review this text for tight grammar, publication-grade clarity, and cohesive transition sentences.',
    });
  }

  // Suggestion 3: High-scoring personal preference from user scoreboard
  if (topTask === 'explain_hinglish') {
    suggestions.push({
      id: 'sugg_hinglish',
      label: 'Explain in Hinglish',
      prompt: 'Explain the technical nuances and key ideas of this document in clear, natural tech-savvy Hinglish.',
    });
  } else if (topTask === 'chaos_to_clarity') {
    suggestions.push({
      id: 'sugg_chaos',
      label: 'Chaos to clarity polish',
      prompt: 'Transform this raw draft into clean, cohesive paragraphs while preserving all unique technical details.',
    });
  } else {
    suggestions.push({
      id: 'sugg_insights',
      label: 'Scan cross-vault links',
      prompt: 'Check this document for parameters or concepts that connect to other notes in my vault.',
    });
  }

  return suggestions.slice(0, 3);
}

/**
 * Generates exactly 2 follow-up suggestions for active chat based on last 10 messages
 */
export async function getActiveChatFollowUpSuggestions(
  messages: MimoMessage[],
  _docContent: string
): Promise<Array<{ id: string; label: string; prompt: string }>> {
  if (!messages || messages.length === 0) {
    return [];
  }

  const last10 = messages.slice(-10);
  const lastAssistantMsg = [...last10].reverse().find((m) => m.role === 'assistant');
  const lastUserMsg = [...last10].reverse().find((m) => m.role === 'user');

  const assistantText = (lastAssistantMsg?.text || '').toLowerCase();
  const userText = (lastUserMsg?.text || '').toLowerCase();

  const followUps: Array<{ id: string; label: string; prompt: string }> = [];

  // Contextual heuristic pairs
  if (assistantText.includes('|') && assistantText.includes('---')) {
    followUps.push({
      id: 'f_table_row',
      label: 'Add more rows & criteria',
      prompt: 'Expand this table with 2 additional comparative criteria and practical evaluation notes.',
    });
    followUps.push({
      id: 'f_apply_doc',
      label: 'Insert into active note',
      prompt: 'Propose a non-destructive diff to insert this table into the relevant section of my document.',
    });
  } else if (assistantText.includes('diff') || lastAssistantMsg?.diffHunk) {
    followUps.push({
      id: 'f_refine_tone',
      label: 'Make tone more concise',
      prompt: 'Keep the same proposed diff but make the vocabulary more punchy, direct, and concise.',
    });
    followUps.push({
      id: 'f_explain_changes',
      label: 'Explain why changes were made',
      prompt: 'Briefly explain why these edits improve readability and flow compared to my original draft.',
    });
  } else if (userText.includes('summar')) {
    followUps.push({
      id: 'f_action_items',
      label: 'Convert to action items',
      prompt: 'Convert these summary bullets into actionable todo checklist items with owners and checkboxes.',
    });
    followUps.push({
      id: 'f_deep_dive',
      label: 'Deep-dive into main point',
      prompt: 'Expand on the most critical takeaway from this summary with practical real-world context.',
    });
  } else {
    // Default high-value follow-ups
    followUps.push({
      id: 'f_propose_diff',
      label: 'Propose as markdown diff',
      prompt: 'Propose these improvements as a non-destructive replacement diff for my active document.',
    });
    followUps.push({
      id: 'f_next_steps',
      label: 'What should we write next?',
      prompt: 'Based on this section, what are the next 2 logical headings and arguments we should develop?',
    });
  }

  return followUps.slice(0, 2);
}
