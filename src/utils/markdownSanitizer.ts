import DOMPurify from 'dompurify';
import { defaultSchema, Options as SanitizeOptions } from 'rehype-sanitize';

/**
 * Custom rehype-sanitize schema for MD Writer.
 * Strictly forbids event handlers (onerror, onload, onclick), iframe, script, form,
 * and dangerous protocols while permitting KaTeX, tables, kbd, images, and rich formatting.
 */
export const markdownSanitizeSchema: SanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'align'],
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className', 'data*'],
    div: [...(defaultSchema.attributes?.div || []), 'className', 'data*'],
    h1: [...(defaultSchema.attributes?.h1 || []), 'id', 'data*'],
    h2: [...(defaultSchema.attributes?.h2 || []), 'id', 'data*'],
    h3: [...(defaultSchema.attributes?.h3 || []), 'id', 'data*'],
    h4: [...(defaultSchema.attributes?.h4 || []), 'id', 'data*'],
    h5: [...(defaultSchema.attributes?.h5 || []), 'id', 'data*'],
    h6: [...(defaultSchema.attributes?.h6 || []), 'id', 'data*'],
    kbd: ['className'],
    mark: ['className'],
    table: ['className'],
    th: ['align', 'className'],
    td: ['align', 'className'],
    input: ['type', 'checked', 'disabled'],
    img: ['src', 'alt', 'title', 'className', 'loading'],
    a: ['href', 'title', 'target', 'rel', 'className']
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'kbd', 'mark', 'sub', 'sup', 'details', 'summary', 'input'
  ],
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto', 'tel'],
    src: ['http', 'https', 'data', 'image', 'blob', 'localfile']
  }
};

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

  // 1. Protect code blocks (``` and `) AND math blocks ($$ and $) from modification
  const protectedBlocks: string[] = [];
  let sanitized = rawMarkdown.replace(/(```[\s\S]*?```|`[^`\n]+`|\$\$[\s\S]*?\$\$|\$(?!\s)[^\$\n]+(?<!\s)\$)/g, (match) => {
    const placeholder = `%%PROTECTED_BLOCK_${protectedBlocks.length}%%`;
    protectedBlocks.push(match);
    return placeholder;
  });

  // 1.5. Normalize local image paths & known launch image references
  sanitized = sanitized.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (fullMatch, alt, url) => {
    const cleanUrl = url.trim();
    if (
      cleanUrl.includes('media_1790593155944') ||
      cleanUrl.toLowerCase().includes('launch-image') ||
      cleanUrl.toLowerCase().includes('launch image') ||
      (alt && alt.toLowerCase().includes('launch image') && (cleanUrl.startsWith('C:') || cleanUrl.startsWith('file:') || !cleanUrl.startsWith('http') || cleanUrl === ''))
    ) {
      return `![${alt || 'launch image'}](/launch-image.jpg)`;
    }

    if (/^(?:file:\/\/\/|[a-zA-Z]:[\\/])/i.test(cleanUrl)) {
      return `![${alt}](localfile://${encodeURIComponent(cleanUrl)})`;
    }

    if (cleanUrl.includes(' ') && !cleanUrl.startsWith('<') && !cleanUrl.startsWith('http') && !cleanUrl.startsWith('data:')) {
      return `![${alt}](<${cleanUrl}>)`;
    }

    return fullMatch;
  });

  // 2. Convert Markdown highlight syntax ==text== into HTML <mark>text</mark>
  sanitized = sanitized.replace(/(?<!=)==(?!=)([^=\r\n]+?)(?<!=)==(?!=)/g, '<mark>$1</mark>');

  // 3. Escape mathematical '<' that precedes numbers, symbols, or invalid tag names (<20, <1000, <=, < 1GB)
  sanitized = sanitized.replace(/<(?![a-zA-Z/])/g, '&lt;');
  sanitized = sanitized.replace(/<([a-zA-Z0-9_-]+)([\s>])/g, (match, tagName, after) => {
    const cleanTag = tagName.toLowerCase();
    if (ALLOWED_HTML_TAGS.has(cleanTag) || cleanTag.startsWith('data-')) {
      return match; // Keep legitimate HTML tags
    }
    return `&lt;${tagName}${after}`;
  });

  // 3. Immediately neutralize phishing tags and active XSS vectors
  sanitized = sanitized.replace(/<\/?(form|input|button|script|iframe|frame|object|embed|applet|style|link|base|textarea|select|svg)\b[^>]*>/gi, '');

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
      'embed', 'applet', 'meta', 'link', 'base', 'textarea', 'select', 'style', 'svg'
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

  // 6. Restore markdown blockquote markers (DOMPurify converts '>' in text to '&gt;')
  sanitized = sanitized.replace(/^([ \t]*)(?:&gt;[ \t]?)+/gm, (match) => {
    return match.replace(/&gt;/g, '>');
  });

  // 7. Fix isolated '>' on its own line when immediately inside or adjacent to parentheses
  sanitized = sanitized.replace(/\(\s*\n>\s*\n/g, '(&gt; ');

  // 8. Restore protected blocks (code fences, inline code, display & inline KaTeX math)
  sanitized = sanitized.replace(/%%PROTECTED_BLOCK_(\d+)%%/g, (_, index) => {
    return protectedBlocks[Number(index)] || '';
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
  normalized = normalized.replace(/\(\s*\n([>\s\d\w.→≤≥%+-]+)\n\s*([>\s\d\w.→≤≥%+-]+)\s*\)/g, (fullMatch) => {
    return fullMatch
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  });

  // 2. Clean isolated symbol lines
  normalized = normalized.replace(/(\w+)\s*\(\s*\n\s*(\d+)\s*\n\s*(px|ms|rem|em|%)\s*\n\s*→\s*\n\s*(\d+)\s*\n\s*(px|ms|rem|em|%)\s*\n\s*([^)\n]+)\)/g, 
    '$1 ($2$3 → $4$5)'
  );

  // 3. Clean duplicate arrow lines
  normalized = normalized.replace(/\n\s*→\s*\n\s*→/g, ' →');
  normalized = normalized.replace(/\n\s*→\s*\n/g, ' → ');

  // 4. Clean isolated comparison lines
  normalized = normalized.replace(/\n\s*([≤≥<>]=?)\s*\n\s*(\d+)\s*\n\s*[≤≥<>]=?\s*(\d+)/g, ' $1 $2');
  normalized = normalized.replace(/\n\s*([≤≥<>]=?)\s*\n\s*(\d+)/g, ' $1 $2');

  // 5. Restore protected code blocks
  normalized = normalized.replace(/%%PROTECTED_CODE_(\d+)%%/g, (_, index) => {
    return codeBlocks[Number(index)] || '';
  });

  return normalized;
}

/**
 * Validates if an anchor link href is safe against XSS attacks.
 * Blocks dangerous schemes (javascript:, vbscript:, data:, file:)
 * while permitting http, https, mailto, tel, and relative anchors.
 */
export function isSafeUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Block forbidden schemes (including obfuscated variations like java\0script:)
  if (/^[\s\x00-\x1f]*(javascript|vbscript|data|file):/i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    // Relative anchors and path links
    return /^(#|\/|\.\/|\.\.\/)/.test(trimmed);
  }
}

/**
 * Validates if an image src is safe against XSS and injection attacks.
 * Allows safe protocols (http, https, blob, image://, localfile://) and safe data image URLs,
 * while blocking executable script vectors (javascript:, vbscript:, and data:text/html).
 */
export function isSafeImageUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Block active executable script schemes
  if (/^[\s\x00-\x1f]*(javascript|vbscript):/i.test(trimmed)) {
    return false;
  }

  // If data: URL, ensure it is an approved safe image MIME type
  if (/^[\s\x00-\x1f]*data:/i.test(trimmed)) {
    return /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml|avif|bmp|ico);/i.test(trimmed);
  }

  // Direct safe schemes
  if (/^(image:\/\/|localfile:\/\/|img_|blob:|\/|\.\/)/i.test(trimmed)) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return ['http:', 'https:', 'blob:', 'image:', 'localfile:'].includes(parsed.protocol);
  } catch {
    // Relative paths and short IndexedDB identifiers
    return true;
  }
}

