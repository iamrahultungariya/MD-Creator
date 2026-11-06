import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AiProviderChoice,
  OpenRouterReasoningEffort,
  ThinkingProbeResult,
  UserAiPrivacyConfig,
  UserAiConfigState,
  OPENROUTER_DEFAULT_MODEL,
} from '../types/userAi';

interface UserAiStoreState extends UserAiConfigState {
  // Actions
  setProvider: (provider: AiProviderChoice) => void;
  setOpenRouterApiKey: (key: string) => void;
  setOpenRouterModel: (model: string) => void;
  setIsOpenRouterKeyVerified: (verified: boolean, date?: string) => void;
  setOpenRouterFallbackToGemini: (fallback: boolean) => void;
  setThinkingConfig: (
    config: Partial<{
      enableThinking: boolean;
      reasoningEffort: OpenRouterReasoningEffort;
      temperature: number;
      maxTokens: number;
      topP: number;
    }>
  ) => void;
  setPrivacyConfig: (privacy: Partial<UserAiPrivacyConfig>) => void;
  setProbeResult: (probeResult: ThinkingProbeResult | null) => void;
  resetToDefaults: () => void;

  // Computed helper
  isOpenRouterReady: () => boolean;

  // Legacy compat aliases
  defaultProvider: AiProviderChoice;
  selectedModel: string;
  isKeyVerified: boolean;
  lastVerificationDate: string | null;
  fallbackToGeminiOnFailure: boolean;
  setDefaultProvider: (provider: AiProviderChoice) => void;
  setSelectedModel: (model: string) => void;
  setIsKeyVerified: (verified: boolean, date?: string) => void;
  setFallbackToGemini: (fallback: boolean) => void;
}

const DEFAULT_PRIVACY_CONFIG: UserAiPrivacyConfig = {
  strictZeroPreFeed: true,
  allowOnDemandTriggers: true,
  showPayloadDebugInDrawer: false,
};

const envOpenRouterKey = ((import.meta.env.VITE_OPENROUTER_API_KEY as string) || '').trim();

// Attempt one-time legacy migration from md_creator_admin_ai_config if available
function getInitialMigrationState(): Partial<UserAiConfigState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('md_creator_admin_ai_config');
    if (raw) {
      const parsed = JSON.parse(raw)?.state;
      if (parsed) {
        return {
          provider: parsed.defaultProvider || 'gemini',
          openRouterApiKey: parsed.openRouterApiKey || envOpenRouterKey,
          openRouterModel: parsed.selectedModel && parsed.selectedModel !== 'stealth/crouton-alpha'
            ? parsed.selectedModel
            : OPENROUTER_DEFAULT_MODEL,
          isOpenRouterKeyVerified: Boolean(parsed.isKeyVerified),
          openRouterLastVerifiedDate: parsed.lastVerificationDate || null,
          openRouterFallbackToGemini: parsed.fallbackToGeminiOnFailure !== false,
        };
      }
    }
  } catch {
    // Ignore legacy migration error
  }
  return {};
}

const legacyDefaults = getInitialMigrationState();

const DEFAULT_STATE: UserAiConfigState = {
  provider: legacyDefaults.provider || 'gemini',
  openRouterApiKey: legacyDefaults.openRouterApiKey || envOpenRouterKey,
  openRouterModel: legacyDefaults.openRouterModel || OPENROUTER_DEFAULT_MODEL,
  isOpenRouterKeyVerified: legacyDefaults.isOpenRouterKeyVerified ?? Boolean(envOpenRouterKey),
  openRouterLastVerifiedDate: legacyDefaults.openRouterLastVerifiedDate ?? (envOpenRouterKey ? new Date().toISOString() : null),
  openRouterFallbackToGemini: legacyDefaults.openRouterFallbackToGemini ?? true,
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  enableThinking: false, // Default false for gpt-4o standard completion
  reasoningEffort: 'medium',
  privacy: DEFAULT_PRIVACY_CONFIG,
  probeResult: null,
};

export const useUserAiStore = create<UserAiStoreState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      // Getters for legacy compatibility
      get defaultProvider() {
        return get().provider;
      },
      get selectedModel() {
        return get().openRouterModel;
      },
      get isKeyVerified() {
        return get().isOpenRouterKeyVerified;
      },
      get lastVerificationDate() {
        return get().openRouterLastVerifiedDate;
      },
      get fallbackToGeminiOnFailure() {
        return get().openRouterFallbackToGemini;
      },

      setProvider: (provider: AiProviderChoice) => {
        set({ provider });
      },

      setDefaultProvider: (provider: AiProviderChoice) => {
        set({ provider });
      },

      setOpenRouterApiKey: (key: string) => {
        const clean = (key || '').trim();
        set((state) => ({
          openRouterApiKey: clean,
          isOpenRouterKeyVerified: clean && clean === state.openRouterApiKey ? state.isOpenRouterKeyVerified : false,
          openRouterLastVerifiedDate: clean === state.openRouterApiKey ? state.openRouterLastVerifiedDate : null,
        }));
      },

      setOpenRouterModel: (model: string) => {
        set({ openRouterModel: model || OPENROUTER_DEFAULT_MODEL });
      },

      setSelectedModel: (model: string) => {
        set({ openRouterModel: model || OPENROUTER_DEFAULT_MODEL });
      },

      setIsOpenRouterKeyVerified: (verified: boolean, date?: string) => {
        set({
          isOpenRouterKeyVerified: verified,
          openRouterLastVerifiedDate: date || (verified ? new Date().toISOString() : null),
        });
      },

      setIsKeyVerified: (verified: boolean, date?: string) => {
        set({
          isOpenRouterKeyVerified: verified,
          openRouterLastVerifiedDate: date || (verified ? new Date().toISOString() : null),
        });
      },

      setOpenRouterFallbackToGemini: (fallback: boolean) => {
        set({ openRouterFallbackToGemini: fallback });
      },

      setFallbackToGemini: (fallback: boolean) => {
        set({ openRouterFallbackToGemini: fallback });
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
        const effectiveKey = (state.openRouterApiKey || envOpenRouterKey).trim();
        return Boolean(effectiveKey && effectiveKey.length > 10);
      },
    }),
    {
      name: 'md_creator_user_ai_config',
      partialize: (state) => ({
        provider: state.provider,
        openRouterApiKey: state.openRouterApiKey,
        openRouterModel: state.openRouterModel,
        isOpenRouterKeyVerified: state.isOpenRouterKeyVerified,
        openRouterLastVerifiedDate: state.openRouterLastVerifiedDate,
        openRouterFallbackToGemini: state.openRouterFallbackToGemini,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        topP: state.topP,
        enableThinking: state.enableThinking,
        reasoningEffort: state.reasoningEffort,
        privacy: state.privacy,
        probeResult: state.probeResult,
      }),
    }
  )
);
