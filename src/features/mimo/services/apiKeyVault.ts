/**
 * Secure Client-Side API Key Cryptographic Vault
 * Encrypts personal Google Gemini API keys using Web Crypto API (AES-GCM 256-bit)
 * with a device-derived salt, so keys are never stored as plaintext in localStorage.
 */

const VAULT_SALT_KEY = 'md_writer_vault_device_salt';
const PREFIX = 'enc:aes-gcm:';

let memorySalt: Uint8Array | null = null;

function getCryptoSubtle(): SubtleCrypto {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API is not supported in this runtime environment.');
}

function getOrGenerateDeviceSalt(): Uint8Array {
  if (memorySalt) return memorySalt;

  try {
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem(VAULT_SALT_KEY);
      if (existing) {
        memorySalt = new Uint8Array(
          existing
            .match(/.{1,2}/g)!
            .map((byte) => parseInt(byte, 16))
        );
        return memorySalt;
      }
    }
  } catch {}

  const salt = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(salt);
  } else {
    for (let i = 0; i < 16; i++) {
      salt[i] = Math.floor(Math.random() * 256);
    }
  }
  memorySalt = salt;

  try {
    if (typeof localStorage !== 'undefined') {
      const hex = Array.from(salt)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem(VAULT_SALT_KEY, hex);
    }
  } catch {}

  return salt;
}

async function deriveVaultKey(subtle: SubtleCrypto): Promise<CryptoKey> {
  const salt = getOrGenerateDeviceSalt();
  // Derive key from domain + local browser fingerprint baseline
  const deviceSeed =
    typeof navigator !== 'undefined'
      ? `${navigator.userAgent}_${navigator.language}_md_writer_vault`
      : 'md_writer_universal_secure_vault_seed';

  const enc = new TextEncoder();
  const baseKey = await subtle.importKey(
    'raw',
    enc.encode(deviceSeed),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 10000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array(0);
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/**
 * Encrypts a plaintext API key using AES-GCM 256-bit encryption.
 */
export async function encryptApiKey(rawKey: string): Promise<string> {
  const trimmed = rawKey.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith(PREFIX)) return trimmed;

  const subtle = getCryptoSubtle();
  const key = await deriveVaultKey(subtle);

  const iv = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(iv);
  } else {
    for (let i = 0; i < 12; i++) iv[i] = Math.floor(Math.random() * 256);
  }

  const enc = new TextEncoder();
  const ciphertextBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(trimmed)
  );

  const hexIv = bufferToHex(iv);
  const hexCipher = bufferToHex(ciphertextBuffer);

  return `${PREFIX}${hexIv}:${hexCipher}`;
}

/**
 * Decrypts a ciphertext API key back to plaintext.
 * Gracefully returns the original string if it was not encrypted (backward compatibility).
 */
export async function decryptApiKey(storedValue: string): Promise<string> {
  const trimmed = storedValue.trim();
  if (!trimmed) return '';

  if (!trimmed.startsWith(PREFIX)) {
    // Legacy unencrypted plaintext key
    return trimmed;
  }

  try {
    const payload = trimmed.slice(PREFIX.length);
    const [hexIv, hexCipher] = payload.split(':');
    if (!hexIv || !hexCipher) return '';

    const subtle = getCryptoSubtle();
    const key = await deriveVaultKey(subtle);
    const iv = hexToBuffer(hexIv);
    const ciphertext = hexToBuffer(hexCipher);

    const decryptedBuffer = await subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.warn('[apiKeyVault] Could not decrypt stored API key:', err);
    return '';
  }
}
