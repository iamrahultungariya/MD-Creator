import {
  OpenRouterReasoningEffort,
  ThinkingProbeResult,
  OpenRouterMessage,
  OpenRouterChatCompletionRequest,
} from '../types/adminAi';
import { StreamCallbacks, MimoStreamResult } from '../features/mimo/services/mimoGeminiService';

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-4o';

export const APP_REFERER = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://mdcreator.app';
export const getAppReferer = () => APP_REFERER;
export const APP_TITLE = 'MD Writer';

/**
 * Validates an OpenRouter API key by performing a lightweight 1-token probe request.
 */
export async function validateOpenRouterApiKey(
  apiKey: string,
  model: string = DEFAULT_OPENROUTER_MODEL
): Promise<{
  valid: boolean;
  error?: string;
  warning?: string;
  latencyMs?: number;
  label?: string;
  freeLimitRemaining?: number;
}> {
  const cleanKey = (apiKey || (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '').trim();
  if (!cleanKey) {
    return { valid: false, error: 'OpenRouter API key is empty.' };
  }

  const startTime = performance.now();
  try {
    // 1. Verify key authenticity with OpenRouter key authentication endpoint
    const authRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (authRes.status === 401) {
      return { valid: false, error: 'Invalid OpenRouter API Key (401 Unauthorized).' };
    }

    if (!authRes.ok) {
      return { valid: false, error: `Key validation failed with status ${authRes.status}.` };
    }

    const authData = await authRes.json().catch(() => ({}));
    const keyData = authData?.data;
    const label = keyData?.label;
    const freeLimitRemaining = keyData?.free_model_daily_requests?.remaining ?? 50;

    // 2. Probe model endpoints with test ping
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': APP_REFERER,
        'X-Title': APP_TITLE,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'What is the meaning of life?' }],
        max_tokens: 1,
      }),
    });

    if (res.ok) {
      return { valid: true, latencyMs, label, freeLimitRemaining };
    }

    const data = await res.json().catch(() => ({}));
    const message = data?.error?.message || res.statusText || 'Verification failed';

    if (res.status === 404 && message.includes('restricted to BYOK capacity')) {
      return {
        valid: true,
        latencyMs,
        label,
        freeLimitRemaining,
        warning:
          'Key verified! However, your OpenRouter workspace has BYOK-only enforcement. Visit https://openrouter.ai/workspaces/default/byok to enable public models or add credits.',
      };
    }

    if (res.status === 402) {
      return { valid: true, latencyMs, label, freeLimitRemaining, warning: 'Key verified! However, this OpenRouter account has 0 credits. Add credits at https://openrouter.ai/credits to use ' + model + '.' };
    }
    if (res.status === 429) {
      return { valid: true, error: 'Key is valid, but OpenRouter is currently rate-limited (429).' };
    }

    return { valid: false, error: `OpenRouter Error (${res.status}): ${message}` };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Network error connecting to OpenRouter.' };
  }
}

/**
 * Diagnostic Inspector: Tests if stealth/crouton-alpha supports native reasoning tokens,
 * tag-based thinking (<think>...</think>), or bypasses reasoning parameters.
 */
export async function runThinkingCapabilityProbe(options: {
  apiKey: string;
  model?: string;
  effort?: OpenRouterReasoningEffort;
  signal?: AbortSignal;
}): Promise<ThinkingProbeResult> {
  const {
    apiKey,
    model = DEFAULT_OPENROUTER_MODEL,
    effort = 'medium',
    signal,
  } = options;

  const cleanKey = (apiKey || (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '').trim();
  if (!cleanKey) {
    return {
      lastTested: Date.now(),
      status: 'error',
      hasNativeReasoningTokens: false,
      hasTagBasedThinking: false,
      latencyMs: 0,
      tokensUsed: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: 0,
      errorMessage: 'Missing OpenRouter API Key. Please enter your key first.',
    };
  }

  const startTime = performance.now();
  const testPrompt =
    'Problem: A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost? Think step by step before stating the final answer.';

  const requestPayload: OpenRouterChatCompletionRequest = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a precise reasoning model. When given a problem, provide your step-by-step thinking or rationale before your final answer.',
      },
      { role: 'user', content: testPrompt },
    ],
    temperature: 0.2,
    max_tokens: 500,
    reasoning: { effort },
    reasoning_effort: effort,
  };

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': APP_REFERER,
        'X-Title': APP_TITLE,
      },
      body: JSON.stringify(requestPayload),
      signal,
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const rawErrMsg = errData?.error?.message || `HTTP ${res.status}`;
      const isByokRestricted = rawErrMsg.includes('restricted to BYOK capacity');
      const errMsg = isByokRestricted
        ? "OpenRouter key is authentic, but this workspace is restricted to BYOK. Visit https://openrouter.ai/workspaces/default/byok to toggle off BYOK restriction or add credits."
        : `OpenRouter probe failed: ${rawErrMsg}`;

      return {
        lastTested: Date.now(),
        status: 'error',
        hasNativeReasoningTokens: false,
        hasTagBasedThinking: false,
        latencyMs,
        tokensUsed: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        cost: 0,
        httpStatus: res.status,
        errorMessage: errMsg,
      };
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const message = choice?.message || {};
    const content = message.content || '';
    const nativeReasoning = message.reasoning || '';

    const hasNativeReasoningTokens = Boolean(nativeReasoning && nativeReasoning.trim().length > 0);
    const hasTagBasedThinking =
      content.includes('<think>') ||
      content.includes('<thought>') ||
      content.includes('Thinking Process:');

    let status: ThinkingProbeResult['status'] = 'unsupported';
    if (hasNativeReasoningTokens) {
      status = 'supported';
    } else if (hasTagBasedThinking) {
      status = 'tag_based';
    }

    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || Math.ceil(testPrompt.length / 4);
    const completionTokens =
      usage.completion_tokens || Math.ceil((content.length + nativeReasoning.length) / 4);

    return {
      lastTested: Date.now(),
      status,
      hasNativeReasoningTokens,
      hasTagBasedThinking,
      rawSampleReasoning: nativeReasoning || (hasTagBasedThinking ? content.slice(0, 300) : undefined),
      rawSampleContent: content.slice(0, 200),
      latencyMs,
      tokensUsed: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      cost: usage.cost || 0, // stealth/crouton-alpha is 0 (Free)
      httpStatus: 200,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      lastTested: Date.now(),
      status: 'error',
      hasNativeReasoningTokens: false,
      hasTagBasedThinking: false,
      latencyMs,
      tokensUsed: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: 0,
      errorMessage: err?.name === 'AbortError' ? 'Diagnostic probe was cancelled.' : err?.message || 'Network error',
    };
  }
}

/**
 * Streams response from OpenRouter API (Server-Sent Events) with thinking token parsing,
 * tag-based thinking support, token velocity tracking, and instant abort capability.
 */
export async function streamOpenRouterResponse(options: {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
  messages: OpenRouterMessage[];
  enableThinking?: boolean;
  reasoningEffort?: OpenRouterReasoningEffort;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  callbacks: StreamCallbacks;
  signal?: AbortSignal;
}): Promise<MimoStreamResult> {
  const {
    apiKey,
    model = DEFAULT_OPENROUTER_MODEL,
    systemPrompt,
    messages,
    enableThinking = true,
    reasoningEffort = 'medium',
    temperature = 0.7,
    maxTokens = 4096,
    topP = 1.0,
    callbacks,
    signal,
  } = options;

  const cleanKey = (apiKey || (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '').trim();
  if (!cleanKey) {
    throw new Error('MISSING_OPENROUTER_API_KEY');
  }

  callbacks.onModelResolved?.(`OpenRouter: ${model}`, 'HIGH');
  callbacks.onReasoningStep?.(`Connecting to OpenRouter [${model}] via SSE stream`);

  const formattedMessages: OpenRouterMessage[] = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  formattedMessages.push(...messages);

  const requestPayload: OpenRouterChatCompletionRequest = {
    model,
    messages: formattedMessages,
    stream: true,
    temperature,
    max_tokens: maxTokens,
    top_p: topP,
  };

  const isReasoningModel = model.includes('r1') || model.includes('o1') || model.includes('o3');
  if (enableThinking && isReasoningModel) {
    requestPayload.reasoning = { effort: reasoningEffort };
    requestPayload.reasoning_effort = reasoningEffort;
  }

  const startTime = performance.now();
  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': APP_REFERER,
      'X-Title': APP_TITLE,
    },
    body: JSON.stringify(requestPayload),
    signal,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(`OpenRouter API Error (${res.status}): ${message}`);
  }

  if (!res.body) {
    throw new Error('NO_RESPONSE_BODY_RECEIVED');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');

  let fullText = '';
  let thoughtText = '';
  let tokenCount = 0;
  let isInsideThinkTag = false;
  let streamBuffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return {
          fullText,
          thoughtText,
          modelUsed: model,
          resolvedLevel: 'HIGH',
          tokensUsed: tokenCount,
          aborted: true,
        };
      }

      const { done, value } = await reader.read();
      if (done) break;

      streamBuffer += decoder.decode(value, { stream: true });
      const lines = streamBuffer.split('\n');
      streamBuffer = lines.pop() || ''; // Keep incomplete trailing fragment in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue; // Ignore SSE comments/pings

        if (trimmed === 'data: [DONE]') {
          break;
        }

        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const chunk = JSON.parse(jsonStr);
            const delta = chunk?.choices?.[0]?.delta;
            if (!delta) continue;

            // 1. Native Reasoning Stream (delta.reasoning)
            if (delta.reasoning) {
              thoughtText += delta.reasoning;
              callbacks.onThoughtChunk?.(delta.reasoning);
              tokenCount += Math.max(1, Math.ceil(delta.reasoning.length / 4));
            }

            // 2. Content stream (with optional tag-based <think> detection)
            if (delta.content) {
              const contentPiece = delta.content;
              tokenCount += Math.max(1, Math.ceil(contentPiece.length / 4));

              // Check for <think> tag transitions
              if (contentPiece.includes('<think>')) {
                isInsideThinkTag = true;
                const parts = contentPiece.split('<think>');
                if (parts[0]) {
                  fullText += parts[0];
                  callbacks.onTextChunk?.(parts[0]);
                }
                if (parts[1]) {
                  thoughtText += parts[1];
                  callbacks.onThoughtChunk?.(parts[1]);
                }
                continue;
              }

              if (isInsideThinkTag && contentPiece.includes('</think>')) {
                isInsideThinkTag = false;
                const parts = contentPiece.split('</think>');
                if (parts[0]) {
                  thoughtText += parts[0];
                  callbacks.onThoughtChunk?.(parts[0]);
                }
                if (parts[1]) {
                  fullText += parts[1];
                  callbacks.onTextChunk?.(parts[1]);
                }
                continue;
              }

              if (isInsideThinkTag) {
                thoughtText += contentPiece;
                callbacks.onThoughtChunk?.(contentPiece);
              } else {
                fullText += contentPiece;
                callbacks.onTextChunk?.(contentPiece);
              }

              // Real token velocity accounting
              const elapsedSec = (performance.now() - startTime) / 1000;
              if (elapsedSec > 0.5) {
                const tokPerSec = Math.round(tokenCount / elapsedSec);
                callbacks.onTokenVelocity?.(tokPerSec);
              }
            }
          } catch {
            // Ignore JSON parse errors on partial chunk boundaries
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    fullText: fullText.trim(),
    thoughtText: thoughtText.trim(),
    modelUsed: model,
    resolvedLevel: 'HIGH',
    tokensUsed: tokenCount,
    aborted: signal?.aborted,
  };
}
