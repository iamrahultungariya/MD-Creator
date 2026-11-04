import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StyleDNA, StyleTone, StyleFormatting, StyleVoice, DEFAULT_STYLE_DNA } from '../types/styleDnaTypes';

interface StyleDnaState extends StyleDNA {
  setTone: (tone: StyleTone) => void;
  setFormatting: (formatting: StyleFormatting) => void;
  setVoiceBias: (voice: StyleVoice) => void;
  setCustomPromptInstruction: (instruction: string) => void;
  addBannedWord: (word: string) => void;
  removeBannedWord: (word: string) => void;
  resetBannedWords: () => void;
  addCustomRule: (rule: string) => void;
  removeCustomRule: (index: number) => void;
  resetToDefaults: () => void;
}

export const useStyleDnaStore = create<StyleDnaState>()(
  persist(
    (set) => ({
      ...DEFAULT_STYLE_DNA,

      setTone: (tone) => set({ tone }),

      setFormatting: (formatting) => set({ formatting }),

      setVoiceBias: (voiceBias) => set({ voiceBias }),

      setCustomPromptInstruction: (customPromptInstruction) =>
        set({ customPromptInstruction }),

      addBannedWord: (word) =>
        set((state) => {
          const cleaned = word.trim().toLowerCase();
          if (!cleaned || state.bannedWords.includes(cleaned)) return state;
          return { bannedWords: [...state.bannedWords, cleaned] };
        }),

      removeBannedWord: (word) =>
        set((state) => ({
          bannedWords: state.bannedWords.filter((w) => w.toLowerCase() !== word.toLowerCase()),
        })),

      resetBannedWords: () => set({ bannedWords: [...DEFAULT_STYLE_DNA.bannedWords] }),

      addCustomRule: (rule) =>
        set((state) => {
          const cleaned = rule.trim();
          if (!cleaned) return state;
          return { customRules: [...state.customRules, cleaned] };
        }),

      removeCustomRule: (index) =>
        set((state) => ({
          customRules: state.customRules.filter((_, idx) => idx !== index),
        })),

      resetToDefaults: () => set({ ...DEFAULT_STYLE_DNA }),
    }),
    {
      name: 'md-writer-mimo-styledna',
    }
  )
);

/**
 * Builds the silent system instruction layer from active StyleDNA.
 */
export function buildStyleDnaPromptLayer(style: StyleDNA): string {
  const toneMap: Record<StyleTone, string> = {
    'crisp-technical': 'Crisp Technical (precise, informative, direct, zero fluff)',
    conversational: 'Engaging & Conversational (friendly, natural, approachable)',
    academic: 'Rigorous Academic (structured, analytical, authoritative citations)',
    executive: 'Executive Briefing (high-impact TL;DRs, decision-oriented, concise)',
    concise: 'Ultra Concise (short sentences, dense insights, minimum tokens)',
  };

  const formatMap: Record<StyleFormatting, string> = {
    'bullet-heavy': 'Prioritize bullet points with bold lead-ins for high scanability',
    'prose-focused': 'Craft cohesive narrative prose paragraphs with smooth transitions',
    balanced: 'Balanced blend of structured headings, short paragraphs, and bullet points',
  };

  const lines: string[] = [
    `[Persistent StyleDNA Profile (Strictly Follow)]`,
    `• Tone: ${toneMap[style.tone] || toneMap['crisp-technical']}`,
    `• Formatting: ${formatMap[style.formatting] || formatMap['balanced']}`,
  ];

  if (style.voiceBias === 'active-strict') {
    lines.push('• Voice: Strictly active voice. Eliminate passive phrasing.');
  }

  if (style.bannedWords && style.bannedWords.length > 0) {
    lines.push(
      `• Banned AI Clichés: NEVER use these overused words: ${style.bannedWords.join(
        ', '
      )}. Replace them with concrete, precise terminology.`
    );
  }

  if (style.customPromptInstruction && style.customPromptInstruction.trim().length > 0) {
    lines.push(
      `• User's Custom Persona & Response Instructions:\n  "${style.customPromptInstruction.trim()}"\n  (Strictly prioritize and adhere to these response rules)`
    );
  }

  if (style.customRules && style.customRules.length > 0) {
    lines.push(`• Custom Guidelines:\n${style.customRules.map((r) => `  - ${r}`).join('\n')}`);
  }

  return lines.join('\n');
}
