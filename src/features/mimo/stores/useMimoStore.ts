import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MascotState,
  ThinkingLevel,
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
  messages: MimoMessage[];
  messagesByDoc: Record<string, MimoMessage[]>;
  activeActivity: ActivityTelemetry | null;
  activeDiffHunk: MimoDiffHunk | null;
  isKeyModalOpen: boolean;
  isPrivacyModalOpen: boolean;

  // Quota & BYOK
  quota: MimoQuotaState;

  // Actions
  setIsOpen: (isOpen: boolean) => void;
  syncActiveDocument: (docId: string, docTitle: string) => void;
  setMascotState: (state: MascotState) => void;
  setThinkingLevel: (level: ThinkingLevel) => void;
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
 *   - Gemini 3.5 Flash-Lite (LOW / MEDIUM): 0.5% base + (tokens / 3500) * 1.5% -> ~0.8% to 2.5% per task
 *   - Gemini 3.8 Flash (HIGH / DocGen): 2.5% base + (tokens / 3000) * 3.5% -> ~3% to 8% per task
 * - Zero deduction (0%) when running on Offline Engine or when aborted/stopped early.
 */
export function computeTaskCostPercent(
  tokensUsed: number,
  level: 'LOW' | 'MEDIUM' | 'HIGH' | ThinkingLevel,
  isDocGen = false,
  modelUsed = 'Gemini 3.5 Flash-Lite'
): number {
  if (tokensUsed <= 0 || modelUsed.includes('Offline')) {
    return 0;
  }

  const isHeavyModel = modelUsed.includes('3.8') || level === 'HIGH' || isDocGen;
  if (isHeavyModel) {
    const rawCost = 2.5 + (tokensUsed / 3000) * 3.5 + (isDocGen ? 2.0 : 0);
    return Number(Math.min(9.0, Math.max(2.0, rawCost)).toFixed(1));
  }

  const liteCost = 0.5 + (tokensUsed / 3500) * 1.5;
  return Number(Math.min(2.5, Math.max(0.5, liteCost)).toFixed(1));
}

export const useMimoStore = create<MimoStoreState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      activeDocId: 'default',
      activeDocTitle: 'Untitled Document',
      mascotState: 'happy',
      thinkingLevel: 'AUTO',
      messages: [createWelcomeMessage()],
      messagesByDoc: {},
      activeActivity: null,
      activeDiffHunk: null,
      isKeyModalOpen: false,
      isPrivacyModalOpen: false,
      quota: INITIAL_QUOTA,

      setIsOpen: (isOpen) => {
        const { quota } = get();
        if (isOpen && !quota.hasAcceptedPrivacyNotice && !quota.userApiKey) {
          set({ isPrivacyModalOpen: true });
        }
        set((state) => ({
          isOpen,
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

      setUserApiKey: (key) =>
        set((state) => ({
          quota: {
            ...state.quota,
            userApiKey: key.trim(),
            hasAcceptedPrivacyNotice: true,
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

        // If user has personal BYOK Gemini Key, no quota restrictions apply!
        if (state.quota.userApiKey?.trim()) {
          return { allowed: true };
        }

        // Check monthly full doc generation limit (max 3/month on free tier)
        if (isDocGen && monthlyDocGen >= 3) {
          return {
            allowed: false,
            reason:
              'Monthly AI Document Generation limit (3 docs/month) reached. Add your free Gemini API key to continue unlimited generation!',
          };
        }

        // Check daily capacity limit (100%)
        if (dailyPercent >= 100 || (costPercent > 0 && dailyPercent + costPercent > 100)) {
          return {
            allowed: false,
            reason:
              'Daily AI capacity reached. Resets at midnight, or connect your personal Gemini API key for unlimited deep thinking.',
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
        set({
          quota: {
            ...state.quota,
            dailyUsagePercent: nextPercent,
            lastResetDate: today,
            monthlyDocGenCount: isDocGen ? monthlyDocGen + 1 : monthlyDocGen,
            lastMonthReset: thisMonth,
          },
        });

        return { allowed: true };
      },

      addMessage: (msg) =>
        set((state) => {
          const updated = [...state.messages, msg].slice(-40);
          return {
            messages: updated,
            messagesByDoc: {
              ...state.messagesByDoc,
              [state.activeDocId]: updated,
            },
          };
        }),

      updateLastMessage: (updater) =>
        set((state) => {
          if (state.messages.length === 0) return state;
          const updated = [...state.messages];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = updater(updated[lastIdx]);
          return {
            messages: updated,
            messagesByDoc: {
              ...state.messagesByDoc,
              [state.activeDocId]: updated,
            },
          };
        }),

      clearMessages: () =>
        set((state) => {
          const fresh = [createWelcomeMessage(state.activeDocTitle)];
          return {
            messages: fresh,
            messagesByDoc: {
              ...state.messagesByDoc,
              [state.activeDocId]: fresh,
            },
            activeActivity: null,
            activeDiffHunk: null,
            mascotState: 'happy',
          };
        }),

      setActiveActivity: (act) =>
        set((state) => ({
          activeActivity: typeof act === 'function' ? act(state.activeActivity) : act,
        })),

      setActiveDiffHunk: (activeDiffHunk) => set({ activeDiffHunk }),

      applyActiveDiff: (currentContent: string) => {
        const { activeDiffHunk, activeDocId } = get();
        if (!activeDiffHunk) return { nextContent: currentContent, success: false };

        const { nextContent, success } = applyDiffHunkToDocument(currentContent, activeDiffHunk);
        if (success) {
          set((state) => {
            const updatedMessages = state.messages.map((m) =>
              m.diffHunk && m.diffHunk.id === activeDiffHunk.id
                ? { ...m, diffHunk: { ...m.diffHunk, isApplied: true } }
                : m
            );
            return {
              activeDiffHunk: { ...activeDiffHunk, isApplied: true },
              mascotState: 'excited',
              messages: updatedMessages,
              messagesByDoc: {
                ...state.messagesByDoc,
                [activeDocId]: updatedMessages,
              },
            };
          });
        }
        return { nextContent, success };
      },

      discardActiveDiff: () => {
        const { activeDiffHunk, activeDocId } = get();
        if (activeDiffHunk) {
          set((state) => {
            const updatedMessages = state.messages.map((m) =>
              m.diffHunk && m.diffHunk.id === activeDiffHunk.id
                ? { ...m, diffHunk: { ...m.diffHunk, isDiscarded: true } }
                : m
            );
            return {
              activeDiffHunk: { ...activeDiffHunk, isDiscarded: true },
              mascotState: 'happy',
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
      partialize: (state) => ({
        quota: state.quota,
        thinkingLevel: state.thinkingLevel,
        activeDocId: state.activeDocId,
        activeDocTitle: state.activeDocTitle,
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
