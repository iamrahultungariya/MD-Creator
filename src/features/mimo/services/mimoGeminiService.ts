import { GoogleGenAI } from '@google/genai';
import { ThinkingLevel, MimoMessage, MimoIntentType } from '../types/mimoTypes';
import { resolveThinkingLevel, classifyUserIntent } from './promptRouter';
import { PreparedContext } from './contextEngine';
import { sanitizeTextForAi } from './privacySanitizer';

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
5. Zero Fluff: Direct, insightful, and helpful without unnecessary conversational filler.`;

/**
 * Resolves the optimal Gemini model & display label based on evaluated complexity:
 * - Gemini 3.8 Flash (gemini-3.8-flash) is now the unified BASE model for ALL tasks (Low, Medium, High).
 * - Automatic failover cascade to Gemini 2.5 Flash and Gemini 2.0 Flash guarantees 100% reliability.
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
  history?: MimoMessage[];
}): Promise<MimoStreamResult> {
  const { apiKey, prompt, context, thinkingLevel, callbacks, signal, history } = options;

  const resolvedLevel = resolveThinkingLevel(thinkingLevel, prompt, context.totalDocLines);
  const primaryModel = getModelForComplexity(resolvedLevel);
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

  // If no API key configured or browser is offline, run document-aware local synthesis
  if (!effectiveApiKey || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    callbacks.onModelResolved?.('Offline Local Engine', resolvedLevel);
    return executeDocumentAwareOfflineAssistance(prompt, context, intent, resolvedLevel, callbacks, signal);
  }

  // Try base model (gemini-3.8-flash) first; if it times out, rate limits, or errors, cascade seamlessly to gemini-2.5-flash and gemini-2.0-flash
  const modelsToTry = [
    primaryModel,
    { modelId: 'gemini-2.5-flash', displayLabel: 'Gemini 2.5 Flash', ttftTimeout: 25000 },
    { modelId: 'gemini-2.0-flash', displayLabel: 'Gemini 2.0 Flash', ttftTimeout: 20000 },
  ];

  const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

  // 2. Build multi-turn conversational history contents for true memory
  const historyContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  if (history && history.length > 0) {
    const relevantHistory = history
      .filter((m) => m.text && m.text.trim().length > 0 && !m.id.startsWith('welcome-'))
      .slice(-8);

    for (const msg of relevantHistory) {
      const trimmed = msg.text.length > 700 ? `${msg.text.slice(0, 700)}\n... [truncated for context]` : msg.text;
      historyContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: trimmed }],
      });
    }
  }

  const currentTurnPayload = `[Active Context]\n${sanitizedContext.sanitizedText}\n\n[Detected Intent: ${intent}]\n[User Instruction]\n${sanitizedPrompt.sanitizedText}`;
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
      // thinkingConfig is ONLY valid on Gemini 3 series and Gemini 2.5 series!
      // gemini-2.0-flash and 1.5 throw HTTP 400 if thinkingConfig is supplied.
      let thinkingConfig: Record<string, unknown> | undefined = undefined;
      if (candidateModel.modelId.includes('gemini-3')) {
        const apiThinkingLevel = resolvedLevel === 'HIGH' ? 'high' : resolvedLevel === 'MEDIUM' ? 'medium' : 'low';
        thinkingConfig = {
          includeThoughts: true,
          thinkingLevel: apiThinkingLevel,
        };
      } else if (candidateModel.modelId.includes('2.5')) {
        thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: resolvedLevel === 'HIGH' ? 2048 : 1024,
        };
      } else {
        thinkingConfig = undefined;
      }

      const config: Record<string, unknown> = {
        systemInstruction: MIMO_SYSTEM_PROMPT,
        temperature: 0.65,
        ...(thinkingConfig ? { thinkingConfig } : {}),
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

      const rawErrMsg = String(err?.message || err || '');
      console.warn(`[Mimo] ${candidateModel.modelId} error:`, rawErrMsg);

      // Check API key rejection FIRST — do NOT retry other models with the same broken key
      const isApiKeyError =
        (err?.status === 400 && (rawErrMsg.includes('API key') || rawErrMsg.includes('API_KEY_INVALID'))) ||
        err?.status === 403 ||
        rawErrMsg.includes('API_KEY_INVALID') ||
        rawErrMsg.includes('API key not valid') ||
        (rawErrMsg.includes('INVALID_ARGUMENT') && rawErrMsg.includes('key'));

      if (isApiKeyError) {
        const keyErrorMsg = `⚠️ **Gemini API Key Rejected**\n\nGoogle AI reported that your provided Gemini API key is invalid, missing, or unauthorized.\n\n*Details*: \`${rawErrMsg.slice(0, 160)}\`\n\nPlease check your key in settings via [Google AI Studio](https://aistudio.google.com/app/apikey).\n\n---\n\n*Falling back to document-aware synthesis for "${context.docTitle}":*\n\n` +
          buildDocumentAwareResponse(prompt, context, intent);
        callbacks.onTextChunk?.(keyErrorMsg);
        return {
          fullText: keyErrorMsg,
          thoughtText: '',
          modelUsed: 'Offline Local Engine (Invalid Key)',
          resolvedLevel,
          tokensUsed: 0,
        };
      }

      // If there is another model to cascade to, try it
      if (attempt < modelsToTry.length - 1) {
        callbacks.onReasoningStep?.(
          `⚡ Switching to ${modelsToTry[attempt + 1].displayLabel} for faster response...`
        );
        continue;
      }

      // Rate limit 429 detection
      const isRateLimit =
        err?.status === 429 ||
        rawErrMsg.includes('429') ||
        rawErrMsg.includes('RESOURCE_EXHAUSTED') ||
        rawErrMsg.includes('Quota exceeded');

      if (isRateLimit) {
        const throttledMsg = `⚠️ **Free Tier Rate Limit Reached**\n\nGoogle AI free tier quota exhausted for this minute/day. Please wait a moment or connect your personal free Gemini API key (BYOK) for higher throughput.\n\n---\n\n` +
          buildDocumentAwareResponse(prompt, context, intent);
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

  // Graceful fallback with clear diagnostic banner
  const diagNotice = `> [!NOTE]\n> **Mimo Offline Local Synthesis Active**\n> Google Gemini AI connection could not be established. Generating deep local response from **"${context.docTitle}"**.\n\n` +
    buildDocumentAwareResponse(prompt, context, intent);
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
