/**
 * Smart Code Block Normalizer & Language Detector for MD Writer.
 * 
 * Solves "Code Box Showing in Row" issue:
 * 1. When code is pasted or written on a single line / without newlines, intelligently
 *    expands it into clean, indented multi-line code.
 * 2. Corrects false language autodetections (e.g., Python code misclassified as Ruby).
 */

export interface FormattedCodeResult {
  formattedCode: string;
  detectedLanguage: string;
}

export function formatAndDetectCodeBlock(rawCode: string, providedLang?: string): FormattedCodeResult {
  if (!rawCode || typeof rawCode !== 'string') {
    return { formattedCode: rawCode || '', detectedLanguage: providedLang || 'code' };
  }

  let text = rawCode.trim();
  let lang = (providedLang || '').toLowerCase().trim();

  // 1. Language detection & disambiguation
  const hasPythonKeywords = /\b(def|class|self|__init__|@classmethod|@staticmethod|print)\b/.test(text);
  const isPythonSyntax = lang === 'python' || lang === 'py' || (!lang && hasPythonKeywords) || (lang === 'ruby' && hasPythonKeywords);

  if (isPythonSyntax) {
    lang = 'python';
  } else if (!lang) {
    if (/\b(const|let|var|function|=>|export|import|console\.log)\b/.test(text)) {
      lang = 'javascript';
    } else if (/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|CREATE TABLE)\b/i.test(text)) {
      lang = 'sql';
    } else if (/[{}]/.test(text) && /\b(color|display|margin|padding|background):/.test(text)) {
      lang = 'css';
    } else if (/<[a-z][\s\S]*>/i.test(text)) {
      lang = 'html';
    } else {
      lang = 'code';
    }
  }

  // If code already has multiple clean lines (> 2 newlines), preserve author's exact line breaks
  const existingNewlines = (text.match(/\n/g) || []).length;
  if (existingNewlines >= 3) {
    return { formattedCode: text, detectedLanguage: lang };
  }

  // 2. Expand single-line Python code into proper multi-line indented code
  if (lang === 'python') {
    // A. Break before decorators (@classmethod, @staticmethod, @property)
    text = text.replace(/([^\n])\s*(@(?:classmethod|staticmethod|property)\b)/g, '$1\n\n$2');

    // B. Break before top-level class declarations
    text = text.replace(/([^\n])\s*(class\s+[A-Za-z0-9_]+(?:\([^)]*\))?:)/g, '$1\n\n$2');

    // C. Break before methods (def method(self...):)
    text = text.replace(/([^\n])\s*(def\s+[A-Za-z0-9_]+\s*\([^)]*\):)/g, '$1\n    $2');

    // D. Break after colons when statements immediately follow on same line
    text = text.replace(/(def\s+[A-Za-z0-9_]+\s*\([^)]*\):)\s*([A-Za-z0-9_]+)/g, '$1\n        $2');
    text = text.replace(/(class\s+[A-Za-z0-9_]+(?:\([^)]*\))?:)\s*([A-Za-z0-9_]+)/g, '$1\n    $2');

    // E. Break consecutive variable assignments or statements inside methods
    text = text.replace(/(\bself\.[A-Za-z0-9_]+\s*=\s*[^;\n]+?)\s+(self\.[A-Za-z0-9_]+\s*=)/g, '$1\n        $2');
    text = text.replace(/(\bself\.[A-Za-z0-9_]+\s*=\s*[^;\n]+?)\s*(print\()/g, '$1\n        $2');
    text = text.replace(/(\bprint\([^)]*\))\s*(self\.[A-Za-z0-9_]+\s*=)/g, '$1\n        $2');
    text = text.replace(/(\bprint\([^)]*\))\s*(print\()/g, '$1\n        $2');

    // F. Break before object instantiations and invocations (e.g., ")s1 = Student()" or ")s1.set_data()")
    text = text.replace(/\)\s*([a-zA-Z0-9_]+\s*=\s*[A-Z][a-zA-Z0-9_]*\()/g, ')\n\n$1');
    text = text.replace(/\)\s*([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+\()/g, ')\n$1');
    text = text.replace(/([a-zA-Z0-9_]+\s*=\s*[A-Z][a-zA-Z0-9_]*\(\))\s*([a-zA-Z0-9_]+\s*=\s*[A-Z])/g, '$1\n$2');
    text = text.replace(/([a-zA-Z0-9_]+\s*=\s*[A-Z][a-zA-Z0-9_]*\(\))\s*([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)/g, '$1\n$2');
    text = text.replace(/(\b[A-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_]+\([^)]*\))\s*([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)/g, '$1\n$2');
  } else if (lang === 'javascript' || lang === 'typescript') {
    // Semicolon statement expansion for JS/TS if collapsed
    text = text.replace(/;\s*([a-zA-Z0-9_])/g, ';\n$1');
    text = text.replace(/\{\s*([a-zA-Z0-9_])/g, '{\n    $1');
    text = text.replace(/([a-zA-Z0-9_])\s*\}/g, '$1\n}');
  } else if (lang === 'sql') {
    // SQL statement expansion
    text = text.replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM)\b/gi, '\n$1');
  }

  return { formattedCode: text.trim(), detectedLanguage: lang };
}
