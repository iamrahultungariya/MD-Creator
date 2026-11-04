import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AiProviderChoice,
  OpenRouterReasoningEffort,
  ThinkingProbeResult,
  AdminAiPrivacyConfig,
  AdminAiConfigState,
} from '../types/adminAi';

export const OPENROUTER_CROUTON_MODEL = 'stealth/crouton-alpha';

interface AdminAiStoreState extends AdminAiConfigState {
  // Actions
  setDefaultProvider: (provider: AiProviderChoice) => void;
  setSelectedModel: (model: string) => void;
  setOpenRouterApiKey: (key: string) => void;
  setIsKeyVerified: (verified: boolean, date?: string) => void;
  setThinkingConfig: (
    config: Partial<{
      enableThinking: boolean;
      reasoningEffort: OpenRouterReasoningEffort;
      temperature: number;
      maxTokens: number;
      topP: number;
    }>
  ) => void;
  setFallbackToGemini: (fallback: boolean) => void;
  setPrivacyConfig: (privacy: Partial<AdminAiPrivacyConfig>) => void;
  setProbeResult: (probeResult: ThinkingProbeResult | null) => void;
  resetToDefaults: () => void;
  
  // Computed helpers
  isOpenRouterReady: () => boolean;
}

const DEFAULT_PRIVACY_CONFIG: AdminAiPrivacyConfig = {
  strictZeroPreFeed: true, // Never pre-feed document context automatically
  allowOnDemandTriggers: true, // Only attach document if prompt explicitly requests it (@doc / selection)
  showPayloadDebugInDrawer: false,
};

const DEFAULT_STATE: AdminAiConfigState = {
  defaultProvider: 'gemini', // Standard fallback until admin chooses OpenRouter
  selectedModel: OPENROUTER_CROUTON_MODEL,
  openRouterApiKey: '',
  isKeyVerified: false,
  lastVerificationDate: null,
  enableThinking: true,
  reasoningEffort: 'medium',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  fallbackToGeminiOnFailure: true,
  privacy: DEFAULT_PRIVACY_CONFIG,
  probeResult: null,
};

export const useAdminAiStore = create<AdminAiStoreState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setDefaultProvider: (provider: AiProviderChoice) => {
        set({ defaultProvider: provider });
      },

      setSelectedModel: (model: string) => {
        set({ selectedModel: model || OPENROUTER_CROUTON_MODEL });
      },

      setOpenRouterApiKey: (key: string) => {
        const clean = (key || '').trim();
        set((state) => ({
          openRouterApiKey: clean,
          // Invalidate verification if key changed
          isKeyVerified: clean && clean === state.openRouterApiKey ? state.isKeyVerified : false,
          lastVerificationDate: clean === state.openRouterApiKey ? state.lastVerificationDate : null,
        }));
      },

      setIsKeyVerified: (verified: boolean, date?: string) => {
        set({
          isKeyVerified: verified,
          lastVerificationDate: date || (verified ? new Date().toISOString() : null),
        });
      },

      setThinkingConfig: (config) => {
        set((state) => ({
          enableThinking: config.enableThinking !== undefined ? config.enableThinking : state.enableThinking,
          reasoningEffort: config.reasoningEffort ?? state.reasoningEffort,
          temperature: config.temperature !== undefined ? config.temperature : state.temperature,
          maxTokens: config.maxTokens !== undefined ? config.maxTokens : state.maxTokens,
          topP: config.topP !== undefined ? config.topP : state.topP,
        }));
      },

      setFallbackToGemini: (fallbackToGeminiOnFailure: boolean) => {
        set({ fallbackToGeminiOnFailure });
      },

      setPrivacyConfig: (privacyUpdate) => {
        set((state) => ({
          privacy: {
            ...state.privacy,
            ...privacyUpdate,
          },
        }));
      },

      setProbeResult: (probeResult: ThinkingProbeResult | null) => {
        set({ probeResult });
      },

      resetToDefaults: () => {
        set({ ...DEFAULT_STATE });
      },

      isOpenRouterReady: () => {
        const state = get();
        return Boolean(state.openRouterApiKey && state.openRouterApiKey.trim().length > 10);
      },
    }),
    {
      name: 'md_creator_admin_ai_config',
      partialize: (state) => ({
        defaultProvider: state.defaultProvider,
        selectedModel: state.selectedModel,
        openRouterApiKey: state.openRouterApiKey,
        isKeyVerified: state.isKeyVerified,
        lastVerificationDate: state.lastVerificationDate,
        enableThinking: state.enableThinking,
        reasoningEffort: state.reasoningEffort,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        topP: state.topP,
        fallbackToGeminiOnFailure: state.fallbackToGeminiOnFailure,
        privacy: state.privacy,
        probeResult: state.probeResult,
      }),
    }
  )
);
