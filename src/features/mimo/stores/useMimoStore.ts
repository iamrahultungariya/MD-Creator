import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MascotState,
  ThinkingLevel,
  MimoModelChoice,
  MimoMessage,
  MimoDiffHunk,
  MimoQuotaState,
  ActivityTelemetry,
} from '../types/mimoTypes';
import { applyDiffHunkToDocument } from '../services/diffService';

interface MimoStoreState {
  isOpen: boolean;
  activeDocId: string;
  activeDocTitle: string;
  mascotState: MascotState;
  thinkingLevel: ThinkingLevel;
  selectedModel: MimoModelChoice;
  messages: MimoMessage[];
  messagesByDoc: Record<string, MimoMessage[]>;
  activeActivity: ActivityTelemetry | null;
  activeDiffHunk: MimoDiffHunk | null;
  isKeyModalOpen: boolean;
  isPrivacyModalOpen: boolean;

  // Settings & Toggles
  showThinking: boolean;
  webSearchEnabled: boolean;
  lastMimoInteractionTime: number;

  // Vault & Document Pinning (@doc context)
  pinnedDocIdsByDoc: Record<string, string[]>;

  // Rolling Episodic Chat Summary Memory
  episodicSummariesByDoc: Record<string, string[]>;

  // Quota & BYOK
  quota: MimoQuotaState;

  // Actions
  setIsOpen: (isOpen: boolean) => void;
  syncActiveDocument: (docId: string, docTitle: string) => void;
  setMascotState: (state: MascotState) => void;
  setThinkingLevel: (level: ThinkingLevel) => void;
  setSelectedModel: (model: MimoModelChoice) => void;
  setShowThinking: (show: boolean) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  touchMimoActivity: () => void;
  pinDocument: (targetDocId: string) => void;
  unpinDocument: (targetDocId: string) => void;
  clearPinnedDocs: () => void;
  getPinnedDocIds: () => string[];
  appendEpisodicSummary: (docId: string, bullets: string[]) => void;
  clearEpisodicMemory: (docId?: string) => void;
  setUserApiKey: (key: string) => void;
  setIsKeyModalOpen: (open: boolean) => void;
  setIsPrivacyModalOpen: (open: boolean) => void;
  acceptPrivacyNotice: () => void;
  consumeCredit: (costPercent: number, isDocGen?: boolean) => { allowed: boolean; reason?: string };
  addMessage: (msg: MimoMessage) => void;
  updateLastMessage: (updater: (prev: MimoMessage) => MimoMessage) => void;
  clearMessages: () => void;
  setActiveActivity: (
    act: ActivityTelemetry | null | ((prev: ActivityTelemetry | null) => ActivityTelemetry | null)
  ) => void;
  setActiveDiffHunk: (hunk: MimoDiffHunk | null) => void;
  applyActiveDiff: (currentContent: string) => { nextContent: string; success: boolean };
  discardActiveDiff: () => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];
const getThisMonthString = () => new Date().toISOString().slice(0, 7);

const INITIAL_QUOTA: MimoQuotaState = {
  dailyUsagePercent: 0,
  lastResetDate: getTodayString(),
  monthlyDocGenCount: 0,
  lastMonthReset: getThisMonthString(),
  userApiKey: '',
  hasAcceptedPrivacyNotice: false,
};

function createWelcomeMessage(docTitle?: string): MimoMessage {
  const titleLabel = docTitle ? `**"${docTitle}"**` : 'your active document';
  return {
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    text: `👋 Hey! I'm **Mimo**, currently connected to ${titleLabel}.\n\nI can summarize sections, translate takeaways into Hinglish, explain technical concepts, or propose non-destructive diffs. How can I help?`,
    timestamp: Date.now(),
  };
}

/**
 * Professional token-proportional quota calculation:
 * - Uses actual input + output token count and model tier weight:
 *   - Gemini 3.5 Flash-Lite (LOW / MEDIUM): 0.3% base + (tokens / 6000) * 1.0% -> ~0.5% to 1.5% per task
 *   - Gemini 3.8 Flash (HIGH / DocGen): 1.0% base + (tokens / 5000) * 2.0% -> ~1.2% to 4.5% per task
 * - Zero deduction (0%) when running on Offline Engine or when aborted/stopped early.
 * - Calibrated so free-tier users get ~40–60 normal messages/day before hitting the limit.
 */
export function computeTaskCostPercent(
  tokensUsed: number,
  level: 'LOW' | 'MEDIUM' | 'HIGH' | ThinkingLevel,
  isDocGen = false,
  modelUsed = 'Gemini 3.8 Flash'
): number {
  if (tokensUsed <= 0 || modelUsed.includes('Offline')) {
    return 0;
  }

  const isHeavyModel = modelUsed.includes('3.8') || level === 'HIGH' || isDocGen;
  if (isHeavyModel) {
    const rawCost = 1.0 + (tokensUsed / 5000) * 2.0 + (isDocGen ? 1.5 : 0);
    return Number(Math.min(6.0, Math.max(1.0, rawCost)).toFixed(1));
  }

  const liteCost = 0.3 + (tokensUsed / 6000) * 1.0;
  return Number(Math.min(1.5, Math.max(0.3, liteCost)).toFixed(1));
}

export const useMimoStore = create<MimoStoreState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      activeDocId: 'default',
      activeDocTitle: 'Untitled Document',
      mascotState: 'happy',
      thinkingLevel: 'AUTO',
      selectedModel: 'gemini-3.8-flash',
      messages: [createWelcomeMessage()],
      messagesByDoc: {},
      pinnedDocIdsByDoc: {},
      episodicSummariesByDoc: {},
      activeActivity: null,
      activeDiffHunk: null,
      isKeyModalOpen: false,
      isPrivacyModalOpen: false,
      showThinking: false, // Default false to prevent unwanted token consumption!
      webSearchEnabled: false,
      lastMimoInteractionTime: Date.now(),
      quota: INITIAL_QUOTA,

      setIsOpen: (isOpen) => {
        const { quota } = get();
        if (isOpen && !quota.hasAcceptedPrivacyNotice && !quota.userApiKey) {
          set({ isPrivacyModalOpen: true });
        }
        set((state) => ({
          isOpen,
          lastMimoInteractionTime: Date.now(),
          mascotState: isOpen ? 'excited' : state.mascotState === 'typing' ? 'typing' : 'happy',
        }));
      },

      syncActiveDocument: (docId, docTitle) => {
        if (!docId) return;
        const state = get();
        const storedMessages = state.messagesByDoc[docId];

        if (state.activeDocId === docId) {
          if (state.activeDocTitle !== docTitle) {
            set({ activeDocTitle: docTitle });
          }
          return;
        }

        const nextMessages =
          storedMessages && storedMessages.length > 0
            ? storedMessages.map((m) =>
                m.activity && !m.activity.isDone
                  ? { ...m, activity: { ...m.activity, isDone: true } }
                  : m
              )
            : [createWelcomeMessage(docTitle)];

        set({
          activeDocId: docId,
          activeDocTitle: docTitle,
          messages: nextMessages,
          activeActivity: null,
          activeDiffHunk: null,
          messagesByDoc: {
            ...state.messagesByDoc,
            [docId]: nextMessages,
          },
        });
      },

      setMascotState: (mascotState) => set({ mascotState }),

      setThinkingLevel: (thinkingLevel) => set({ thinkingLevel }),

      setSelectedModel: (selectedModel) => {
        const validModel: MimoModelChoice =
          selectedModel === 'gemini-3.8-flash' ||
          selectedModel === 'gemini-3.5-flash' ||
          selectedModel === 'gemini-3.5-flash-lite'
            ? selectedModel
            : 'gemini-3.5-flash-lite';
        set({ selectedModel: validModel });
      },

      setShowThinking: (showThinking) => set({ showThinking }),

      setWebSearchEnabled: (webSearchEnabled) => set({ webSearchEnabled }),

      touchMimoActivity: () => {
        const { mascotState } = get();
        set({
          lastMimoInteractionTime: Date.now(),
          ...(mascotState === 'sleeping' ? { mascotState: 'happy' } : {}),
        });
      },

      pinDocument: (targetDocId: string) => {
        const { activeDocId, pinnedDocIdsByDoc = {} } = get();
        if (!targetDocId || targetDocId === activeDocId) return;
        const current = pinnedDocIdsByDoc[activeDocId] || [];
        if (current.includes(targetDocId)) return;
        // Limit to max 3 pinned docs to preserve token efficiency
        const next = [...current.slice(-2), targetDocId];
        set({
          pinnedDocIdsByDoc: {
            ...pinnedDocIdsByDoc,
            [activeDocId]: next,
          },
          lastMimoInteractionTime: Date.now(),
        });
      },

      unpinDocument: (targetDocId: string) => {
        const { activeDocId, pinnedDocIdsByDoc = {} } = get();
        const current = pinnedDocIdsByDoc[activeDocId] || [];
        set({
          pinnedDocIdsByDoc: {
            ...pinnedDocIdsByDoc,
            [activeDocId]: current.filter((id) => id !== targetDocId),
          },
          lastMimoInteractionTime: Date.now(),
        });
      },

      clearPinnedDocs: () => {
        const { activeDocId, pinnedDocIdsByDoc = {} } = get();
        set({
          pinnedDocIdsByDoc: {
            ...pinnedDocIdsByDoc,
            [activeDocId]: [],
          },
          lastMimoInteractionTime: Date.now(),
        });
      },

      getPinnedDocIds: () => {
        const { activeDocId, pinnedDocIdsByDoc = {} } = get();
        return pinnedDocIdsByDoc[activeDocId] || [];
      },

      appendEpisodicSummary: (docId: string, bullets: string[]) => {
        if (!docId || bullets.length === 0) return;
        const { episodicSummariesByDoc = {} } = get();
        const existing = episodicSummariesByDoc[docId] || [];
        // Keep up to 12 latest high-density episodic memory bullets per doc
        const updated = [...existing, ...bullets].slice(-12);
        set({
          episodicSummariesByDoc: {
            ...episodicSummariesByDoc,
            [docId]: updated,
          },
        });
      },

      clearEpisodicMemory: (docId?: string) => {
        const { activeDocId, episodicSummariesByDoc = {} } = get();
        const targetId = docId || activeDocId;
        const next = { ...episodicSummariesByDoc };
        delete next[targetId];
        set({ episodicSummariesByDoc: next });
      },

      setUserApiKey: (key) =>
        set((state) => ({
          quota: {
            ...state.quota,
            userApiKey: key.trim(),
            hasAcceptedPrivacyNotice: true,
            dailyUsagePercent: 0,
          },
        })),

      setIsKeyModalOpen: (isKeyModalOpen) => set({ isKeyModalOpen }),

      setIsPrivacyModalOpen: (isPrivacyModalOpen) => set({ isPrivacyModalOpen }),

      acceptPrivacyNotice: () =>
        set((state) => ({
          isPrivacyModalOpen: false,
          quota: {
            ...state.quota,
            hasAcceptedPrivacyNotice: true,
          },
        })),

      consumeCredit: (costPercent, isDocGen = false) => {
        const state = get();
        const today = getTodayString();
        const thisMonth = getThisMonthString();

        let dailyPercent = state.quota.dailyUsagePercent || 0;
        let monthlyDocGen = state.quota.monthlyDocGenCount || 0;

        // Auto daily reset
        if (state.quota.lastResetDate !== today) {
          dailyPercent = 0;
        }

        // Auto monthly reset
        if (state.quota.lastMonthReset !== thisMonth) {
          monthlyDocGen = 0;
        }

        // If user has personal BYOK Gemini Key or configured project key, no mock quota restrictions apply!
        // Re-read directly from the latest store state to avoid stale closure captures.
        const freshApiKey = get().quota.userApiKey?.trim();
        const envKey = (
          (import.meta.env.VITE_GEMINI_API_KEY as string) ||
          (import.meta.env.GEMINI_API_KEY as string) ||
          ''
        ).trim();
        const hasProjectKey = Boolean(
          envKey &&
          envKey !== 'your_gemini_api_key_here' &&
          envKey !== 'your-gemini-key'
        );
        if (freshApiKey || hasProjectKey) {
          return { allowed: true };
        }

        // Check monthly full doc generation limit (max 3/month on free tier)
        if (isDocGen && monthlyDocGen >= 3) {
          return {
            allowed: false,
            reason:
              'Monthly AI Document Generation limit (3 docs/month) reached. Connect your Gemini API key in settings to continue.',
          };
        }

        // Check daily capacity limit (100%).
        // Pre-flight calls use costPercent = 0, so only block on actual deductions
        // when dailyPercent is at capacity, not on 0-cost pre-flight checks.
        if (costPercent > 0 && dailyPercent + costPercent > 100) {
          return {
            allowed: false,
            reason:
              'Daily AI capacity reached. Resets at midnight, or connect your personal Gemini API key in settings.',
          };
        }
        if (costPercent <= 0 && dailyPercent >= 100) {
          return {
            allowed: false,
            reason:
              'Daily AI capacity reached. Resets at midnight, or connect your personal Gemini API key in settings.',
          };
        }

        // If costPercent is 0 (pre-flight check or offline run), just persist any date resets
        if (costPercent <= 0) {
          if (state.quota.lastResetDate !== today || state.quota.lastMonthReset !== thisMonth) {
            set({
              quota: {
                ...state.quota,
                dailyUsagePercent: dailyPercent,
                lastResetDate: today,
                monthlyDocGenCount: monthlyDocGen,
                lastMonthReset: thisMonth,
              },
            });
          }
          return { allowed: true };
        }

        // Deduct proportional capacity
        const nextPercent = Number(Math.min(100, dailyPercent + costPercent).toFixed(1));
        const nextMonthlyDocGen = isDocGen ? monthlyDocGen + 1 : monthlyDocGen;

        set({
          quota: {
            ...state.quota,
            dailyUsagePercent: nextPercent,
            monthlyDocGenCount: nextMonthlyDocGen,
            lastResetDate: today,
            lastMonthReset: thisMonth,
          },
        });

        return { allowed: true };
      },

      addMessage: (msg) => {
        const { activeDocId, messages, messagesByDoc } = get();
        const nextMessages = [...messages, msg];
        set({
          messages: nextMessages,
          lastMimoInteractionTime: Date.now(),
          messagesByDoc: {
            ...messagesByDoc,
            [activeDocId]: nextMessages,
          },
        });
      },

      updateLastMessage: (updater) => {
        const { activeDocId, messages, messagesByDoc } = get();
        if (messages.length === 0) return;
        const lastIndex = messages.length - 1;
        const updated = updater(messages[lastIndex]);
        const nextMessages = [...messages];
        nextMessages[lastIndex] = updated;

        set({
          messages: nextMessages,
          messagesByDoc: {
            ...messagesByDoc,
            [activeDocId]: nextMessages,
          },
        });
      },

      clearMessages: () => {
        const { activeDocId, activeDocTitle, messagesByDoc } = get();
        const welcome = [createWelcomeMessage(activeDocTitle)];
        set({
          messages: welcome,
          activeActivity: null,
          activeDiffHunk: null,
          lastMimoInteractionTime: Date.now(),
          messagesByDoc: {
            ...messagesByDoc,
            [activeDocId]: welcome,
          },
        });
      },

      setActiveActivity: (act) =>
        set((state) => ({
          activeActivity: typeof act === 'function' ? act(state.activeActivity) : act,
        })),

      setActiveDiffHunk: (activeDiffHunk) => set({ activeDiffHunk }),

      applyActiveDiff: (currentContent: string) => {
        const { activeDiffHunk, activeDocId } = get();
        if (!activeDiffHunk) {
          return { nextContent: currentContent, success: false };
        }

        const res = applyDiffHunkToDocument(currentContent, activeDiffHunk);
        if (res.success) {
          set((state) => {
            const updatedHunk = { ...activeDiffHunk, isApplied: true };
            const updatedMessages = state.messages.map((m) =>
              m.diffHunk && m.diffHunk.id === activeDiffHunk.id
                ? { ...m, diffHunk: updatedHunk }
                : m
            );

            return {
              activeDiffHunk: null,
              mascotState: 'happy',
              lastMimoInteractionTime: Date.now(),
              messages: updatedMessages,
              messagesByDoc: {
                ...state.messagesByDoc,
                [activeDocId]: updatedMessages,
              },
            };
          });
        }
        return res;
      },

      discardActiveDiff: () => {
        const { activeDiffHunk, activeDocId } = get();
        if (activeDiffHunk) {
          set((state) => {
            const updatedHunk = { ...activeDiffHunk, isDiscarded: true };
            const updatedMessages = state.messages.map((m) =>
              m.diffHunk && m.diffHunk.id === activeDiffHunk.id
                ? { ...m, diffHunk: updatedHunk }
                : m
            );

            return {
              activeDiffHunk: null,
              mascotState: 'happy',
              lastMimoInteractionTime: Date.now(),
              messages: updatedMessages,
              messagesByDoc: {
                ...state.messagesByDoc,
                [activeDocId]: updatedMessages,
              },
            };
          });
        }
      },
    }),
    {
      name: 'md-writer-mimo-store',
      onRehydrateStorage: () => (state) => {
        if (state && (state.selectedModel as string)?.startsWith('gemini-2.')) {
          state.selectedModel = 'gemini-3.5-flash-lite';
        }
      },
      partialize: (state) => ({
        quota: state.quota,
        thinkingLevel: state.thinkingLevel,
        selectedModel: state.selectedModel,
        activeDocId: state.activeDocId,
        activeDocTitle: state.activeDocTitle,
        showThinking: state.showThinking,
        webSearchEnabled: state.webSearchEnabled,
        pinnedDocIdsByDoc: state.pinnedDocIdsByDoc || {},
        episodicSummariesByDoc: state.episodicSummariesByDoc || {},
        messages: state.messages.map((m) =>
          m.activity && !m.activity.isDone
            ? { ...m, activity: { ...m.activity, isDone: true } }
            : m
        ),
        messagesByDoc: Object.fromEntries(
          Object.entries(state.messagesByDoc).map(([k, list]) => [
            k,
            list.slice(-30).map((m) =>
              m.activity && !m.activity.isDone
                ? { ...m, activity: { ...m.activity, isDone: true } }
                : m
            ),
          ])
        ),
      }),
    }
  )
);
