export type StyleTone =
  | 'crisp-technical'
  | 'conversational'
  | 'academic'
  | 'executive'
  | 'concise';

export type StyleFormatting = 'bullet-heavy' | 'prose-focused' | 'balanced';

export type StyleVoice = 'active-strict' | 'neutral';

export interface StyleDNA {
  tone: StyleTone;
  formatting: StyleFormatting;
  voiceBias: StyleVoice;
  bannedWords: string[];
  customRules: string[];
  customPromptInstruction?: string;
}

export const DEFAULT_BANNED_WORDS = [
  'delve',
  'tapestry',
  'testament',
  'beacon',
  'plethora',
  'moreover',
  'game-changer',
  'foster',
  'harness',
  'pivotal',
  'in conclusion',
  'furthermore',
];

export const DEFAULT_STYLE_DNA: StyleDNA = {
  tone: 'crisp-technical',
  formatting: 'balanced',
  voiceBias: 'active-strict',
  bannedWords: DEFAULT_BANNED_WORDS,
  customRules: [],
  customPromptInstruction: '',
};
