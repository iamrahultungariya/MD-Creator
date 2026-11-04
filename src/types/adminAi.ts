/**
 * Types for Admin AI Engine Configuration (OpenRouter stealth/crouton-alpha integration).
 * Strictly accessible to authenticated administrators.
 */

export type AiProviderChoice = 'gemini' | 'openrouter';

export type OpenRouterReasoningEffort = 'low' | 'medium' | 'high';

export type ThinkingProbeStatus =
  | 'idle'
  | 'testing'
  | 'supported'
  | 'tag_based'
  | 'unsupported'
  | 'error';

export interface OpenRouterModelPricing {
  promptCostPerToken: number; // 0 for stealth/crouton-alpha
  completionCostPerToken: number; // 0 for stealth/crouton-alpha
  isFree: boolean;
  provider: string; // "Stealth"
}

export interface ThinkingProbeResult {
  lastTested: number; // Timestamp ms
  status: ThinkingProbeStatus;
  hasNativeReasoningTokens: boolean;
  hasTagBasedThinking: boolean;
  rawSampleReasoning?: string;
  rawSampleContent?: string;
  latencyMs: number;
  ttftMs?: number;
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  httpStatus?: number;
  errorMessage?: string;
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface OpenRouterChatCompletionRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  max_tokens?: number;
  reasoning?: { effort?: OpenRouterReasoningEffort } | boolean;
  reasoning_effort?: OpenRouterReasoningEffort;
  response_format?: { type: 'json_object' | 'text' };
  temperature?: number;
  top_p?: number;
  tools?: any[];
  tool_choice?: any;
}

export interface OpenRouterChatCompletionChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
    reasoning?: string;
  };
  finish_reason?: string;
}

export interface OpenRouterChatCompletionResponse {
  id: string;
  choices: OpenRouterChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost?: number;
  };
  error?: {
    code: number;
    message: string;
  };
}

export interface OpenRouterStreamChunk {
  id?: string;
  choices?: Array<{
    index?: number;
    delta: {
      role?: string;
      content?: string;
      reasoning?: string;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost?: number;
  };
  error?: {
    code: number;
    message: string;
  };
}

export interface AdminAiPrivacyConfig {
  /**
   * When true: Zero pre-feeding. Document text, headings, and outlines are NEVER
   * automatically attached to AI requests.
   */
  strictZeroPreFeed: boolean;
  /**
   * When true: Document context is only included if user prompt explicitly references
   * the document (e.g. '@doc', 'this document', 'summarize') or has active editor selection.
   */
  allowOnDemandTriggers: boolean;
  /**
   * Whether to show an interactive payload inspection drawer in the UI
   */
  showPayloadDebugInDrawer: boolean;
}

export interface AdminAiConfigState {
  defaultProvider: AiProviderChoice;
  selectedModel: string;
  openRouterApiKey: string;
  isKeyVerified: boolean;
  lastVerificationDate?: string | null;
  enableThinking: boolean;
  reasoningEffort: OpenRouterReasoningEffort;
  temperature: number;
  maxTokens: number;
  topP: number;
  fallbackToGeminiOnFailure: boolean;
  privacy: AdminAiPrivacyConfig;
  probeResult: ThinkingProbeResult | null;
}
