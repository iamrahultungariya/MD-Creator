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

export type MimoModelChoice =
  | 'gemini-3.8-flash'
  | 'gemini-3.5-flash'
  | 'gemini-3.5-flash-lite'
  | 'auto';

export type MimoIntentType =
  | 'GENERAL_QA'
  | 'DOC_QUERY'
  | 'DOC_TRANSFORM'
  | 'CREATIVE_EXPANSION'
  | 'CHAT_BANTER';

export type MimoProtocolStepId = 'understand' | 'decompose' | 'develop' | 'verify' | 'polish';
export type MimoProtocolStepStatus = 'pending' | 'active' | 'done';

export interface MimoProtocolStep {
  id: MimoProtocolStepId;
  label: string;
  detail: string;
  status: MimoProtocolStepStatus;
}

export interface MimoProtocolTimeline {
  enabled: boolean;
  currentStep: MimoProtocolStepId;
  steps: MimoProtocolStep[];
  summaryLabel?: string;
}

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
  protocolTimeline?: MimoProtocolTimeline;
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

export interface MimoClarificationQuestion {
  id: string;
  question: string;
  type?: 'single' | 'multi'; // radio or checkbox
  options: string[]; // 3 options
  allowCustom?: boolean; // 4th free-write field
}

export interface MimoClarificationData {
  id: string;
  title?: string;
  description?: string;
  questions: MimoClarificationQuestion[];
  isSubmitted?: boolean;
  answers?: Record<string, { selected: string[]; customText?: string }>;
}

export interface MimoMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  thoughtText?: string;
  activity?: ActivityTelemetry;
  diffHunk?: MimoDiffHunk;
  toolCall?: MimoToolCall;
  clarification?: MimoClarificationData;
  timestamp: number;
  enhancedPromptOriginal?: string;
  intent?: MimoIntentType;
  hasSelectionContext?: boolean;
  mascotState?: MascotState;
  suggestedActions?: string[];
}

export interface MimoModelUsageItem {
  requests: number;
  tokens: number;
  lastUsed?: number;
}

export interface MimoQuotaState {
  dailyUsagePercent: number; // 0 to 100% capacity
  lastResetDate: string; // YYYY-MM-DD
  monthlyDocGenCount: number; // Max 3 monthly doc generations
  lastMonthReset: string; // YYYY-MM
  userApiKey?: string; // BYOK personal Gemini API Key
  hasAcceptedPrivacyNotice?: boolean;

  // Real Usage & Visual Telemetry
  totalTokensToday?: number;
  promptTokensToday?: number;
  candidatesTokensToday?: number;
  requestsToday?: number;
  lastRequestLatencyMs?: number;
  lastCheckedTimestamp?: number;
  liveApiStatus?: 'HEALTHY' | 'THROTTLED' | 'HIGH_DEMAND' | 'CHECKING' | 'OFFLINE' | 'UNCONFIGURED';
  liveLatencyMs?: number;
  liveAvailableModels?: string[];
  modelUsageToday?: Record<string, MimoModelUsageItem>;
}

export interface PinnedDocReference {
  id: string;
  title: string;
  snippet: string;
  tags: string[];
  outline: string[];
  wordCount: number;
  updatedAt: number;
}

export interface EpisodicMemoryBlock {
  id: string;
  docId: string;
  turnRange: [number, number];
  summaryBullets: string[];
  createdAt: number;
}

export type MimoQuickAction =
  | 'write'
  | 'improve'
  | 'summarize'
  | 'explain'
  | 'translate'
  | 'chaos-to-clarity'
  | 'vault-insights';
