import { ThinkingLevel } from '../types/mimoTypes';

export type DetectedLanguage = 'english' | 'hindi' | 'hinglish';

const HINGLISH_KEYWORDS = new Set([
  'kya', 'karna', 'karo', 'kare', 'kaise', 'batao', 'bata', 'ye', 'yeh', 'wo', 'woh',
  'thoda', 'thoda-sa', 'badlo', 'badal', 'samjhao', 'likho', 'likh', 'theek', 'theek-kar',
  'mein', 'me', 'hai', 'hain', 'nahi', 'nahin', 'accha', 'achha', 'sundar', 'par',
  'kuch', 'aur', 'iske', 'uske', 'pehle', 'baad', 'zara', 'sahi', 'check', 'banao',
  'shuru', 'khatam', 'dhyan', 'rakhna', 'sirf', 'pura', 'poora', 'chahiye'
]);

/**
 * Detect language of user prompt (English, Hindi, or Hinglish)
 */
export function detectPromptLanguage(text: string): DetectedLanguage {
  if (!text || !text.trim()) return 'english';

  // Check for Devanagari Unicode block (\u0900 - \u097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hindi';
  }

  // Tokenize and check against Hinglish vocabulary
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  let hinglishHits = 0;
  for (const token of tokens) {
    if (HINGLISH_KEYWORDS.has(token)) {
      hinglishHits++;
    }
  }

  // If >= 2 hinglish words or >= 18% of tokens match
  if (hinglishHits >= 2 || (tokens.length > 0 && (hinglishHits / tokens.length) >= 0.18)) {
    return 'hinglish';
  }

  return 'english';
}

/**
 * Automatically evaluates prompt complexity to route to the optimal thinking budget.
 * Low: Quick edits, typos, 1-line queries.
 * Medium: Rewrites, tone transformations, table formatting, moderate expansions.
 * High: Full document generation, complex technical reasoning, in-depth critique, multi-hunk diffs.
 */
export function evaluateAutoThinkingLevel(prompt: string, docLines: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  const p = prompt.toLowerCase();
  const wordCount = prompt.trim().split(/\s+/).length;

  // High complexity triggers
  const highKeywords = [
    'generate entire', 'full document', 'complete guide', 'architecture', 'detailed essay',
    'comprehensive', 'deep dive', 'step by step explanation', 'in-depth analysis',
    'pura document banao', 'complete post', 'multi-section', 'pro and cons', 'technical spec'
  ];
  if (highKeywords.some((k) => p.includes(k)) || (wordCount > 60 && docLines > 100)) {
    return 'HIGH';
  }

  // Low complexity triggers
  const lowKeywords = [
    'typo', 'grammar', 'spellcheck', 'fix spelling', 'summarize in one line',
    'ek line me batao', 'short note', 'headline', 'title idea', 'what does this mean',
    'explain word', 'meaning of'
  ];
  if (lowKeywords.some((k) => p.includes(k)) || (wordCount <= 6 && !p.includes('write') && !p.includes('banao'))) {
    return 'LOW';
  }

  // Default balanced thinking for markdown authoring
  return 'MEDIUM';
}

/**
 * Resolves the effective thinking level (if AUTO is chosen, uses the evaluator)
 */
export function resolveThinkingLevel(configured: ThinkingLevel, prompt: string, docLines: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (configured === 'AUTO') {
    return evaluateAutoThinkingLevel(prompt, docLines);
  }
  if (configured === 'MINIMAL') return 'LOW';
  return configured;
}

/**
 * Smart prompt enhancement engine:
 * Refines a concise or rough user idea into a pro-grade markdown instruction
 * while strictly honoring the user's detected communication language.
 */
export function enhanceUserPrompt(rawPrompt: string): { enhanced: string; language: DetectedLanguage } {
  const lang = detectPromptLanguage(rawPrompt);
  const trimmed = rawPrompt.trim();

  if (lang === 'hindi') {
    return {
      enhanced: `कृपया निम्नलिखित निर्देश को स्पष्ट, सुरुचिपूर्ण और पेशेवर मार्कडाउन (Markdown) प्रारूप में निष्पादित करें:
"${trimmed}"

- उचित शीर्षक (#, ##, ###), मुख्य बिंदु (bullet points), और जहाँ उपयुक्त हो वहाँ तालिकाओं (tables) या कोड ब्लॉक का उपयोग करें।
- भाषा की शुद्धता, पठनीयता और पेशेवर टोन बनाए रखें।`,
      language: 'hindi'
    };
  }

  if (lang === 'hinglish') {
    return {
      enhanced: `Please execute this instruction in clean, high-impact professional Markdown format:
"${trimmed}"

- Maintain natural Hinglish/English clarity, keeping technical terms crisp and explanations engaging.
- Use structured headings, highlighted callouts/bullet points, and formatted code/tables where relevant.
- Make it polished and ready to publish directly into MD Writer.`,
      language: 'hinglish'
    };
  }

  // English enhancement
  return {
    enhanced: `Execute the following writing/editing task with professional Markdown precision:
"${trimmed}"

- Structure with clear typographic hierarchy (semantic headings, focused paragraphs, curated bullet lists).
- If modifying content, maintain consistent voice and preserve key existing nuances.
- Output clean GFM (GitHub Flavored Markdown) with syntax-highlighted code blocks or tables if appropriate.`,
    language: 'english'
  };
}
