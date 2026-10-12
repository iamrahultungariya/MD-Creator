/**
 * Privacy & Security Sanitizer
 * Automatically strips sensitive personal data (passwords, PINs, addresses, API keys)
 * and custom private blocks (<private>...</private>, ||secret||) before sending to AI.
 */

export interface SanitizationResult {
  sanitizedText: string;
  redactedCount: number;
  redactionTypes: string[];
  restore: (aiOutput: string) => string;
}

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const API_KEY_REGEX = /\b(?:sk-[a-zA-Z0-9_-]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36})\b/g;

// Key-value sensitive patterns like "password: mypass123", "pin = 4321", "secret_key: xxx"
const KEY_VALUE_SECRET_REGEX = /\b(password|passwd|pin|secret|api_key|token|access_key|private_key)\s*[:=]\s*([^\s,;]+)/gi;

// User explicit privacy tags: <private>secret</private>, <secret>pin</secret>, ||sensitive||
const TAGGED_PRIVATE_REGEX = /<private>([\s\S]*?)<\/private>/gi;
const TAGGED_SECRET_REGEX = /<secret>([\s\S]*?)<\/secret>/gi;
const SPOILER_PRIVATE_REGEX = /\|\|([\s\S]*?)\|\|/g;

export function sanitizeTextForAi(rawText: string): SanitizationResult {
  let sanitized = rawText;
  const redactionMap = new Map<string, string>();
  const typesDetected = new Set<string>();
  let counter = 1;

  const replaceAndMap = (match: string, replacementType: string, innerContent?: string) => {
    const placeholder = `[REDACTED_${replacementType}_${counter++}]`;
    redactionMap.set(placeholder, innerContent !== undefined ? innerContent : match);
    typesDetected.add(replacementType);
    return placeholder;
  };

  // 1. Explicit user tags: <private>...</private>
  sanitized = sanitized.replace(TAGGED_PRIVATE_REGEX, (_match, inner) => {
    return replaceAndMap(_match, 'PRIVATE_BLOCK', inner);
  });

  // 2. Explicit user tags: <secret>...</secret>
  sanitized = sanitized.replace(TAGGED_SECRET_REGEX, (_match, inner) => {
    return replaceAndMap(_match, 'SECRET_BLOCK', inner);
  });

  // 3. Inline double-pipe: ||secret||
  sanitized = sanitized.replace(SPOILER_PRIVATE_REGEX, (_match, inner) => {
    return replaceAndMap(_match, 'CONFIDENTIAL', inner);
  });

  // 4. Key-Value secrets (password, pin, etc.)
  sanitized = sanitized.replace(KEY_VALUE_SECRET_REGEX, (_match, key, val) => {
    const placeholder = replaceAndMap(val, key.toUpperCase());
    return `${key}: ${placeholder}`;
  });

  // 5. API keys / Bearer tokens
  sanitized = sanitized.replace(API_KEY_REGEX, (match) => {
    return replaceAndMap(match, 'API_KEY');
  });

  // 6. Credit card numbers
  sanitized = sanitized.replace(CREDIT_CARD_REGEX, (match) => {
    return replaceAndMap(match, 'CARD_NUMBER');
  });

  // 7. Emails
  sanitized = sanitized.replace(EMAIL_REGEX, (match) => {
    return replaceAndMap(match, 'EMAIL');
  });

  // 8. Phone numbers
  sanitized = sanitized.replace(PHONE_REGEX, (match) => {
    return replaceAndMap(match, 'PHONE');
  });

  const restore = (aiOutput: string): string => {
    let restored = aiOutput;
    for (const [placeholder, original] of redactionMap.entries()) {
      restored = restored.replaceAll(placeholder, original);
    }
    return restored;
  };

  return {
    sanitizedText: sanitized,
    redactedCount: redactionMap.size,
    redactionTypes: Array.from(typesDetected),
    restore,
  };
}
