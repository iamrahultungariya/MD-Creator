import DOMPurify from 'dompurify';

/**
 * Valid HTML tags allowed in MD Writer markdown documents
 */
const ALLOWED_HTML_TAGS = new Set([
  'details', 'summary', 'kbd', 'br', 'hr', 'span', 'div', 'p', 'b', 'i', 'strong', 'em', 'sub', 'sup', 'mark', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'
]);

// Hook DOMPurify to strip dangerous styles and full-screen hijacks
DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName === 'style') {
    data.attrValue = data.attrValue
      .replace(/position\s*:\s*(fixed|absolute|sticky)\s*;?/gi, '')
      .replace(/z-index\s*:\s*[^;]+;?/gi, '')
      .replace(/top\s*:\s*0\s*;?\s*left\s*:\s*0\s*;?/gi, '')
      .replace(/width\s*:\s*(100vw|100%)\s*;?\s*height\s*:\s*(100vh|100%)\s*;?/gi, '');
  }
});

/**
 * Sanitizes raw markdown before feeding into ReactMarkdown AST.
 * 1. Blocks active XSS and phishing forms (<form>, <input>, scripts, event handlers).
 * 2. Neutralizes malicious CSS bleeding (position: fixed, z-index 9999 UI hijacks).
 * 3. Repairs unclosed tags to prevent markdown bleed into parent DOM.
 * 4. Preserves legitimate code fences and mathematical operators (<20, < 1GB).
 */
export function sanitizeMarkdownForPreview(rawMarkdown: string): string {
  if (!rawMarkdown) return '';

  // 1. Protect code blocks (``` and `) from modification
  const codeBlocks: string[] = [];
  let sanitized = rawMarkdown.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    const placeholder = `%%CODE_BLOCK_${codeBlocks.length}%%`;
    codeBlocks.push(match);
    return placeholder;
  });

  // 2. Escape mathematical '<' that precedes numbers, symbols, or invalid tag names (<20, <1000, <=, < 1GB)
  sanitized = sanitized.replace(/<(?![a-zA-Z/])/g, '&lt;');
  sanitized = sanitized.replace(/<([a-zA-Z0-9_-]+)([\s>])/g, (match, tagName, after) => {
    const cleanTag = tagName.toLowerCase();
    if (ALLOWED_HTML_TAGS.has(cleanTag) || cleanTag.startsWith('data-')) {
      return match; // Keep legitimate HTML tags
    }
    return `&lt;${tagName}${after}`;
  });

  // 3. Immediately neutralize phishing tags and active XSS vectors
  sanitized = sanitized.replace(/<\/?(form|input|button|script|iframe|frame|object|embed|applet|style|link|base|textarea|select)\b[^>]*>/gi, '');

  // 4. Sanitize dangerous inline CSS (position: fixed, z-index 9999, etc.) from tag style attributes
  sanitized = sanitized.replace(/style\s*=\s*(["'])([\s\S]*?)\1/gi, (_, quote, styleContent) => {
    const cleanStyle = styleContent
      .replace(/position\s*:\s*(fixed|absolute|sticky)\s*;?/gi, '')
      .replace(/z-index\s*:\s*[^;]+;?/gi, '')
      .replace(/top\s*:\s*0\s*;?\s*left\s*:\s*0\s*;?/gi, '')
      .replace(/width\s*:\s*(100vw|100%)\s*;?\s*height\s*:\s*(100vh|100%)\s*;?/gi, '');
    return `style=${quote}${cleanStyle}${quote}`;
  });

  // 5. Sanitize with DOMPurify to guarantee unclosed tags are balanced & event handlers removed
  sanitized = DOMPurify.sanitize(sanitized, {
    FORBID_TAGS: [
      'form', 'input', 'button', 'script', 'iframe', 'frame', 'object',
      'embed', 'applet', 'meta', 'link', 'base', 'textarea', 'select', 'style'
    ],
    FORBID_ATTR: [
      'action', 'formaction', 'method', 'target',
      'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'onsubmit', 'onkeydown', 'onkeypress', 'onkeyup'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|image):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  });

  // 6. Fix isolated '>' on its own line when immediately inside or adjacent to parentheses
  sanitized = sanitized.replace(/\(\s*\n>\s*\n/g, '(&gt; ');

  // 7. Restore code blocks untouched
  sanitized = sanitized.replace(/%%CODE_BLOCK_(\d+)%%/g, (_, index) => {
    return codeBlocks[Number(index)] || '';
  });

  return sanitized;
}

/**
 * Smart Clean & Normalizer for pasted clipboard fragments.
 * When copying from web benchmarks, CI logs, or rich-text cards, inline badges often get split
 * onto separate individual lines (e.g. "(\n>\n21.7\nms\n>21.7ms)").
 * This function repairs those fragments into clean, beautiful Markdown.
 */
export function cleanAndNormalizeMarkdown(text: string): string {
  if (!text) return '';

  // Protect code fences
  const codeBlocks: string[] = [];
  let normalized = text.replace(/(```[\s\S]*?```)/g, (match) => {
    const placeholder = `%%PROTECTED_CODE_${codeBlocks.length}%%`;
    codeBlocks.push(match);
    return placeholder;
  });

  // 1. Clean fragmented parenthetical metrics:
  // e.g. "(\n>\n21.7\nms\n>21.7ms)" -> "(>21.7ms)"
  normalized = normalized.replace(/\(\s*\n([>\s\d\w.→≤≥%+-]+)\n\s*([>\s\d\w.→≤≥%+-]+)\s*\)/g, (fullMatch) => {
    const cleaned = fullMatch
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned;
  });

  // 2. Clean isolated symbol lines:
  // "blur (\n 8 \n px \n → \n 0 \n px \n 8px→0px)" -> "blur (8px → 0px)"
  normalized = normalized.replace(/(\w+)\s*\(\s*\n\s*(\d+)\s*\n\s*(px|ms|rem|em|%)\s*\n\s*→\s*\n\s*(\d+)\s*\n\s*(px|ms|rem|em|%)\s*\n\s*([^)\n]+)\)/g, 
    '$1 ($2$3 → $4$5)'
  );

  // 3. Clean duplicate arrow lines:
  // e.g. "pnpm test:bench \n → \n → 100% Passed" -> "pnpm test:bench → 100% Passed"
  normalized = normalized.replace(/\n\s*→\s*\n\s*→/g, ' →');
  normalized = normalized.replace(/\n\s*→\s*\n/g, ' → ');

  // 4. Clean isolated comparison lines:
  // "me strictly \n ≤ \n 20 \n ≤20 images" -> "me strictly ≤ 20 images"
  normalized = normalized.replace(/\n\s*([≤≥<>]=?)\s*\n\s*(\d+)\s*\n\s*[≤≥<>]=?\s*(\d+)/g, ' $1 $2');
  normalized = normalized.replace(/\n\s*([≤≥<>]=?)\s*\n\s*(\d+)/g, ' $1 $2');

  // 5. Restore protected code blocks
  normalized = normalized.replace(/%%PROTECTED_CODE_(\d+)%%/g, (_, index) => {
    return codeBlocks[Number(index)] || '';
  });

  return normalized;
}
