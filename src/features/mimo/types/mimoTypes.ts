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

export type MimoIntentType =
  | 'GENERAL_QA'
  | 'DOC_QUERY'
  | 'DOC_TRANSFORM'
  | 'CREATIVE_EXPANSION'
  | 'CHAT_BANTER';

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

export interface MimoToolCall {
  id: string;
  name:
    | 'insert_at_bottom'
    | 'insert_at_top'
    | 'insert_at_cursor'
    | 'generate_table'
    | 'insert_katex_formula'
    | 'set_document_title'
    | 'export_document';
  arguments: {
    content?: string;
    description?: string;
    latex?: string;
    displayMode?: boolean;
    title?: string;
    format?: 'docx' | 'pdf' | 'html' | 'markdown';
    [key: string]: any;
  };
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
  toolCall?: MimoToolCall;
  timestamp: number;
  enhancedPromptOriginal?: string;
  intent?: MimoIntentType;
  hasSelectionContext?: boolean;
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

