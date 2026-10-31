import { ThinkingLevel, MimoIntentType } from '../types/mimoTypes';

export type DetectedLanguage = 'english' | 'hindi' | 'hinglish';

const HINGLISH_KEYWORDS = new Set([
  'higlish', 'kya', 'karna', 'karo', 'kare', 'kaise', 'batao', 'bata', 'ye', 'yeh', 'wo', 'woh',
  'thoda', 'thoda-sa', 'badlo', 'badal', 'samjhao', 'likho', 'likh', 'theek', 'theek-kar',
  'mein', 'me', 'hai', 'hain', 'nahi', 'nahin', 'accha', 'achha', 'sundar', 'par',
  'kuch', 'aur', 'iske', 'uske', 'pehle', 'baad', 'zara', 'sahi', 'check', 'banao',
  'shuru', 'khatam', 'dhyan', 'rakhna', 'sirf', 'pura', 'poora', 'chahiye'
]);

/**
 * Classifies user prompt into a high-confidence intent category:
 * - GENERAL_QA: Conceptual or knowledge questions (e.g. "What is Python?", "How does async work?")
 * - DOC_QUERY: Inquiries specifically analyzing the active document (e.g. "Summarize this doc", "What does section 2 say?")
 * - DOC_TRANSFORM: Direct instructions to edit or propose a diff on document text
 * - CREATIVE_EXPANSION: Drafting new sections or continuing document authoring
 * - CHAT_BANTER: Casual conversational greetings or acknowledgements
 */
export function classifyUserIntent(prompt: string, hasSelection = false): MimoIntentType {
  const p = prompt.trim().toLowerCase();

  // 1. Explicit Transform / Edit keywords
  const editKeywords = [
    'edit', 'change', 'improve', 'rewrite', 'fix', 'diff', 'theek', 'badlo', 'hatao',
    'replace', 'correct', 'refactor', 'format table', 'add section', 'nayi section',
    'spellcheck', 'proofread', 'polish'
  ];
  if (editKeywords.some((k) => p.includes(k))) {
    return 'DOC_TRANSFORM';
  }

  // 2. Focused selection actions (e.g. "explain this", "rewrite this")
  if (hasSelection && (p.includes('this') || p.includes('ye') || p.includes('isko') || p.length < 25)) {
    return 'DOC_TRANSFORM';
  }

  // 3. Document query / inquiry (Robust Regex + Keyword matching)
  const docQueryRegexes = [
    /\b(?:in|inside|from|with|present\s+in)\s+(?:this|the|my)?\s*(?:doc|document|file)\b/i,
    /\b(?:is|iss|is\s+wali|iss\s+wali)\s+(?:doc|document|file)\b/i,
    /\b(?:doc|document|file)\s*(?:me|mein|ke\s*andar)\b/i,
    /\b(?:summarize|summary|takeaways?|outline|overview|review\s+document)\b/i,
    /\bwhat\s+does\s+(?:this|the)\s+(?:doc|document)\s+say\b/i,
    /\biss?\s+document\s+(?:me|mein)\s+kya\s+hai\b/i,
    /\bkya\s+yeh\s+useful\s+hai\b/i,
    /\bexplain\s+.*(?:in|from|of)\s+(?:the\s+)?(?:document|doc|file)\b/i,
  ];
  if (docQueryRegexes.some((re) => re.test(p))) {
    return 'DOC_QUERY';
  }

  const docQueryKeywords = [
    'in this doc', 'in my doc', 'is document me', 'in this file', 'is file me',
    'summarize', 'summary', 'takeaway', 'outline', 'notes', 'what does this doc say',
    'review document', 'overview', 'iss document', 'is document', 'in document', 'document me'
  ];
  if (docQueryKeywords.some((k) => p.includes(k))) {
    return 'DOC_QUERY';
  }

  // 4. Creative expansion
  const expansionKeywords = [
    'continue writing', 'next section', 'aage likho', 'draft section', 'outline next',
    'write section', 'generate doc'
  ];
  if (expansionKeywords.some((k) => p.includes(k))) {
    return 'CREATIVE_EXPANSION';
  }

  // 5. Chat banter / greetings
  const banterKeywords = [
    'hi', 'hello', 'hey', 'kaise ho', 'who are you', 'kon ho', 'thanks', 'thank you', 'shukriya'
  ];
  if (banterKeywords.some((k) => p === k || p.startsWith(k + ' ') || p.endsWith(' ' + k))) {
    return 'CHAT_BANTER';
  }

  // 6. Default: GENERAL_QA (Answers the user's question directly with full accuracy)
  return 'GENERAL_QA';
}

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
 * Intent classification for prompt enhancement to provide laser-focused,
 * context-aware prompt expansions rather than generic boilerplate.
 */
export type EnhancementIntent =
  | 'FOOTER_SIGNATURE'
  | 'TABLE_DATA'
  | 'KATEX_MATH_LOGIC'
  | 'DIFF_EDIT_IMPROVE'
  | 'GENERAL_CONCEPT_QA'
  | 'CREATIVE_EXPANSION'
  | 'GENERAL_PROMPT';

export function classifyEnhancementIntent(prompt: string): EnhancementIntent {
  const p = prompt.toLowerCase();

  // 1. Footer / Author Attribution Intent
  if (
    p.includes('footer') ||
    p.includes('written by') ||
    p.includes('writtern by') ||
    p.includes('author') ||
    p.includes('signature') ||
    p.includes('sign') ||
    (p.includes('bottom') && (p.includes('likho') || p.includes('add') || p.includes('name')))
  ) {
    return 'FOOTER_SIGNATURE';
  }

  // 2. Math & Discrete Logic Intent (Takes precedence over plain tables for "truth tables")
  if (
    p.includes('logic') ||
    p.includes('formula') ||
    p.includes('math') ||
    p.includes('equation') ||
    p.includes('symbol') ||
    p.includes('truth table') ||
    p.includes('discrete') ||
    p.includes('latex') ||
    p.includes('katex')
  ) {
    return 'KATEX_MATH_LOGIC';
  }

  // 3. Table / Data Intent
  if (
    (p.includes('table') && !p.includes('truth table')) ||
    p.includes('tabular') ||
    p.includes('matrix') ||
    p.includes('columns') ||
    p.includes('table banao') ||
    p.includes('comparison')
  ) {
    return 'TABLE_DATA';
  }

  // 4. Conceptual Knowledge & General QA
  if (
    p.includes('what is') ||
    p.includes('how does') ||
    p.includes('difference between') ||
    p.includes('kya hai') ||
    p.includes('kaise kaam') ||
    p.includes('meaning of') ||
    (p.includes('explain') && !p.includes('this') && !p.includes('isko') && !p.includes('document'))
  ) {
    return 'GENERAL_CONCEPT_QA';
  }

  // 5. Diff & Editing Improvements
  if (
    p.includes('edit') ||
    p.includes('change') ||
    p.includes('improve') ||
    p.includes('rewrite') ||
    p.includes('fix') ||
    p.includes('theek') ||
    p.includes('badlo') ||
    p.includes('proofread') ||
    p.includes('grammar') ||
    p.includes('diff')
  ) {
    return 'DIFF_EDIT_IMPROVE';
  }

  // 6. Section Expansion
  if (
    p.includes('continue') ||
    p.includes('next section') ||
    p.includes('aage likho') ||
    p.includes('draft section') ||
    p.includes('expand') ||
    p.includes('outline')
  ) {
    return 'CREATIVE_EXPANSION';
  }

  return 'GENERAL_PROMPT';
}

/**
 * Smart context-aware prompt enhancement engine:
 * Refines a concise or rough user idea into a pro-grade markdown instruction
 * tailored to the EXACT intent (Footer, Table, Math/Logic, QA, Diff, Expansion)
 * while strictly honoring the user's detected communication language.
 */
export function enhanceUserPrompt(rawPrompt: string): { enhanced: string; language: DetectedLanguage } {
  const lang = detectPromptLanguage(rawPrompt);
  const trimmed = rawPrompt.trim();
  const intent = classifyEnhancementIntent(trimmed);

  // 1. FOOTER & AUTHOR ATTRIBUTION
  if (intent === 'FOOTER_SIGNATURE') {
    if (lang === 'hindi') {
      return {
        enhanced: `दस्तावेज़ के अंत में एक सुरुचिपूर्ण और पेशेवर पादलेख (footer) जोड़ें: "${trimmed}"।
- साफ़ क्षैतिज विभाजक (---) और केंद्रित लेखक विवरण (sub/bold) का उपयोग करें।
- केवल पादलेख स्निपेट या diff प्रदान करें, दस्तावेज़ की मौजूदा पंक्तियों को दोहराएं नहीं।`,
        language: 'hindi',
      };
    }
    if (lang === 'hinglish') {
      return {
        enhanced: `Document ke aakhir mein ek beautifully styled publication footer add karo: "${trimmed}".
- Minimalist horizontal divider (---) aur centered author attribution format use karo.
- Output mein sirf footer snippet ya clean diff do, existing document ka text repeat mat karo.`,
        language: 'hinglish',
      };
    }
    return {
      enhanced: `Add a clean, beautifully formatted publication footer at the bottom of the document: "${trimmed}".
- Use an elegant horizontal divider (---) and centered author attribution.
- Output ONLY the footer snippet or diff hunk; do not repeat existing document text.`,
      language: 'english',
    };
  }

  // 2. KATEX MATH & DISCRETE LOGIC
  if (intent === 'KATEX_MATH_LOGIC') {
    if (lang === 'hindi') {
      return {
        enhanced: `KaTeX LaTeX गणितीय संकेतों ($...$ और $$...$$) का उपयोग करके स्पष्ट व्याख्या और सूत्र प्रदान करें: "${trimmed}"।
- तार्किक संयोजकों (\\wedge, \\vee, \\neg, \\equiv, \\rightarrow) और सत्यता तालिकाओं (truth tables) को सटीक रूप से प्रस्तुत करें।
- परिभाषाओं और उदाहरणों के साथ संरचित मार्कडाउन में उत्तर दें।`,
        language: 'hindi',
      };
    }
    if (lang === 'hinglish') {
      return {
        enhanced: `KaTeX LaTeX notation ke saath crystal-clear explanation aur logic formulas provide karo: "${trimmed}".
- Inline symbols ke liye $...$ (\\wedge, \\vee, \\neg, \\equiv, \\rightarrow) aur display equations ke liye $$...$$ use karo.
- Truth tables, key definitions aur practical examples ke saath structured explanation do.`,
        language: 'hinglish',
      };
    }
    return {
      enhanced: `Explain and format these concepts using standard KaTeX LaTeX math syntax: "${trimmed}".
- Use $...$ for inline symbols (\\wedge, \\vee, \\neg, \\equiv, \\rightarrow) and $$...$$ for display equations.
- Include concise truth tables, formal definitions, and clear examples.`,
      language: 'english',
    };
  }

  // 3. TABLE & DATA COMPARISON
  if (intent === 'TABLE_DATA') {
    if (lang === 'hindi') {
      return {
        enhanced: `एक सुव्यवस्थित और स्पष्ट मार्कडाउन तालिका (GFM Table) बनाएँ: "${trimmed}"।
- स्पष्ट कॉलम संरेखण (:---, :---:, ---:), मुख्य शीर्षक और संक्षिप्त तुलना शामिल करें।
- डेटा को साफ़ और आसानी से पढ़ने योग्य प्रारूप में प्रस्तुत करें।`,
        language: 'hindi',
      };
    }
    if (lang === 'hinglish') {
      return {
        enhanced: `Structured aur clean GFM Markdown comparison table generate karo: "${trimmed}".
- Aligned columns (:---, :---:, ---:), bold headers, aur crisp points include karo.
- High-density, professional presentation ensure karo jo directly publish ho sake.`,
        language: 'hinglish',
      };
    }
    return {
      enhanced: `Construct a clean, publication-grade GitHub Flavored Markdown (GFM) comparison table for: "${trimmed}".
- Include bold header rows, proper column alignment (:---, :---:, ---:), and high-density, concise cell values.
- Ensure the table is ready to paste directly into the document.`,
      language: 'english',
    };
  }

  // 4. CONCEPTUAL KNOWLEDGE & GENERAL QA
  if (intent === 'GENERAL_CONCEPT_QA') {
    if (lang === 'hindi') {
      return {
        enhanced: `इस तकनीकी विषय पर एक स्पष्ट, विस्तृत और सटीक व्याख्या प्रदान करें: "${trimmed}"।
- मुख्य परिभाषा, वास्तुकला (architecture) के सिद्धांत और व्यावहारिक उदाहरण शामिल करें।
- सुव्यवस्थित मार्कडाउन प्रारूप में सीधे और सटीक उत्तर दें।`,
        language: 'hindi',
      };
    }
    if (lang === 'hinglish') {
      return {
        enhanced: `Is topic par crystal-clear, deep aur structured technical explanation provide karo: "${trimmed}".
- Core definition, architectural principles, aur practical real-world examples include karo.
- Direct, engaging answer provide karo bina unnecessary document dump ke.`,
        language: 'hinglish',
      };
    }
    return {
      enhanced: `Provide a comprehensive, authoritative, and well-structured technical explanation: "${trimmed}".
- Cover core definitions, architectural tenets, practical real-world examples, and best practices.
- Deliver direct, high-value insights using clean Markdown.`,
      language: 'english',
    };
  }

  // 5. DIFF & EDITING IMPROVEMENTS
  if (intent === 'DIFF_EDIT_IMPROVE') {
    if (lang === 'hindi') {
      return {
        enhanced: `लक्षित पाठ की समीक्षा करें और उसमें सुधार करें: "${trimmed}"।
- स्पष्टता, व्याकरण और पेशेवर टोन को बेहतर बनाते हुए एक साफ़ diff ब्लॉक (- पुरानी पंक्ति, + नई पंक्ति) प्रस्तावित करें।
- मौजूदा संदर्भ और दस्तावेज़ के मूल सार को सुरक्षित रखें।`,
        language: 'hindi',
      };
    }
    if (lang === 'hinglish') {
      return {
        enhanced: `Targeted text ko refine aur polish karo: "${trimmed}".
- Line-by-line clean diff block (- old line, + new line) propose karo taaki clarity, grammar aur tone professional ho sake.
- Non-destructive changes ensure karo jise 1-click mein apply kiya ja sake.`,
        language: 'hinglish',
      };
    }
    return {
      enhanced: `Review and refine the targeted text: "${trimmed}".
- Propose precise, non-destructive improvements via a clean diff block (- old line, + new line), elevating clarity, grammar, and tone.
- Preserve core document context while eliminating redundancies.`,
      language: 'english',
    };
  }

  // 6. CREATIVE SECTION EXPANSION
  if (intent === 'CREATIVE_EXPANSION') {
    if (lang === 'hindi') {
      return {
        enhanced: `दस्तावेज़ की अगली तार्किक धारा (next section) तैयार करें: "${trimmed}"।
- दस्तावेज़ के प्रवाह को बनाए रखते हुए उचित शीर्षकों (#, ##, ###), मुख्य बिंदुओं और स्पष्ट उदाहरणों के साथ विस्तार करें।
- पेशेवर और प्रकाशन-योग्य सामग्री तैयार करें।`,
        language: 'hindi',
      };
    }
    if (lang === 'hinglish') {
      return {
        enhanced: `Document ke flow ko aage badhate hue agla section draft karo: "${trimmed}".
- Cohesive headings (#, ##, ###), crisp bullet points, aur structured notes provide karo.
- Active document ke context ke saath seamlessly blend hone wala content banao.`,
        language: 'hinglish',
      };
    }
    return {
      enhanced: `Draft the next logical section: "${trimmed}".
- Seamlessly extend the document's narrative flow with clear headings (#, ##, ###), compelling arguments, and practical insights.
- Produce cohesive, publish-ready Markdown.`,
      language: 'english',
    };
  }

  // 7. GENERAL PROMPT (Fallback)
  if (lang === 'hindi') {
    return {
      enhanced: `कृपया निम्नलिखित कार्य को स्पष्ट, सुरुचिपूर्ण और पेशेवर मार्कडाउन (Markdown) प्रारूप में निष्पादित करें: "${trimmed}"।
- उचित संरचना, शुद्ध भाषा और पठनीयता बनाए रखें।`,
      language: 'hindi',
    };
  }

  if (lang === 'hinglish') {
    return {
      enhanced: `Is instruction ko clean, high-impact professional Markdown format mein execute karo: "${trimmed}".
- Natural Hinglish/English clarity, crisp technical terms, aur structured output maintain karo.`,
      language: 'hinglish',
    };
  }

  return {
    enhanced: `Execute the following writing/editing task with professional Markdown precision: "${trimmed}".
- Ensure clear typographic hierarchy, consistent voice, and publication-ready output.`,
    language: 'english',
  };
}