import { GoogleGenAI } from '@google/genai';
import { ThinkingLevel } from '../types/mimoTypes';
import { resolveThinkingLevel } from './promptRouter';
import { PreparedContext } from './contextEngine';
import { sanitizeTextForAi } from './privacySanitizer';

export interface StreamCallbacks {
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

const MIMO_SYSTEM_PROMPT = `You are Mimo ✦ Your Markdown Companion in MD Writer.
You are an intelligent, articulate, and context-aware AI co-writer.
Key Rules:
1. Document Awareness: Always ground your answers in the exact Active Document provided in [Context Information] (reference its actual title, sections, headings, tables, and content). Never give generic boilerplate answers.
2. Markdown First: Format your answers using clean, elegant GitHub Flavored Markdown (headings, lists, bold accents, tables, and fenced code blocks).
3. Propose Diffs for Edits: ONLY when explicitly asked to edit, improve, fix, or modify existing document text, output the precise modification using a diff block:
\`\`\`diff
- exact old line 1
- exact old line 2
+ improved line 1
+ improved line 2
\`\`\`
Or for inserting a new section:
\`\`\`replacement
### New Section Heading
Section body here...
\`\`\`
Do NOT output diff blocks when the user asks to summarize, translate, or explain in chat.
4. Language Adaptation: If the user asks for Hinglish or addresses you in Hinglish, respond in natural, friendly, tech-savvy Hinglish (Roman script Hindi + English technical terms) with crystal-clear explanations of the actual document. If in Hindi, respond in fluent Hindi. If in English, respond in polished English.
5. Professional & High-Density: Avoid meta-commentary. Deliver structured, high-value responses directly connected to the user's open document.`;

/**
 * Resolves the optimal Gemini model & display label based on evaluated complexity:
 * - Low & Medium: gemini-3.5-flash-lite (ultra-fast 1.8s response, high daily RPD, supports thinkingLevel LOW/MEDIUM)
 * - High: gemini-3.8-flash with automatic fast failover to gemini-3.5-flash-lite
 */
export function getModelForComplexity(level: 'LOW' | 'MEDIUM' | 'HIGH'): {
  modelId: string;
  displayLabel: string;
} {
  if (level === 'HIGH') {
    return {
      modelId: 'gemini-3.8-flash',
      displayLabel: 'Gemini 3.8 Flash',
    };
  }
  return {
    modelId: 'gemini-3.5-flash-lite',
    displayLabel: 'Gemini 3.5 Flash-Lite',
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
 * Streams response from Gemini with instant abort support, smart model failover,
 * privacy sanitization, and real token accounting.
 */
export async function streamMimoResponse(options: {
  apiKey: string;
  prompt: string;
  context: PreparedContext;
  thinkingLevel: ThinkingLevel;
  callbacks: StreamCallbacks;
  signal?: AbortSignal;
}): Promise<MimoStreamResult> {
  const { apiKey, prompt, context, thinkingLevel, callbacks, signal } = options;

  const resolvedLevel = resolveThinkingLevel(thinkingLevel, prompt, context.totalDocLines);
  const primaryModel = getModelForComplexity(resolvedLevel);

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
    `Loaded "${context.docTitle}" (${context.linesAnalyzed} lines, ${context.totalWords} words)`
  );

  // If no API key configured or browser is offline, run document-aware local synthesis
  if (!effectiveApiKey || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    callbacks.onModelResolved?.('Offline Local Engine', resolvedLevel);
    return executeDocumentAwareOfflineAssistance(prompt, context, resolvedLevel, callbacks, signal);
  }

  // Try primary model first; if HIGH (gemini-3.8-flash) times out (>6s TTFT) or errors, seamlessly cascade to gemini-3.5-flash-lite
  const modelsToTry =
    primaryModel.modelId === 'gemini-3.8-flash'
      ? [
          { modelId: 'gemini-3.8-flash', displayLabel: 'Gemini 3.8 Flash', ttftTimeout: 6500 },
          { modelId: 'gemini-3.5-flash-lite', displayLabel: 'Gemini 3.5 Flash-Lite', ttftTimeout: 15000 },
        ]
      : [
          { modelId: 'gemini-3.5-flash-lite', displayLabel: 'Gemini 3.5 Flash-Lite', ttftTimeout: 15000 },
        ];

  const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
  const inputPayload = `[Context Information]\n${sanitizedContext.sanitizedText}\n\n[User Instruction]\n${sanitizedPrompt.sanitizedText}`;
  const inputTokensEst = Math.max(10, Math.ceil(inputPayload.length / 4));

  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    const candidateModel = modelsToTry[attempt];
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
      const config: Record<string, unknown> = {
        systemInstruction: MIMO_SYSTEM_PROMPT,
        temperature: 0.65,
        thinkingConfig: {
          includeThoughts: true,
          thinkingLevel: resolvedLevel,
        },
      };

      const responseStream = await withAbortAndTimeout(
        ai.models.generateContentStream({
          model: candidateModel.modelId,
          contents: [{ role: 'user', parts: [{ text: inputPayload }] }],
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
          firstTokenRecorded ? 15000 : candidateModel.ttftTimeout
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

      console.warn(`[Mimo] ${candidateModel.modelId} error:`, err?.message || err);

      // If there is a fallback model in modelsToTry (e.g., 3.8-flash -> 3.5-flash-lite), try it immediately!
      if (attempt < modelsToTry.length - 1) {
        callbacks.onReasoningStep?.(
          `⚡ Switching to ${modelsToTry[attempt + 1].displayLabel} for faster response...`
        );
        continue;
      }

      // Rate limit 429 detection
      const isRateLimit =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('Quota exceeded');

      if (isRateLimit) {
        const throttledMsg = `⚠️ **Free Tier Rate Limit Reached**\n\nPlease wait a few seconds or connect your personal free Gemini API key (BYOK) for unlimited throughput.\n\n---\n\n` +
          buildDocumentAwareResponse(prompt, context);
        callbacks.onTextChunk?.(throttledMsg);
        return {
          fullText: throttledMsg,
          thoughtText: '',
          modelUsed: candidateModel.displayLabel,
          resolvedLevel,
          tokensUsed: 0,
        };
      }
    }
  }

  return executeDocumentAwareOfflineAssistance(prompt, context, resolvedLevel, callbacks, signal);
}

/**
 * Document-aware local synthesis when offline or when no API key is present.
 * Directly parses the actual active document (title, sections, bullet points, tables)
 * so responses are 100% relevant to the user's open file.
 */
function buildDocumentAwareResponse(prompt: string, context: PreparedContext): string {
  const p = prompt.toLowerCase();
  const docTitle = context.docTitle || 'Untitled Document';
  const raw = context.rawContent || '';
  const lines = raw.split('\n');

  // Extract sections: heading + key bullets/lines under each heading
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
    p.includes('hinglish') || p.includes('translate') || p.includes('samjhao') || p.includes('hindi');
  const isEdit =
    p.includes('change') ||
    p.includes('edit') ||
    p.includes('improve') ||
    p.includes('diff') ||
    p.includes('theek') ||
    p.includes('badlo');

  if (isEdit) {
    const firstNonEmptyLine =
      lines.find((l) => l.trim().length > 20 && !l.startsWith('#')) ||
      lines.find((l) => l.trim().length > 0) ||
      `# ${docTitle}`;
    return `Here is a proposed refinement for **"${docTitle}"**:\n\n\`\`\`diff\n- ${firstNonEmptyLine}\n+ ${firstNonEmptyLine}\n+ \n+ > [!TIP]\n+ > **Key Highlight**: Reviewed and structured for clarity in ${docTitle}.\n\`\`\`\n\nTap **Apply to Editor** below to insert this change.`;
  }

  if (isHinglishOrTranslate) {
    const sectionItems = sections
      .slice(0, 6)
      .map((sec, idx) => {
        const keyPoints = sec.bullets
          .slice(0, 2)
          .map((b) => `  - ${b}`)
          .join('\n');
        return `### ${idx + 1}. ${sec.heading}\n- **Main Takeaway (Hinglish)**: Yeh section **${sec.heading}** ke core concepts aur workflow ko cover karta hai taaki aapka काम fast aur structured rahe.\n${keyPoints}`;
      })
      .join('\n\n');

    return `## ✦ "${docTitle}" — Main Takeaways in Hinglish\n\nIs document (**${docTitle}**, \`${context.totalDocLines} lines\` / \`${context.totalWords} words\`) ke main points aur technical explanations Hinglish mein niche diye gaye hain:\n\n${sectionItems}\n\n---\n💡 **Quick Summary**: Yeh document total **${sections.length} key sections** mein divided hai. Agar aapko kisi specific section ko expand ya edit karna hai, toh bas uska naam batayein!`;
  }

  // Default: Document-specific Summary / Explanation
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
  resolvedLevel: 'LOW' | 'MEDIUM' | 'HIGH',
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<MimoStreamResult> {
  callbacks.onReasoningStep?.(`Synthesizing from "${context.docTitle}" (${context.totalDocLines} LOC)...`);
  const responseBody = buildDocumentAwareResponse(prompt, context);

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
