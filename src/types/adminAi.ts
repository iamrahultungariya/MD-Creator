/**
 * Compatibility re-export for User AI Engine configuration.
 * All AI engine types are now unified in userAi.ts.
 */

export * from './userAi';

export type AdminAiPrivacyConfig = import('./userAi').UserAiPrivacyConfig;
export type AdminAiConfigState = {
  defaultProvider: import('./userAi').AiProviderChoice;
  selectedModel: string;
  openRouterApiKey: string;
  isKeyVerified: boolean;
  lastVerificationDate?: string | null;
  enableThinking: boolean;
  reasoningEffort: import('./userAi').OpenRouterReasoningEffort;
  temperature: number;
  maxTokens: number;
  topP: number;
  fallbackToGeminiOnFailure: boolean;
  privacy: import('./userAi').UserAiPrivacyConfig;
  probeResult: import('./userAi').ThinkingProbeResult | null;
};
