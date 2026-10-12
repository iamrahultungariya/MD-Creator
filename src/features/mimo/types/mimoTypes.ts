export type MascotState = 'sleeping' | 'happy' | 'thinking' | 'excited' | 'typing';

export type MimoActivityType =
  | 'thinking'
  | 'analyzing'
  | 'searching'
  | 'generating'
  | 'summarizing'
  | 'improving'
  | 'translating';

export type ThinkingLevel = 'AUTO' | 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface ActivityTelemetry {
  type: MimoActivityType;
  title: string;
  subtitle?: string;
  metrics: {
    linesScanned?: number;
    tokenVelocity?: number;
    compactionRatio?: string;
    diffDelta?: { additions: number; deletions: number };
    language?: string;
    modelName?: string;
    thinkingLevel?: string;
    tokensUsed?: number;
    elapsedMs: number;
  };
  reasoningSteps: string[];
  isDone: boolean;
  isStopped?: boolean;
}

export interface MimoDiffHunk {
  id: string;
  originalLines: string;
  proposedLines: string;
  lineRange?: { start: number; end: number };
  explanation: string;
  isApplied?: boolean;
  isDiscarded?: boolean;
}

export interface MimoMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  thoughtText?: string;
  activity?: ActivityTelemetry;
  diffHunk?: MimoDiffHunk;
  timestamp: number;
  enhancedPromptOriginal?: string;
}

export interface MimoQuotaState {
  dailyUsagePercent: number; // 0 to 100% capacity
  lastResetDate: string; // YYYY-MM-DD
  monthlyDocGenCount: number; // Max 3 monthly doc generations
  lastMonthReset: string; // YYYY-MM
  userApiKey?: string; // BYOK personal Gemini API Key
  hasAcceptedPrivacyNotice?: boolean;
}

export type MimoQuickAction = 'write' | 'improve' | 'summarize' | 'explain' | 'translate';
