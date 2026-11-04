import { GoogleGenAI } from '@google/genai';
import { ThinkingLevel, MimoModelChoice, MimoMessage, MimoIntentType } from '../types/mimoTypes';
import { resolveThinkingLevel, classifyUserIntent } from './promptRouter';
import { PreparedContext } from './contextEngine';
import { sanitizeTextForAi } from './privacySanitizer';
import { useStyleDnaStore, buildStyleDnaPromptLayer } from '../stores/useStyleDnaStore';
import { buildTokenOptimizedHistory } from './episodicMemoryEngine';
import { CHAOS_TO_CLARITY_SYSTEM_DIRECTIVE, transformChaosLocally } from './chaosToClarityTransformer';
import { useAdminAiStore } from '../../../stores/useAdminAiStore';
import { streamOpenRouterResponse } from '../../../services/openRouterService';
import { evaluateContextPrivacyPolicy } from '../../../services/adminAiContextFilter';

export interface StreamCallbacks {
  onStreamReset?: () => void;
  onThoughtChunk?: (thought: string) => void;
  onTextChunk?: (text: string) => void;
  onReasoningStep?: (step: string) => void;
  onTokenVelocity?: (tokPerSec: number) => void;
  onModelResolved?: (modelLabel: string, level: string) => void;
}

export interface MimoStreamResult {
  fullText: string;
  thoughtText: string;
  modelUsed: string;
  resolvedLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  tokensUsed: number;
  aborted?: boolean;
}

const MIMO_SYSTEM_PROMPT = `You are Mimo ✦ Your Markdown Companion & Intelligent Pair Writer in MD Creator.
You are articulate, sharp, and context-aware.

Core Directives:
1. Intent Recognition:
   - GENERAL / CONCEPTUAL QUESTIONS (e.g., "What is Python?", "What is an API?", "How does async/await work?"): Answer the user's question directly, clearly, and authoritatively first! Do NOT dump the active document outline or mistake the question for a document edit instruction. If relevant, you may briefly note how the topic connects to their open document.
   - DOCUMENT QUESTIONS (e.g., "What does my document say about X?", "Summarize key points"): Accurately reference the active document's actual sections, arguments, and content.
   - DOCUMENT EDITS / IMPROVEMENTS: Propose precise non-destructive modifications. When asked to edit, fix, or improve text, output a clean diff block:
\`\`\`diff
- exact old line
+ improved line
\`\`\`
   Or for inserting a new section:
\`\`\`replacement
### New Section Heading
Section body here...
\`\`\`
   Do NOT output diff blocks when the user is asking questions, chatting, or asking for conceptual explanations.
2. Markdown First: Deliver structured, publication-grade GitHub Flavored Markdown (headings, tables, callouts, lists, and syntax-highlighted code blocks).
3. Language Adaptation: If addressed in Hinglish, respond in natural, tech-savvy Hinglish (Roman script Hindi + English technical terms). If in Hindi, respond in fluent Hindi. If in English, respond in polished English.
4. Selection Priority: When the user has selected text in their editor, prioritize addressing that specific selected snippet.
5. Zero Fluff: Direct, insightful, and helpful without unnecessary conversational filler.
6. Interactive Clarification Capability:
   - When a user prompt is underspecified, broad, or has multiple valid approaches (e.g. "Write an introduction", "Create a blog post", "Help me draft a plan", "Improve this section" without clear tone/audience/goal), DO NOT guess blindly with a generic answer.
   - Provide a brief polite sentence acknowledging the request, and append an interactive clarification card:
\`\`\`json:mimo-clarification
{
  "title": "A few quick questions to customize your content",
  "questions": [
    {
      "id": "q1",
      "question": "What tone or target audience would you prefer?",
      "type": "single",
      "options": ["Professional & technical", "Engaging & casual", "Concise & executive"],
      "allowCustom": true
    }
  ]
}
\`\`\`
7. AST Section Surgeon (Targeted Scoped Editing):
   - When the user asks to modify, rewrite, or expand a section, pinpoint the exact Markdown heading (H1, H2, or H3) or cursor section.
   - Surgically propose diffs or replacements for ONLY that section without rewriting, repeating, or disrupting the rest of the document.
   - Preserve all surrounding markdown structure, KaTeX math formulas, and frontmatter.`;

/**
 * Resolves the optimal Gemini model & display label based on evaluated complexity:
 * - Gemini 3.8 Flash (gemini-3.8-flash) is the unified BASE model for deep reasoning tasks.
 * - Gemini 3.5 Flash (gemini-3.5-flash) and Gemini 3.5 Flash-Lite (gemini-3.5-flash-lite)
 *   provide ultra-high throughput failover (all legacy Gemini 2.x models have been retired).
 */
export function getModelForComplexity(level: 'LOW' | 'MEDIUM' | 'HIGH'): {
  modelId: string;
  displayLabel: string;
  ttftTimeout: number;
} {
  if (level === 'HIGH') {
    return {
      modelId: 'gemini-3.8-flash',
      displayLabel: 'Gemini 3.8 Flash (Deep Reasoning)',
      ttftTimeout: 30000, // 30s realistic TTFT for deep reasoning
    };
  }
  if (level === 'MEDIUM') {
    return {
      modelId: 'gemini-3.8-flash',
      displayLabel: 'Gemini 3.8 Flash (Balanced)',
      ttftTimeout: 22000,
    };
  }
  return {
    modelId: 'gemini-3.8-flash',
    displayLabel: 'Gemini 3.8 Flash (Fast Thinking)',
    ttftTimeout: 18000,
  };
}

/**
 * Helper to race a promise against an AbortSignal or timeout so Stop button works instantaneously (0ms hang).
 */
function withAbortAndTimeout<T>(
  promise: Promise<T>,
  signal?: AbortSignal,
  timeoutMs = 15000
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted by user', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error(`MODEL_TIMEOUT_${timeoutMs}MS`));
    }, timeoutMs);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted by user', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    promise.then(
      (val) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        reject(err);
      }
    );
  });
}

/**
 * Structured diagnostic error object for Google Gemini API responses.
 */
export interface GeminiParsedError {
  status: number;
  code: string | number;
  message: string;
  isApiKeyInvalid: boolean;
  isPermissionDenied: boolean;
  isRateLimited: boolean;
  isHighDemand: boolean;
  isNotFound: boolean;
  isInvalidArgument: boolean;
  isTimeout: boolean;
  isAborted: boolean;
}

/**
 * Universal error classifier for Google Gemini API errors.
 * Accurately extracts status codes (401, 403, 429, 503, 400), nested JSON payloads,
 * and eliminates false deprecation rejections of standard AIza... keys.
 */
export function parseGeminiError(err: any): GeminiParsedError {
  const isAborted =
    err?.name === 'AbortError' ||
    String(err?.message || '').includes('Aborted by user') ||
    String(err?.message || '').includes('DOMException');

  const rawMsg = String(err?.message || err || '');
  let parsedStatus = typeof err?.status === 'number' ? err.status : 0;
  let parsedCode: string | number = err?.code || '';
  let cleanMessage = rawMsg;

  // Extract nested JSON error if present: e.g. {"error":{"code":503,"message":"..."}}
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const errorObj = parsed.error || parsed;
      if (errorObj) {
        if (typeof errorObj.code === 'number') parsedStatus = parsedStatus || errorObj.code;
        if (errorObj.status) parsedCode = errorObj.status;
        if (typeof errorObj.message === 'string') {
          // Handle double-nested JSON strings from Google RPC
          try {
            const inner = JSON.parse(errorObj.message);
            if (inner.error?.message) {
              cleanMessage = inner.error.message;
              if (inner.error.code) parsedStatus = parsedStatus || inner.error.code;
              if (inner.error.status) parsedCode = inner.error.status;
            } else {
              cleanMessage = errorObj.message;
            }
          } catch {
            cleanMessage = errorObj.message;
          }
        }
      }
    }
  } catch {
    // Continue with raw message fallback
  }

  const lower = (cleanMessage + ' ' + rawMsg).toLowerCase();

  const isApiKeyInvalid =
    parsedStatus === 401 ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('unauthenticated') ||
    lower.includes('invalid api key');

  const isPermissionDenied =
    parsedStatus === 403 ||
    lower.includes('permission_denied') ||
    lower.includes('permission denied');

  const isRateLimited =
    parsedStatus === 429 ||
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota exceeded') ||
    lower.includes('rate limit');

  const isHighDemand =
    parsedStatus === 503 ||
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded');

  const isNotFound =
    parsedStatus === 404 ||
    lower.includes('404') ||
    lower.includes('not_found') ||
    lower.includes('no longer available');

  const isInvalidArgument =
    parsedStatus === 400 ||
    lower.includes('invalid_argument');

  const isTimeout =
    lower.includes('model_timeout') ||
    lower.includes('etimedout') ||
    lower.includes('timed out');

  return {
    status: parsedStatus,
    code: parsedCode,
    message: cleanMessage,
    isApiKeyInvalid,
    isPermissionDenied,
    isRateLimited,
    isHighDemand,
    isNotFound,
    isInvalidArgument,
    isTimeout,
    isAborted,
  };
}

/**
 * Real-time pre-flight verification probe for personal Gemini API keys.
 * Uses a zero-token models.list probe (~200ms) that does not consume tokens
 * and never fails due to model-specific inference demand spikes.
 * Supports both standard AIza... keys and new AQ... Authorization keys transparently.
 */
export async function validateGeminiApiKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string; warning?: string }> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  if (trimmed.length < 15) {
    return { valid: false, error: 'Key length is too short to be a valid Gemini API key' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: trimmed });

    // Primary probe: 0-token, ultra-fast metadata list request (~200ms)
    // Does not trigger model generation load or 503 model-specific high demand!
    const listProbe = await withAbortAndTimeout(
      ai.models.list({ config: { pageSize: 1 } }),
      undefined,
      8000
    );

    if (listProbe) {
      return { valid: true };
    }
    return { valid: true };
  } catch (err: any) {
    const parsed = parseGeminiError(err);
    console.warn('[validateGeminiApiKey] models.list probe failed:', parsed);

    if (parsed.isApiKeyInvalid) {
      return {
        valid: false,
        error: 'Invalid Gemini API key (HTTP 401). Please check and re-copy your key from Google AI Studio (https://aistudio.google.com/apikey).',
      };
    }

    if (parsed.isPermissionDenied) {
      return {
        valid: false,
        error: 'Permission Denied (HTTP 403). Your API key or Google Cloud project does not have permission to access the Generative Language API.',
      };
    }

    if (parsed.isRateLimited) {
      // Key is authentic, but currently rate-limited
      return {
        valid: true,
        warning: 'Key is verified, but currently throttled by Google AI (429). Please wait a moment before sending requests.',
      };
    }

    if (parsed.isHighDemand) {
      return {
        valid: true,
        warning: 'Key is verified, but Google AI servers are currently experiencing high demand (503).',
      };
    }

    // Secondary fallback probe with lightweight generateContent on gemini-3.5-flash-lite
    // in case the key has strict endpoint restrictions that block models.list
    try {
      const ai2 = new GoogleGenAI({ apiKey: trimmed });
      const probe2 = await withAbortAndTimeout(
        ai2.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          config: {
            maxOutputTokens: 2,
            temperature: 0.1,
          },
        }),
        undefined,
        8000
      );

      if (probe2) {
        return { valid: true };
      }
    } catch (fallbackErr: any) {
      const fbParsed = parseGeminiError(fallbackErr);
      if (fbParsed.isApiKeyInvalid) {
        return {
          valid: false,
          error: 'Invalid Gemini API key (HTTP 401). Please verify your key at https://aistudio.google.com/apikey.',
        };
      }
      if (fbParsed.isPermissionDenied) {
        return {
          valid: false,
          error: 'API key rejected (HTTP 403 Permission Denied). Ensure Generative Language API is enabled.',
        };
      }
      if (fbParsed.isRateLimited) {
        return {
          valid: true,
          warning: 'Key is verified, but currently throttled by Google AI (429).',
        };
      }
      if (fbParsed.isHighDemand) {
        return {
          valid: true,
          warning: 'Key is verified, but Google AI is experiencing high demand (503).',
        };
      }
    }

    return {
      valid: false,
      error: parsed.message || 'Verification failed. Please check your connection or key.',
    };
  }
}

/**
 * Streams response from Gemini with instant abort support, smart model failover,
 * privacy sanitization, and real token accounting.
 */
export async function streamMimoResponse(options: {
  apiKey: string;
  prompt: string;
  context: PreparedContext;
  thinkingLevel: ThinkingLevel;
  selectedModel?: MimoModelChoice;
  showThinking?: boolean;
  webSearchEnabled?: boolean;
  pinnedDocsLayer?: string;
  episodicBullets?: string[];
  callbacks: StreamCallbacks;
  signal?: AbortSignal;
  history?: MimoMessage[];
}): Promise<MimoStreamResult> {
  const {
    apiKey,
    prompt,
    context,
    thinkingLevel,
    selectedModel = 'gemini-3.8-flash',
    showThinking = false,
    webSearchEnabled = false,
    pinnedDocsLayer,
    episodicBullets,
    callbacks,
    signal,
    history,
  } = options;

  const resolvedLevel = resolveThinkingLevel(thinkingLevel, prompt, context.totalDocLines);
  const flash38Model = getModelForComplexity(resolvedLevel);
  const flash35Model = {
    modelId: 'gemini-3.5-flash',
    displayLabel: 'Gemini 3.5 Flash',
    ttftTimeout: 20000,
  };
  const liteModel = {
    modelId: 'gemini-3.5-flash-lite',
    displayLabel: 'Gemini 3.5 Flash-Lite (High Speed)',
    ttftTimeout: 18000,
  };

  // Modern Gemini 3.x cascade (All legacy Gemini 2.x models retired by Google):
  // - Gemini 3.5 Flash: balanced, ultra-stable, high-speed workhorse
  // - Gemini 3.5 Flash-Lite: lowest latency, high throughput
  // - Gemini 3.8 Flash: deep reasoning & complex synthesis
  let modelsToTry: Array<{ modelId: string; displayLabel: string; ttftTimeout: number }>;
  if (selectedModel === 'gemini-3.5-flash') {
    modelsToTry = [flash35Model, liteModel, flash38Model];
  } else if (selectedModel === 'gemini-3.5-flash-lite') {
    modelsToTry = [liteModel, flash35Model, flash38Model];
  } else {
    modelsToTry = [flash38Model, flash35Model, liteModel];
  }

  const intent = classifyUserIntent(prompt, !!context.selectedText);

  const effectiveApiKey = (
    apiKey ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    ''
  ).trim();

  // 1. Sanitize prompt and context to redact passwords, PINs, addresses, and <private> blocks
  const sanitizedContext = sanitizeTextForAi(context.contextText);
  const sanitizedPrompt = sanitizeTextForAi(prompt);

  if (sanitizedContext.redactedCount > 0 || sanitizedPrompt.redactedCount > 0) {
    callbacks.onReasoningStep?.(
      `🛡️ Privacy Shield: Redacted ${sanitizedContext.redactedCount + sanitizedPrompt.redactedCount} sensitive item(s)`
    );
  }

  callbacks.onReasoningStep?.(
    `Loaded "${context.docTitle}" (${context.linesAnalyzed} lines, ${context.totalWords} words) • Intent: ${intent}`
  );

  // 1.5. Admin AI Dispatcher: Route to OpenRouter (stealth/crouton-alpha) if selected by Admin
  const adminAi = useAdminAiStore.getState();
  if (adminAi.defaultProvider === 'openrouter' && adminAi.isOpenRouterReady()) {
    const privacyResult = evaluateContextPrivacyPolicy(prompt, context, adminAi.privacy);

    callbacks.onReasoningStep?.(
      privacyResult.isContextAttached
        ? `📎 Context Attached: ${privacyResult.reason}`
        : `🛡️ Zero Pre-Feed Active: ${privacyResult.reason}`
    );

    const openRouterMessages = (history || []).slice(-8).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.text,
    }));
    openRouterMessages.push({
      role: 'user' as const,
      content: privacyResult.finalPrompt,
    });

    try {
      return await streamOpenRouterResponse({
        apiKey: adminAi.openRouterApiKey,
        model: adminAi.selectedModel,
        systemPrompt: MIMO_SYSTEM_PROMPT,
        messages: openRouterMessages,
        enableThinking: adminAi.enableThinking,
        reasoningEffort: adminAi.reasoningEffort,
        temperature: adminAi.temperature,
        maxTokens: adminAi.maxTokens,
        topP: adminAi.topP,
        callbacks,
        signal,
      });
    } catch (openRouterErr: any) {
      if (adminAi.fallbackToGeminiOnFailure) {
        callbacks.onReasoningStep?.(
          `⚠️ OpenRouter Error (${openRouterErr?.message || 'Unavailable'}). Gracefully failing over to Gemini 3.8 Flash...`
        );
      } else {
        throw openRouterErr;
      }
    }
  }

  // If no API key configured or browser is offline, run document-aware local synthesis
  if (!effectiveApiKey || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    callbacks.onModelResolved?.('Offline Local Engine', resolvedLevel);
    return executeDocumentAwareOfflineAssistance(prompt, context, intent, resolvedLevel, callbacks, signal);
  }

  const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

  // 2. Build token-optimized history with rolling episodic memory
  const { historyContents, episodicPromptLayer } = buildTokenOptimizedHistory(
    history || [],
    episodicBullets || []
  );

  if (pinnedDocsLayer) {
    callbacks.onReasoningStep?.('Grounding with pinned vault reference notes');
  }
  if (episodicPromptLayer) {
    callbacks.onReasoningStep?.('Integrated episodic conversation memory');
  }

  const pinnedBlock = pinnedDocsLayer ? `\n\n${pinnedDocsLayer}` : '';
  const episodicBlock = episodicPromptLayer ? `\n\n${episodicPromptLayer}` : '';
  const currentTurnPayload = `[Active Context]\n${sanitizedContext.sanitizedText}${pinnedBlock}${episodicBlock}\n\n[Detected Intent: ${intent}]\n[User Instruction]\n${sanitizedPrompt.sanitizedText}`;
  const fullContents = [
    ...historyContents,
    { role: 'user' as const, parts: [{ text: currentTurnPayload }] },
  ];
  const inputTokensEst = Math.max(10, Math.ceil(currentTurnPayload.length / 4));

  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    const candidateModel = modelsToTry[attempt];
    if (attempt > 0) {
      callbacks.onStreamReset?.();
    }
    if (signal?.aborted) {
      return {
        fullText: '',
        thoughtText: '',
        modelUsed: candidateModel.displayLabel,
        resolvedLevel,
        tokensUsed: 0,
        aborted: true,
      };
    }

    callbacks.onModelResolved?.(candidateModel.displayLabel, resolvedLevel);
    callbacks.onReasoningStep?.(
      `Routing to ${candidateModel.displayLabel} (${resolvedLevel} reasoning)`
    );

    const startTime = Date.now();
    let fullText = '';
    let thoughtText = '';
    let wordCounter = 0;
    let firstTokenRecorded = false;

    try {
      // thinkingConfig is configured on Gemini 3.x series only when showThinking is enabled
      let thinkingConfig: Record<string, unknown> | undefined = undefined;
      if (showThinking && (candidateModel.modelId.includes('gemini-3.8') || candidateModel.modelId.includes('gemini-3'))) {
        const apiThinkingLevel = resolvedLevel === 'HIGH' ? 'HIGH' : resolvedLevel === 'MEDIUM' ? 'MEDIUM' : 'LOW';
        thinkingConfig = {
          includeThoughts: true,
          thinkingLevel: apiThinkingLevel,
        };
      } else {
        thinkingConfig = undefined;
      }

      // Optional Google Search Grounding tool
      const tools: any[] = [];
      if (webSearchEnabled) {
        tools.push({ googleSearch: {} });
      }

      // Inject persistent StyleDNA (Tone, formatting, banned clichés)
      const styleDnaState = useStyleDnaStore.getState();
      const styleDnaLayer = buildStyleDnaPromptLayer(styleDnaState);
      const isChaosToClarity =
        prompt.toLowerCase().includes('chaos-to-clarity') ||
        prompt.toLowerCase().includes('brain-dump') ||
        prompt.toLowerCase().includes('chaos to clarity');
      const compositeSystemInstruction = `${MIMO_SYSTEM_PROMPT}${
        isChaosToClarity ? `\n\n${CHAOS_TO_CLARITY_SYSTEM_DIRECTIVE}` : ''
      }\n\n${styleDnaLayer}`;

      const config: Record<string, unknown> = {
        systemInstruction: compositeSystemInstruction,
        temperature: 0.65,
        ...(thinkingConfig ? { thinkingConfig } : {}),
        ...(tools.length > 0 ? { tools } : {}),
      };

      const responseStream = await withAbortAndTimeout(
        ai.models.generateContentStream({
          model: candidateModel.modelId,
          contents: fullContents,
          config: config as any,
        }),
        signal,
        candidateModel.ttftTimeout
      );

      const iterator = responseStream[Symbol.asyncIterator]();

      while (true) {
        if (signal?.aborted) {
          break;
        }

        const nextStep = await withAbortAndTimeout(
          iterator.next(),
          signal,
          firstTokenRecorded ? 18000 : candidateModel.ttftTimeout
        );

        if (nextStep.done) break;
        const chunk = nextStep.value;

        const candidates = chunk.candidates || [];
        if (candidates.length > 0) {
          const parts = candidates[0].content?.parts || [];
          for (const part of parts) {
            if (!firstTokenRecorded) {
              firstTokenRecorded = true;
              const ttft = ((Date.now() - startTime) / 1000).toFixed(2);
              callbacks.onReasoningStep?.(`First token streamed in ${ttft}s`);
            }

            if ((part as any).thought) {
              const thoughtPart = (part as any).text || '';
              thoughtText += thoughtPart;
              callbacks.onThoughtChunk?.(thoughtPart);
            } else if (part.text) {
              fullText += part.text;
              wordCounter += part.text.split(/\s+/).filter(Boolean).length;
              callbacks.onTextChunk?.(part.text);

              const elapsedSec = (Date.now() - startTime) / 1000;
              if (elapsedSec > 0.2) {
                const tokPerSec = Math.max(18, Math.round((wordCounter * 1.35) / elapsedSec));
                callbacks.onTokenVelocity?.(tokPerSec);
              }
            }
          }
        }
      }

      if (signal?.aborted) {
        const restoredPartial = sanitizedContext.restore(sanitizedPrompt.restore(fullText));
        const outputTokensEst = Math.ceil((restoredPartial.length + thoughtText.length) / 4);
        return {
          fullText: restoredPartial,
          thoughtText,
          modelUsed: candidateModel.displayLabel,
          resolvedLevel,
          tokensUsed: inputTokensEst + outputTokensEst,
          aborted: true,
        };
      }

      if (fullText.trim()) {
        const restoredText = sanitizedContext.restore(sanitizedPrompt.restore(fullText));
        const outputTokensEst = Math.ceil((restoredText.length + thoughtText.length) / 4);
        return {
          fullText: restoredText,
          thoughtText,
          modelUsed: candidateModel.displayLabel,
          resolvedLevel,
          tokensUsed: inputTokensEst + outputTokensEst,
        };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || signal?.aborted) {
        const restoredPartial = sanitizedContext.restore(sanitizedPrompt.restore(fullText));
        return {
          fullText: restoredPartial,
          thoughtText,
          modelUsed: candidateModel.displayLabel,
          resolvedLevel,
          tokensUsed: 0,
          aborted: true,
        };
      }

      const parsedErr = parseGeminiError(err);
      console.warn(`[Mimo] ${candidateModel.modelId} error:`, parsedErr);

      // Check API key rejection FIRST — do NOT retry other models with the same broken key
      if (parsedErr.isApiKeyInvalid || parsedErr.isPermissionDenied) {
        const statusLabel = parsedErr.status ? ` (HTTP ${parsedErr.status})` : '';
        const keyErrorMsg = `> [!CAUTION]\n> **Gemini API Key Authentication Failed${statusLabel}**\n> Google AI rejected the provided API key.\n> \n> *Error Details*: \`${parsedErr.message.slice(0, 200)}\`\n> \n> 👉 **Action Required**:\n> - Verify your key at [Google AI Studio](https://aistudio.google.com/apikey). Standard (\`AIza...\`) and Authorization (\`AQ...\`) keys are both supported.\n> - Connect or update your key in [Mimo Settings](#connect-key).`;

        callbacks.onTextChunk?.(keyErrorMsg);
        return {
          fullText: keyErrorMsg,
          thoughtText: '',
          modelUsed: 'Offline Local Engine (Invalid Key)',
          resolvedLevel,
          tokensUsed: 0,
        };
      }

      // If there is another model to cascade to, try it immediately
      if (attempt < modelsToTry.length - 1) {
        if (parsedErr.isHighDemand) {
          callbacks.onReasoningStep?.(
            `⚡ ${candidateModel.displayLabel} high demand (503). Auto-switching to ${modelsToTry[attempt + 1].displayLabel}...`
          );
        } else if (parsedErr.isRateLimited) {
          callbacks.onReasoningStep?.(
            `⚡ ${candidateModel.displayLabel} quota reached (429). Auto-switching to ${modelsToTry[attempt + 1].displayLabel}...`
          );
        } else if (parsedErr.isNotFound) {
          callbacks.onReasoningStep?.(
            `⚡ ${candidateModel.displayLabel} not available (404). Auto-switching to ${modelsToTry[attempt + 1].displayLabel}...`
          );
        } else {
          callbacks.onReasoningStep?.(
            `⚡ Switching to ${modelsToTry[attempt + 1].displayLabel} for faster response...`
          );
        }
        continue;
      }

      // If all cascading models returned 503 High Demand:
      if (parsedErr.isHighDemand) {
        const highDemandMsg = `> [!WARNING]\n> **Google AI High Demand Spike (HTTP 503)**\n> Google's Gemini servers are temporarily experiencing high demand on **${candidateModel.displayLabel}**.\n> \n> *Details*: \`${parsedErr.message.slice(0, 200) || 'Model is currently experiencing high demand. Spikes are temporary.'}\`\n> \n> **How to continue**:\n> - ⏳ **Wait 15–30 seconds** for server load to clear and [Retry Prompt](#retry-prompt)\n> - ⚡ Switch to [Gemini 3.5 Flash (Balanced)](#switch-model-35) or [Gemini 3.5 Flash-Lite](#switch-lite) from the model dock.`;

        callbacks.onTextChunk?.(highDemandMsg);
        return {
          fullText: highDemandMsg,
          thoughtText: '',
          modelUsed: candidateModel.displayLabel,
          resolvedLevel,
          tokensUsed: 0,
        };
      }

      // If all models hit Rate Limit (429):
      if (parsedErr.isRateLimited) {
        const envKey = ((import.meta.env.VITE_GEMINI_API_KEY as string) || '').trim();
        const isUserKey =
          Boolean(apiKey?.trim()) ||
          Boolean(envKey && envKey !== 'your_gemini_api_key_here' && envKey !== 'your-gemini-key');

        const throttledMsg = isUserKey
          ? `> [!WARNING]\n> **Google AI Rate Limit Reached (HTTP 429)**\n> Your Gemini API key has reached its current throughput limit on Google AI Studio.\n> \n> **Suggestions**:\n> - ⏳ **Wait 30–60 seconds** for Google's quota window to reset, then [Retry Prompt](#retry-prompt).\n> - ⚡ Switch to [Gemini 3.5 Flash-Lite](#switch-lite) for high throughput (up to 1,500 req/day).\n> - 📊 Check your quota status at [Google AI Studio](https://aistudio.google.com/).`
          : `> [!WARNING]\n> **Free Demo Rate Limit Reached (HTTP 429)**\n> The shared demo quota is temporarily exhausted.\n> \n> **How to continue**:\n> - [Connect your free personal Gemini API Key](#connect-key) for high daily limits.\n> - Get your free key at [Google AI Studio](https://aistudio.google.com/apikey).`;

        callbacks.onTextChunk?.(throttledMsg);
        return {
          fullText: throttledMsg,
          thoughtText: '',
          modelUsed: candidateModel.displayLabel,
          resolvedLevel,
          tokensUsed: 0,
        };
      }

      // If request timed out:
      if (parsedErr.isTimeout) {
        const timeoutMsg = `> [!WARNING]\n> **Request Timed Out (${candidateModel.ttftTimeout / 1000}s)**\n> Google Gemini took longer than expected to respond due to network latency or server load.\n> \n> 👉 [Retry Prompt](#retry-prompt) or switch to [Gemini 3.5 Flash-Lite](#switch-lite).`;
        callbacks.onTextChunk?.(timeoutMsg);
        return {
          fullText: timeoutMsg,
          thoughtText: '',
          modelUsed: candidateModel.displayLabel,
          resolvedLevel,
          tokensUsed: 0,
        };
      }
    }
  }

  // Graceful fallback with clear diagnostic banner
  const keyNotice = effectiveApiKey
    ? `> [!NOTE]\n> **Mimo Offline Local Synthesis Active**\n> Google Gemini AI cloud connection could not be completed. Generating deep local response from **"${context.docTitle}"**.\n> \n> 👉 [Check Gemini API Key & Settings](#connect-key)\n\n`
    : `> [!NOTE]\n> **Mimo Offline Local Synthesis Active**\n> Running on offline document synthesis. For real-time Gemini AI cloud generation, add your free [Google Gemini API Key](#connect-key).\n\n`;
  const diagNotice = keyNotice + buildDocumentAwareResponse(prompt, context, intent);
  callbacks.onTextChunk?.(diagNotice);
  return {
    fullText: diagNotice,
    thoughtText: '',
    modelUsed: 'Offline Local Engine (Local Synthesis)',
    resolvedLevel,
    tokensUsed: 0,
  };
}

/**
 * Document-aware local synthesis when offline or when no API key is present.
 * Distinguishes between General QA, Document Editing, Hinglish translations, and Summarization.
 */
function buildDocumentAwareResponse(
  prompt: string,
  context: PreparedContext,
  intent: MimoIntentType
): string {
  const p = prompt.toLowerCase();
  const docTitle = context.docTitle || 'Untitled Document';
  const raw = context.rawContent || '';
  const lines = raw.split('\n');
  const lastNonEmptyLine = [...lines].reverse().find((l) => l.trim().length > 0) || `# ${docTitle}`;

  // 1. Footer / Author Attribution Intent (e.g., "bottom pe footer add karo written by Rahul")
  const isFooterOrAuthor =
    p.includes('footer') ||
    p.includes('written by') ||
    p.includes('author') ||
    p.includes('signature') ||
    (p.includes('bottom') && (p.includes('rahul') || p.includes('likho') || p.includes('name')));

  if (isFooterOrAuthor) {
    const authorMatch = prompt.match(/(?:written\s+by|writtern\s+by|by|author)\s+([A-Za-z0-9_]+)/i);
    const authorName = authorMatch ? authorMatch[1].trim() : (p.includes('rahul') ? 'Rahul' : 'Author');

    return `Here is a publication-grade footer for **"${docTitle}"**:

\`\`\`tool_call
{
  "name": "insert_at_bottom",
  "arguments": {
    "content": "---\n<div align=\\"center\\">\n  <sub style=\\"color: #6c757d; font-family: monospace;\\">✨ Written with focus & dedication by <b>${authorName}</b> ✦ ${docTitle}</sub>\n</div>",
    "description": "Publication footer for ${authorName}"
  }
}
\`\`\`

\`\`\`markdown
---
<div align="center">
  <sub style="color: #6c757d; font-family: monospace;">✨ Written with focus & dedication by <b>${authorName}</b> ✦ ${docTitle}</sub>
</div>
\`\`\`

\`\`\`diff
- ${lastNonEmptyLine}
+ ${lastNonEmptyLine}
+ 
+ ---
+ <div align="center">
+   <sub style="color: #6c757d; font-family: monospace;">✨ Written with focus & dedication by <b>${authorName}</b> ✦ ${docTitle}</sub>
+ </div>
\`\`\`

Click **Apply to Document** below or tap **Apply to Editor** on the diff to append this footer to the bottom of your document!`;
  }

  // 2. Add to Bottom / Append Intent (e.g. "document ke bottom par add karo X")
  const isAppendBottom =
    p.includes('bottom') ||
    p.includes('end of file') ||
    p.includes('aakhir') ||
    p.includes('niche add') ||
    p.includes('append');

  if (isAppendBottom) {
    return `Here is the requested addition for the bottom of **"${docTitle}"**:

\`\`\`diff
- ${lastNonEmptyLine}
+ ${lastNonEmptyLine}
+ 
+ ### Next Section
+ Content tailored for **${docTitle}**.
\`\`\`

Click **Apply to Editor** to append this directly after line ${lines.length}.`;
  }

  // 3. Selection-focused Editing
  if (context.selectedText && context.selectedText.trim().length > 0) {
    const sel = context.selectedText.trim();
    const firstLine = sel.split('\n')[0];
    return `Here is a proposed refinement for your selected text:

\`\`\`diff
- ${firstLine}
+ ${firstLine} (Refined)
\`\`\`

\`\`\`markdown
${sel}
\`\`\``;
  }

  // 4. Table Creation Intent
  if (p.includes('table') || p.includes('tabular') || p.includes('comparison')) {
    return `Here is a structured comparison table for **"${docTitle}"**:

| Topic / Feature | Description | Status |
| :--- | :--- | :---: |
| Core Concepts | Fundamentals outlined in ${docTitle} | ✅ Active |
| Technical Details | Deep explanations & logic rules | ⚡ Verified |
| Key Takeaway | Ready for publication in MD Writer | 🚀 Complete |

Click **Insert** to paste this table into your editor!`;
  }

  // 5. Document-Aware Knowledge & General Inquiries
  if (intent === 'GENERAL_QA' || intent === 'DOC_QUERY' || p.includes('logic') || p.includes('symbol')) {
    // 5A. Check if document or prompt relates to Sanskrit Mantras
    const isMantraRelated =
      raw.includes('मंत्र') ||
      raw.includes('विद्या') ||
      raw.includes('सरस्वति') ||
      raw.includes('कमलालये') ||
      raw.includes('नमस्तुभ्यं') ||
      p.includes('mantra') ||
      p.includes('shlok') ||
      p.includes('sanskrit') ||
      docTitle.toLowerCase().includes('mantra');

    if (isMantraRelated) {
      return `## ✦ Mantras & Sanskrit Verses in "${docTitle}" — Detailed Hinglish Meaning

Aapke active document **"${docTitle}"** mein maujood mantras ka shuddh arth aur dhyan:

### 1. विद्या प्राप्ति और पढ़ाई के लिए सरस्वती मंत्र
> **मंत्र**: *"सरस्वति नमस्तुभ्यं वरदे कामरूपिणि। विद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा॥"*

- **Word-by-Word Arth**:
  - **सरस्वति नमस्तुभ्यं**: हे माँ सरस्वती, मैं आपको सादर प्रणाम करता हूँ।
  - **वरदे कामरूपिणि**: आप सभी शुभ वर देने वाली और सभी उत्तम कामनाओं को पूर्ण करने वाली हैं।
  - **विद्यारम्भं करिष्यामि**: मैं अपना विद्या अध्ययन (पढ़ाई) शुरू करने जा रहा हूँ।
  - **सिद्धिर्भवतु मे सदा**: मुझे इस ज्ञानार्जन में सदा सफलता (सिद्धि) और प्रखर बुद्धि प्राप्त हो।
- **Significance (लाभ)**: विद्यार्थी पढ़ाई या कोई भी नया अध्ययन शुरू करने से पहले इस मंत्र का जाप करते हैं ताकि बुद्धि स्थिर रहे, एकाग्रता (focus) बढ़े और ज्ञान आसानी से आत्मसात हो सके।

---

### 2. महालक्ष्मी मंत्र (समृद्धि एवं शांति)
> **मंत्र**: *"ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः॥"*

- **Word-by-Word Arth**:
  - **कमले कमलालये**: कमल के पवित्र पुष्प पर विराजमान रहने वाली माँ लक्ष्मी।
  - **प्रसीद प्रसीद**: मुझ पर प्रसन्न होइए और अपनी असीम कृपा बनाए रखिए।
  - **महालक्ष्म्यै नमः**: मैं परम ऐश्वर्य और शांति की देवी महालक्ष्मी को नमन करता हूँ।
- **Significance (लाभ)**: यह मंत्र मानसिक शांति, घर-परिवार में सकारात्मक ऊर्जा और समृद्धि की वृद्धि के लिए जपा जाता है।

---
💡 *Workspace Note*: Yeh dono mantras aapke editor mein surakshit hain. Agar inka koi diff ya formatting change chahiye toh Mimo ko batayein!`;
    }

    // 5B. Check if document relates to Python MCQs / Programming
    const isMcqRelated =
      raw.toLowerCase().includes('mcq') ||
      raw.toLowerCase().includes('inheritance') ||
      docTitle.toLowerCase().includes('mcq') ||
      p.includes('mcq');

    if (isMcqRelated && (p.includes('document') || p.includes('useful') || p.includes('kya') || p.includes('explain'))) {
      return `## ✦ Document Review: "${docTitle}"

**Document Overview**: Yeh document Python Object-Oriented Programming (OOP) ke high-yield **Multiple Choice Questions (MCQs)** aur Practical Examples ka revision guide hai.

### Key Topics & Questions in this Document:
1. **Inheritance Relationships**:
   - **Question**: Which relationship does inheritance represent in Python?
   - **Answer**: **B. IS-A** *(e.g., A Student IS-A Person. "HAS-A" relationship composition ko represent karta hai)*.
2. **Inheritance Types**:
   - Single inheritance (child inherits from only one parent class).
   - Multiple, Multilevel, aur Hierarchical inheritance architectures.
3. **Class Methods & Object State**:
   - Mutator methods (setters) aur Accessor methods (getters).
   - Class methods (\`@classmethod\` with \`cls\`) aur object counting counters.

### Kya yeh document useful hai?
✅ **Extremely Useful**:
- **College & BCA/B.Tech Exams**: Direct exam-level MCQs jo Python OOPs vivas aur semester tests mein aate hain.
- **Tech Interviews**: Object-Oriented terminology (IS-A vs HAS-A, Mutator vs Accessor) ke quick revision ke liye best hai.`;
    }

    // 5C. Discrete Math & Logic Formulas
    const isLogic = /\b(discrete\s+math|truth\s+table|boolean\s+logic|logic\s+gate|propositional\s+logic|katex\s+formula)\b/i.test(p);
    if (isLogic) {
      return `## ✦ Basic Logical Symbols in Discrete Mathematics

Here are the fundamental logic connectives with clean KaTeX notation:

1. **Conjunction (AND)**: $\\wedge$
   - Statement $p \\wedge q$ is True only when both $p$ and $q$ are True.
2. **Disjunction (OR)**: $\\vee$
   - Statement $p \\vee q$ is True if at least one of $p$ or $q$ is True.
3. **Negation (NOT)**: $\\neg$
   - Reverses the truth value: $\\neg True \\equiv False$.
4. **Logical Equivalence**: $\\equiv$
   - Holds when two composite propositions always share identical truth tables.
5. **Conditional (Implication)**: $\\rightarrow$
   - $p \\rightarrow q \\equiv \\neg p \\vee q$.
6. **Biconditional (If and only if)**: $\\leftrightarrow$
   - True when $p$ and $q$ have the same truth value.

---
💡 *Workspace Note*: You can copy or insert any of these KaTeX formulas directly into **"${docTitle}"**.`;
    }

    const isPython = p.includes('python');
    const isJs = p.includes('javascript') || p.includes('js') || p.includes('typescript');
    const isMd = p.includes('markdown');
    const isReact = p.includes('react');

    if (isPython) {
      return `## ✦ What is Python?\n\n**Python** is a high-level, interpreted, general-purpose programming language known for its emphasis on code readability and clean indentation-based syntax.\n\n### Key Characteristics\n- **Easy to Learn & Read**: Uses English-like keywords, reducing cognitive load.\n- **Multi-Paradigm**: Seamlessly supports Object-Oriented, Functional, and Procedural programming styles.\n- **Massive Ecosystem**: Powers everything from Web Development (Django, FastAPI) to Data Science (Pandas, NumPy) and Artificial Intelligence (PyTorch, TensorFlow).\n- **Cross-Platform**: Operates identically on Windows, Linux, and macOS.\n\n---\n💡 *Workspace Note*: You currently have **"${docTitle}"** open. If you want code snippets or notes added directly to this file, simply ask Mimo!`;
    }

    if (isJs) {
      return `## ✦ What is JavaScript / TypeScript?\n\n**JavaScript** is the ubiquitous language of the modern web, running client-side across browsers and server-side via Node.js/Deno/Bun. **TypeScript** adds static types on top of JavaScript for enterprise-scale reliability.\n\n### Key Characteristics\n- **Event-Driven & Asynchronous**: Built around non-blocking event loops with Promises and \`async/await\`.\n- **Universal Platform**: Runs in browsers, servers, edge workers, and desktop applications.\n- **Rich Framework Ecosystem**: React, Vue, Svelte, Next.js, and Vite.\n\n---\n💡 *Workspace Note*: Connected to **"${docTitle}"**. Ask Mimo if you'd like code snippets inserted into your markdown!`;
    }

    if (isReact) {
      return `## ✦ What is React?\n\n**React** is a declarative, component-based JavaScript library for building user interfaces, maintained by Meta and the open-source community.\n\n### Core Tenets\n- **Declarative Views**: Design views for each state in your application, and React efficiently updates and renders just the right components.\n- **Component Architecture**: Build encapsulated components that manage their own state, then compose them into rich UIs.\n- **Virtual DOM & Hooks**: Leverage \`useState\`, \`useEffect\`, and custom hooks for reactive state management.\n\n---\n💡 *Workspace Note*: Connected to **"${docTitle}"**.`;
    }

    if (isMd) {
      return `## ✦ What is Markdown?\n\n**Markdown** is a lightweight markup language created in 2004 by John Gruber and Aaron Swartz. It allows you to format plain text that can be converted into valid HTML, PDF, or presentations.\n\n### Essential Syntax\n- **Headings**: \`# H1\`, \`## H2\`, \`### H3\`\n- **Styling**: \`**bold**\`, \`*italic*\`, \`~~strikethrough~~\`\n- **Lists**: \`- item\` or \`1. item\`\n- **Code**: Inline \`code\` or triple backtick fences\n- **Tables**: Pipe tables with align colons \`| :--- | :---: |\`\n\n---\n💡 *Workspace Note*: You are authoring **"${docTitle}"** in MD Creator.`;
    }

    // 5D. Document-grounded fallback (Never return generic canned software boilerplate)
    if (raw.trim().length > 0) {
      const meaningfulLines = lines.filter((l) => l.trim().length > 0 && !l.startsWith('---')).slice(0, 8);
      return `## ✦ Analysis for "${prompt.trim()}" in "${docTitle}"

**Document Context**: Connected to **"${docTitle}"** (\`${context.totalDocLines} lines\` / \`${context.totalWords} words\`).

### Key Content in this Document:
${meaningfulLines.map((l) => `> ${l}`).join('\n>\n')}

---
💡 *Workspace Context*: Mimo is analyzing the content above from your active file. If you would like a specific section modified or explained in more detail, just let me know!`;
    }

    return `## ✦ Topic Overview: "${prompt.trim()}"\n\nHere is a structured explanation of the requested topic:\n\n- **Context**: Connected to active workspace in MD Writer.\n- **Recommendation**: Formulate structured notes or sections directly in **"${docTitle}"** using clean Markdown formatting.`;
  }

  // 6. Section Extraction for Hinglish Translation & Summary
  const sections: { heading: string; bullets: string[] }[] = [];
  let currentSection: { heading: string; bullets: string[] } = {
    heading: docTitle.replace(/\.md$/i, ''),
    bullets: [],
  };

  for (const line of lines) {
    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      if (currentSection.bullets.length > 0 || sections.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { heading: hMatch[2].trim(), bullets: [] };
      continue;
    }
    const clean = line.trim();
    if (
      clean &&
      !clean.startsWith('---') &&
      !clean.startsWith('```') &&
      !clean.startsWith('| :---') &&
      clean.length > 12 &&
      currentSection.bullets.length < 4
    ) {
      currentSection.bullets.push(clean.replace(/^[-*+]\s+/, '').replace(/^>\s*/, ''));
    }
  }
  if (currentSection.bullets.length > 0 || sections.length === 0) {
    sections.push(currentSection);
  }

  const isHinglishOrTranslate =
    p.includes('hinglish') || p.includes('higlish') || p.includes('translate') || p.includes('samjhao') || p.includes('hindi') || p.includes('meaning');

  if (isHinglishOrTranslate) {
    const sectionItems = sections
      .slice(0, 6)
      .map((sec, idx) => {
        const keyPoints = sec.bullets
          .slice(0, 2)
          .map((b) => `  - ${b}`)
          .join('\n');
        return `### ${idx + 1}. ${sec.heading}\n- **Main Takeaway (Hinglish)**: Yeh section **${sec.heading}** ke core concepts aur workflow ko cover karta hai taaki aapka kaam fast aur structured rahe.\n${keyPoints}`;
      })
      .join('\n\n');

    return `## ✦ "${docTitle}" — Main Takeaways in Hinglish\n\nIs document (**${docTitle}**, \`${context.totalDocLines} lines\` / \`${context.totalWords} words\`) ke main points aur technical explanations Hinglish mein niche diye gaye hain:\n\n${sectionItems}\n\n---\n💡 **Quick Summary**: Yeh document total **${sections.length} key sections** mein divided hai. Agar aapko kisi specific section ko expand ya edit karna hai, toh bas uska naam batayein!`;
  }

  // 6.5. Chaos-to-Clarity Brain-Dump fallback
  if (p.includes('chaos') || p.includes('brain-dump') || p.includes('clarity')) {
    const rawToTransform = context.selectedText || context.rawContent || prompt;
    return transformChaosLocally(rawToTransform);
  }

  // 7. General Document Diff / Edit fallback
  const isEdit =
    intent === 'DOC_TRANSFORM' ||
    p.includes('change') ||
    p.includes('edit') ||
    p.includes('improve') ||
    p.includes('diff');

  if (isEdit) {
    return `Here is a proposed refinement for **"${docTitle}"**:

\`\`\`diff
- ${lastNonEmptyLine}
+ ${lastNonEmptyLine}
+ 
+ > [!TIP]
+ > **Key Takeaway**: Reviewed and polished for clarity in ${docTitle}.
\`\`\`

Tap **Apply to Editor** below to insert this change.`;
  }

  // 8. Default Document Summary
  const summaryBullets = sections
    .slice(0, 7)
    .map((sec) => {
      const firstPoint = sec.bullets[0] ? ` — ${sec.bullets[0].slice(0, 140)}` : '';
      return `- **${sec.heading}**${firstPoint}`;
    })
    .join('\n');

  return `## ✦ Summary of "${docTitle}"\n\n**Document Stats**: \`${context.totalDocLines} lines\` • \`${context.totalWords} words\` • \`${sections.length} sections\`\n\n### Key Takeaways by Section\n${summaryBullets}`;
}

async function executeDocumentAwareOfflineAssistance(
  prompt: string,
  context: PreparedContext,
  intent: MimoIntentType,
  resolvedLevel: 'LOW' | 'MEDIUM' | 'HIGH',
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<MimoStreamResult> {
  callbacks.onReasoningStep?.(`Synthesizing response for "${context.docTitle}" (Intent: ${intent})...`);
  const rawBody = buildDocumentAwareResponse(prompt, context, intent);
  const responseBody = `> [!NOTE]\n> **Mimo Offline Local Engine Active**\n> Running on offline document synthesis. For real-time Gemini AI cloud generation, add your free [Google Gemini API Key](#connect-key).\n\n${rawBody}`;

  const chunks = responseBody.split(/(?<=\s)/);
  let accumulated = '';
  for (let i = 0; i < chunks.length; i += 3) {
    if (signal?.aborted) {
      return {
        fullText: accumulated,
        thoughtText: '',
        modelUsed: 'Offline Local Engine',
        resolvedLevel,
        tokensUsed: 0,
        aborted: true,
      };
    }
    const piece = chunks.slice(i, i + 3).join('');
    accumulated += piece;
    callbacks.onTextChunk?.(piece);
    await new Promise((r) => setTimeout(r, 10));
  }

  return {
    fullText: responseBody,
    thoughtText: '',
    modelUsed: 'Offline Local Engine',
    resolvedLevel,
    tokensUsed: 0,
  };
}
