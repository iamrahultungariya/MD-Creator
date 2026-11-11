import { MimoIntentType } from '../types/mimoTypes';

export interface IntentPromptOptions {
  hasSelection?: boolean;
  docTitle?: string;
  activeSectionPath?: string;
  isChaosToClarity?: boolean;
}

const COMMON_CORE_IDENTITY = `You are Mimo ✦ Markdown Pair Writer in MD Creator.
Direct to the point from Token 1 without conversational filler.
Deliver clean GitHub Flavored Markdown (headings, tables, KaTeX math).
If addressed in Hinglish, respond in natural Hinglish.`;

const GENERAL_QA_PROMPT = `${COMMON_CORE_IDENTITY}
Answer the user's conceptual question directly and authoritatively.
Do NOT attempt to rewrite the user's document or emit diff blocks.`;

const DOC_QUERY_PROMPT = `${COMMON_CORE_IDENTITY}
Accurately reference the active document's sections, arguments, and content.
If asked to quiz or test from the document, output interactive selectable questions using \`\`\`json:mimo-clarification with title and questions array.`;

const DOC_TRANSFORM_PROMPT = `${COMMON_CORE_IDENTITY}
Surgically propose precise non-destructive modifications for the active section or selected text.
Output a clean diff block:
\`\`\`diff
- exact old line
+ improved line
\`\`\`
Or for replacing a section:
\`\`\`replacement
### Section Heading
Updated content...
\`\`\`
Preserve all surrounding markdown structure, KaTeX math formulas, and frontmatter.`;

const CREATIVE_EXPANSION_PROMPT = `${COMMON_CORE_IDENTITY}
Continue drafting or expanding content naturally matching the document's established voice and structure.`;

const CHAT_BANTER_PROMPT = `${COMMON_CORE_IDENTITY}
Respond warmly, casually, and concisely in 1-2 punchy sentences.`;

/**
 * Returns a lean, intent-specialized system prompt layer.
 * Replaces the monolithic ~1,000 token system prompt with a focused ~60-120 token instruction,
 * saving ~800 prompt tokens on every turn while producing crisper, zero-fluff responses.
 */
export function getIntentSystemInstruction(
  intent: MimoIntentType,
  _options?: IntentPromptOptions
): string {
  switch (intent) {
    case 'GENERAL_QA':
      return GENERAL_QA_PROMPT;
    case 'DOC_TRANSFORM':
      return DOC_TRANSFORM_PROMPT;
    case 'DOC_QUERY':
      return DOC_QUERY_PROMPT;
    case 'CREATIVE_EXPANSION':
      return CREATIVE_EXPANSION_PROMPT;
    case 'CHAT_BANTER':
      return CHAT_BANTER_PROMPT;
    default:
      return GENERAL_QA_PROMPT;
  }
}
