import { PreparedContext } from '../features/mimo/services/contextEngine';
import { AdminAiPrivacyConfig } from '../types/adminAi';
import { classifyUserIntent } from '../features/mimo/services/promptRouter';
import { sanitizeTextForAi } from '../features/mimo/services/privacySanitizer';

export interface ContextFilterResult {
  /**
   * Final processed prompt text sent to the model payload
   */
  finalPrompt: string;
  /**
   * Whether document data was injected into this turn
   */
  isContextAttached: boolean;
  /**
   * Granularity of attached context
   */
  contextGranularity: 'none' | 'selection_only' | 'section_only' | 'document_on_demand' | 'full_pre_fed';
  /**
   * Human-readable explanation of why context was or was not attached
   */
  reason: string;
  /**
   * Redacted preview snippet of attached content (if any)
   */
  attachedSnippet?: string;
  /**
   * Approximate tokens saved by withholding unrequested document content
   */
  tokensSavedEstimate: number;
}

const EXPLICIT_DOC_TRIGGERS = [
  '@doc',
  '@document',
  '@note',
  '@file',
  'this document',
  'in this doc',
  'in my document',
  'in this file',
  'in my file',
  'current document',
  'active document',
  'is document me',
  'is file me',
  'summarize',
  'summary',
  'proofread',
  'spellcheck',
  'fix grammar',
  'improve section',
  'outline',
];

/**
 * Enforces strict Zero Pre-Feed privacy for OpenRouter / Admin AI:
 *
 * 1. Default Policy: ZERO PRE-FEED. Documents are never dumped automatically.
 * 2. On-Demand Inclusion: Document data is ONLY attached when the user prompt
 *    explicitly requests document analysis/edits, or when the user highlights text.
 * 3. Surgical Precision: If text is highlighted, only that targeted selection is attached.
 */
export function evaluateContextPrivacyPolicy(
  rawPrompt: string,
  context: PreparedContext,
  privacyConfig: AdminAiPrivacyConfig
): ContextFilterResult {
  const sanitizedPrompt = sanitizeTextForAi(rawPrompt);
  const promptLower = rawPrompt.toLowerCase().trim();
  const hasSelection = Boolean(context.selectedText && context.selectedText.trim().length > 0);

  // Approximate document token footprint
  const fullDocTokensEstimate = Math.max(0, Math.ceil((context.rawContent || '').length / 4));

  // Case 1: If Zero Pre-Feed is turned OFF by admin, fall back to legacy pre-feeding
  if (!privacyConfig.strictZeroPreFeed) {
    const sanitizedFullContext = sanitizeTextForAi(context.contextText);
    const finalPrompt = `[Active Document: "${context.docTitle}"]\n${sanitizedFullContext.sanitizedText}\n\n[User Instruction]\n${sanitizedPrompt.sanitizedText}`;
    return {
      finalPrompt,
      isContextAttached: true,
      contextGranularity: 'full_pre_fed',
      reason: 'Standard Pre-Feed Mode (Zero Pre-Feed disabled in Admin Settings)',
      attachedSnippet: sanitizedFullContext.sanitizedText.slice(0, 150) + '...',
      tokensSavedEstimate: 0,
    };
  }

  // Case 2: User has highlighted text in the editor
  if (hasSelection && context.selectedText) {
    const sanitizedSelection = sanitizeTextForAi(context.selectedText);
    const headingContext = context.activeHeadingPath ? `Under: ${context.activeHeadingPath}\n` : '';
    const selectionPayload = `[Selected Snippet from "${context.docTitle}"]\n${headingContext}"""\n${sanitizedSelection.sanitizedText}\n"""\n\n[Instruction on Selection]\n${sanitizedPrompt.sanitizedText}`;
    
    const selectionTokens = Math.ceil(context.selectedText.length / 4);
    const tokensSaved = Math.max(0, fullDocTokensEstimate - selectionTokens);

    return {
      finalPrompt: selectionPayload,
      isContextAttached: true,
      contextGranularity: 'selection_only',
      reason: 'On-Demand: User highlighted text in editor. Attached targeted selection only.',
      attachedSnippet: sanitizedSelection.sanitizedText.slice(0, 120),
      tokensSavedEstimate: tokensSaved,
    };
  }

  // Case 3: Check for explicit prompt triggers
  const hasTriggerWord = EXPLICIT_DOC_TRIGGERS.some((trigger) => promptLower.includes(trigger));
  const classifiedIntent = classifyUserIntent(rawPrompt, hasSelection);
  const isDocIntent = classifiedIntent === 'DOC_QUERY' || classifiedIntent === 'DOC_TRANSFORM';

  if (privacyConfig.allowOnDemandTriggers && (hasTriggerWord || isDocIntent)) {
    // Clean prompt by removing trigger tokens like @doc
    const cleanPrompt = sanitizedPrompt.sanitizedText.replace(/@(?:doc|document|note|file)\b/gi, '').trim();

    // Use AST section or bounded context rather than dumping entire vault
    const sanitizedContext = sanitizeTextForAi(context.contextText);
    const onDemandPayload = `[Referenced Document: "${context.docTitle}"]\n${sanitizedContext.sanitizedText}\n\n[User Query regarding Document]\n${cleanPrompt}`;

    return {
      finalPrompt: onDemandPayload,
      isContextAttached: true,
      contextGranularity: 'document_on_demand',
      reason: `On-Demand: Prompt triggered document context (Intent: ${classifiedIntent}).`,
      attachedSnippet: sanitizedContext.sanitizedText.slice(0, 120) + '...',
      tokensSavedEstimate: 0,
    };
  }

  // Case 4: ZERO PRE-FEED — General inquiry, chat, conceptual questions, or creative drafting
  // No document context is attached whatsoever.
  return {
    finalPrompt: sanitizedPrompt.sanitizedText,
    isContextAttached: false,
    contextGranularity: 'none',
    reason: 'Zero Pre-Feed Guard Active: Prompt does not reference document. Document withheld for privacy.',
    tokensSavedEstimate: fullDocTokensEstimate,
  };
}
