/**
 * Types for User AI Engine & Provider Configuration (Gemini & OpenRouter).
 * Allows users to choose between Google Gemini and OpenRouter (with stealth/crouton-alpha as 1st model).
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
  promptCostPerToken: number;
  completionCostPerToken: number;
  isFree: boolean;
  provider: string;
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

export interface UserAiPrivacyConfig {
  strictZeroPreFeed: boolean;
  allowOnDemandTriggers: boolean;
  showPayloadDebugInDrawer: boolean;
}

export interface OpenRouterModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  recommended?: boolean;
}

export const OPENROUTER_DEFAULT_MODEL = 'stealth/crouton-alpha';

export const OPENROUTER_MODELS: OpenRouterModelOption[] = [
  {
    id: 'stealth/crouton-alpha',
    name: 'Crouton Alpha (Stealth)',
    description: 'High-speed reasoning model with step-by-step thinking tokens',
    badge: '1st / Default Reasoning',
    recommended: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (Anthropic)',
    description: 'World-class writing nuances, structured Markdown, and deep code synthesis',
    badge: 'Prose & Code',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3 (DeepSeek)',
    description: 'High-throughput cost-effective general intelligence model',
    badge: 'High Value',
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1 (DeepSeek)',
    description: 'Open-weights reasoning model with chain-of-thought capability',
    badge: 'Reasoning',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Google via OpenRouter)',
    description: 'High speed, multimodal flash processing via OpenRouter gateway',
    badge: 'Flash',
  },
];

export interface UserAiConfigState {
  provider: AiProviderChoice;
  openRouterApiKey: string;
  openRouterModel: string;
  isOpenRouterKeyVerified: boolean;
  openRouterLastVerifiedDate: string | null;
  openRouterFallbackToGemini: boolean;
  temperature: number;
  maxTokens: number;
  topP: number;
  enableThinking: boolean;
  reasoningEffort: OpenRouterReasoningEffort;
  privacy: UserAiPrivacyConfig;
  probeResult: ThinkingProbeResult | null;
}
