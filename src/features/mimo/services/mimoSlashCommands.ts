import { GoogleGenAI } from '@google/genai';
import { MimoMessage } from '../types/mimoTypes';
import { useMimoStore } from '../stores/useMimoStore';
import { extractEpisodicBulletsLocally } from './episodicMemoryEngine';

export interface MimoSlashCommandDef {
  id: 'compact' | 'clean-md' | 'action-items' | 'trim' | 'review';
  command: string;
  name: string;
  aliases: string[];
  description: string;
  badge: string;
  iconName: 'Archive' | 'Sparkles' | 'ListTodo' | 'Scissors' | 'FileSearch';
  placeholder?: string;
}

export const MIMO_SLASH_COMMANDS: MimoSlashCommandDef[] = [
  {
    id: 'compact',
    command: '/compact',
    name: '/compact',
    aliases: ['/compress', '/condense', '/shrink'],
    description: 'Compress chat history & save context memory',
    badge: 'Lightweight',
    iconName: 'Archive',
  },
  {
    id: 'clean-md',
    command: '/clean-md',
    name: '/clean-md',
    aliases: ['/format', '/clean', '/lint-md'],
    description: 'Auto-fix Markdown syntax, tables & heading hierarchy',
    badge: 'Syntax',
    iconName: 'Sparkles',
  },
  {
    id: 'action-items',
    command: '/action-items',
    name: '/action-items',
    aliases: ['/actionitem', '/todo', '/tasks', '/actions'],
    description: 'Extract all tasks & follow-ups into a checklist',
    badge: 'Checklist',
    iconName: 'ListTodo',
  },
  {
    id: 'trim',
    command: '/trim',
    name: '/trim',
    aliases: ['/simplify', '/concise', '/shorten'],
    description: 'Cut fluff, wordiness & redundancy with surgical diff',
    badge: 'Fluff Cutter',
    iconName: 'Scissors',
  },
  {
    id: 'review',
    command: '/review',
    name: '/review',
    aliases: ['/audit', '/critique', '/check'],
    description: 'Audit document for contradictions, gaps & quality',
    badge: 'Quality Audit',
    iconName: 'FileSearch',
  },
];

/**
 * Filter slash commands based on user input prefix.
 */
export function getMatchingSlashCommands(input: string): MimoSlashCommandDef[] {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed.startsWith('/')) return [];

  const query = trimmed.slice(1);
  if (!query) return MIMO_SLASH_COMMANDS;

  return MIMO_SLASH_COMMANDS.filter((cmd) => {
    const cmdQuery = cmd.command.slice(1).toLowerCase();
    if (cmdQuery.includes(query) || cmd.id.includes(query)) return true;
    if (cmd.aliases.some((alias) => alias.slice(1).toLowerCase().includes(query))) return true;
    if (cmd.description.toLowerCase().includes(query)) return true;
    return false;
  });
}

/**
 * Parses user input to identify if a recognized slash command was invoked.
 */
export function parseSlashCommand(input: string): {
  def: MimoSlashCommandDef;
  args: string;
} | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;

  const parts = trimmed.split(/\s+/);
  const head = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ').trim();

  for (const cmd of MIMO_SLASH_COMMANDS) {
    if (cmd.command.toLowerCase() === head || cmd.aliases.map((a) => a.toLowerCase()).includes(head)) {
      return { def: cmd, args };
    }
  }

  return null;
}

/**
 * Prompt Builder for `/clean-md`
 */
export function buildCleanMarkdownPrompt(content: string, selection?: string, extraArgs?: string): string {
  const targetText = selection && selection.trim().length > 0 ? selection.trim() : content;
  const isTargetingSelection = Boolean(selection && selection.trim().length > 0);

  return `[SYSTEM DIRECTIVE: STRICT MARKDOWN FORMATTING & SYNTAX CLEANER]
Clean and format the following ${isTargetingSelection ? 'selected Markdown text' : 'full Markdown document'}.
${extraArgs ? `User focus: "${extraArgs}"` : ''}

Strict Formatting Objectives:
1. GFM Tables: Ensure all markdown tables have proper pipe delimiters, aligned columns, and standard header separators (| --- | --- |).
2. Heading Progression: Fix broken heading jumps (e.g. H1 followed immediately by H4; normalize hierarchy logically to H2, H3).
3. Code Blocks: Ensure all code blocks have valid opening and closing fences (\`\`\`) and correct language identifiers (e.g., \`\`\`ts, \`\`\`json, \`\`\`bash).
4. Lists: Normalize indentation (2 or 4 spaces consistently), fix broken numbered list increments, ensure blank line before lists.
5. Whitespace: Eliminate multiple consecutive blank lines and trailing spaces.
6. Content Preservation: Preserve 100% of the original words, sentences, facts, links, and code logic. Do NOT summarize or add prose.

Output Format:
You MUST return the formatting fixes as a clean Diff Hunk so the user can preview and accept it directly:
<<<<<<< SEARCH
[Exact original lines that need formatting fix]
=======
[Cleaned, aligned, and properly formatted Markdown replacement]
>>>>>>>

If the entire text needs systematic cleanup, wrap the whole target text in the SEARCH block and the cleaned version in the REPLACE block.

Text to format:
"""
${targetText}
"""`;
}

/**
 * Prompt Builder for `/action-items`
 */
export function buildActionItemsPrompt(content: string, selection?: string, extraArgs?: string): string {
  const targetText = selection && selection.trim().length > 0 ? selection.trim() : content;

  return `[SYSTEM DIRECTIVE: TASK & ACTION ITEM EXTRACTOR]
Analyze the following document and extract every explicit task, implied action point, follow-up, pending decision, deadline, and deliverable.
${extraArgs ? `User focus: "${extraArgs}"` : ''}

Format Requirements:
1. Group tasks logically under clear categories (e.g., Immediate / High Priority, In Progress, Review / Follow-up).
2. Format each task as an interactive Markdown checklist item:
   - [ ] **[Task Summary]** Specific action required *(Context/Owner: if mentioned | Due: if mentioned)*
3. If dates, deadlines, or owners are mentioned in the text, attribute them explicitly.
4. At the very end of your response, emit a JSON tool call block so the user can insert the checklist into the document with one click:
\`\`\`json
{
  "tool": "insert_at_bottom",
  "arguments": {
    "content": "\\n\\n### 📋 Action Items\\n[Your generated checklist here]"
  }
}
\`\`\`

Document to analyze:
"""
${targetText}
"""`;
}

/**
 * Prompt Builder for `/trim`
 */
export function buildTrimPrompt(content: string, selection?: string, extraArgs?: string): string {
  const targetText = selection && selection.trim().length > 0 ? selection.trim() : content;
  const isTargetingSelection = Boolean(selection && selection.trim().length > 0);

  return `[SYSTEM DIRECTIVE: FLUFF CUTTER & READABILITY EDITOR]
Review the following ${isTargetingSelection ? 'selected text' : 'document'} and aggressively eliminate all verbose phrasing, filler words, corporate jargon, and repetitive sentences.
${extraArgs ? `User focus: "${extraArgs}"` : ''}

Trimming Rules:
1. Reduce word count by 25%–40% while preserving 100% of facts, arguments, and technical substance.
2. Cut filler expressions (e.g., "in order to" -> "to", "it is important to note that" -> delete, "needless to say" -> delete).
3. Convert passive constructions to active voice where natural.
4. Make every sentence crisp, punchy, and effortless to read.
5. DO NOT delete important facts, numbers, code blocks, or proper nouns.

Output Format:
You MUST output the trimmed result as a standard Diff Hunk:
<<<<<<< SEARCH
[Original verbose lines]
=======
[Crisp, trimmed, and punchy replacement]
>>>>>>>

Text to trim:
"""
${targetText}
"""`;
}

/**
 * Prompt Builder for `/review`
 */
export function buildReviewPrompt(content: string, extraArgs?: string): string {
  return `[SYSTEM DIRECTIVE: ELITE EDITORIAL & DOCUMENT AUDITOR]
Perform a comprehensive quality, consistency, and structural gap audit of the following document.
DO NOT edit, rewrite, or modify the document. Instead, produce an objective, high-value editorial audit report:
${extraArgs ? `User focus: "${extraArgs}"` : ''}

Audit Structure:
### 🔍 Document Quality & Gap Audit

#### 🚨 Contradictions & Inconsistencies
- Highlight any conflicting statements, mismatched numbers, dates, terms, or parameter values across sections. (If none, state "✅ No internal contradictions found").

#### 🧩 Structural & Logical Gaps
- Identify missing explanations, abrupt transitions, missing setup steps, or unanswered questions a reader will have.

#### 🔁 Redundancies & Repetition
- Highlight points, arguments, or sentences that are repeated unnecessarily across different sections.

#### 💡 High-Impact Recommendations
- Provide 2–3 specific, concrete suggestions to elevate the document from good to publication-grade.

Document to audit:
"""
${content}
"""`;
}

/**
 * Executes `/compact` command:
 * 1. Collects meaningful conversational turns from active document chat.
 * 2. Condenses them into high-density episodic summary bullets.
 * 3. Saves the bullets to persistent episodic memory store.
 * 4. Replaces message history with a single lightweight summary notification card.
 */
export async function executeCompactCommand(options: {
  docId: string;
  docTitle: string;
  onToast: (msg: string) => void;
  apiKey?: string;
}): Promise<{ success: boolean; tokensSaved: number; bullets: string[] }> {
  const { docId, docTitle, onToast, apiKey } = options;
  const mimoStore = useMimoStore.getState();
  const activeDocId = docId || mimoStore.activeDocId;
  const messages = mimoStore.messagesByDoc[activeDocId] || mimoStore.messages || [];

  // Filter meaningful conversation messages
  const meaningfulMessages = messages.filter(
    (m) => m.text && m.text.trim().length > 0 && !m.id.startsWith('welcome-') && !m.id.startsWith('compacted-')
  );

  if (meaningfulMessages.length <= 2) {
    onToast('Chat is already lightweight (< 3 messages). Nothing to compact!');
    return { success: false, tokensSaved: 0, bullets: [] };
  }

  mimoStore.setMascotState('thinking');

  // Estimate total character footprint for token savings report
  const totalCharacters = meaningfulMessages.reduce((sum, m) => sum + m.text.length, 0);
  const estimatedTokensSaved = Math.max(120, Math.ceil(totalCharacters / 4));

  let bullets: string[] = [];

  // 1. Attempt LLM distillation if API key is available and online
  const effectiveKey = (
    apiKey ||
    mimoStore.quota.userApiKey ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    ''
  ).trim();

  if (effectiveKey && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const ai = new GoogleGenAI({ apiKey: effectiveKey });
      const conversationTranscript = meaningfulMessages
        .slice(-14)
        .map((m) => `${m.role === 'user' ? 'User' : 'Mimo'}: ${m.text.slice(0, 300)}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Summarize the following chat conversation about document "${docTitle}" into 3-5 concise, high-density bullet points capturing the key decisions made, user preferences, agreed facts, and completed edits. Format each line starting with "• ". Do not add intro or outro prose.\n\nConversation:\n${conversationTranscript}`,
              },
            ],
          },
        ],
      });

      const responseText = response.text?.trim() || '';
      const extractedLines = responseText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))
        .map((line) => line.replace(/^[-*•]\s*/, '• '));

      if (extractedLines.length > 0) {
        bullets = extractedLines;
      }
    } catch {
      // Fall through to deterministic local extraction
    }
  }

  // 2. Fallback to local extractive summarizer if LLM distillation unavailable
  if (bullets.length === 0) {
    bullets = extractEpisodicBulletsLocally(meaningfulMessages);
  }

  if (bullets.length === 0) {
    bullets = [
      `• Discussed ${meaningfulMessages.length} turns on "${docTitle}"`,
      `• User requested document edits and refinements`,
    ];
  }

  // 3. Save bullets to episodic memory store
  mimoStore.appendEpisodicSummary(activeDocId, bullets);

  // 4. Create fresh lightweight notification message
  const bulletMarkdown = bullets.map((b) => (b.startsWith('•') ? b : `• ${b}`)).join('\n');
  const compactedMessage: MimoMessage = {
    id: `compacted-${Date.now()}`,
    role: 'assistant',
    text: `### 🗜️ Context Compacted\n\n*Saved **~${estimatedTokensSaved} tokens** (${meaningfulMessages.length} chat turns condensed). Memory is now ultra-lightweight and fast!*\n\n**Retained Context in Memory:**\n${bulletMarkdown}\n\n---\n*Chat history reset for this document. You can continue writing with full speed!*`,
    timestamp: Date.now(),
  };

  // 5. Update store
  const updatedMessages = [compactedMessage];
  useMimoStore.setState((state) => ({
    messages: updatedMessages,
    messagesByDoc: {
      ...state.messagesByDoc,
      [activeDocId]: updatedMessages,
    },
    activeActivity: null,
    activeDiffHunk: null,
    mascotState: 'happy',
    lastMimoInteractionTime: Date.now(),
  }));

  onToast(`🗜️ Chat compacted! Saved ~${estimatedTokensSaved} tokens`);
  return { success: true, tokensSaved: estimatedTokensSaved, bullets };
}
