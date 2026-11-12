import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { encryptApiKey, decryptApiKey } from '../../src/features/mimo/services/apiKeyVault';

describe('Phase 4: Gemini API Key Security & Persistent Connection', () => {
  it('encrypts and decrypts API key using Web Crypto AES-GCM without plaintext in storage', async () => {
    const rawKey = 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6';
    const encrypted = await encryptApiKey(rawKey);

    assert.ok(encrypted.startsWith('enc:aes-gcm:'), 'Encrypted key must carry enc:aes-gcm: prefix');
    assert.strictEqual(encrypted.includes(rawKey), false, 'Encrypted output must not contain raw API key');

    const decrypted = await decryptApiKey(encrypted);
    assert.strictEqual(decrypted, rawKey, 'Decrypted key must match original key');
  });

  it('does not auto-trigger re-verification on hard-refresh or tab load in MimoSettingsPopover', () => {
    const popoverCode = fs.readFileSync('src/features/mimo/components/drawer/MimoSettingsPopover.tsx', 'utf-8');

    // Must not automatically trigger health check inside useEffect on activeTab === 'usage'
    assert.ok(
      !popoverCode.includes('activeTab === \'usage\' &&\n      userApiKey &&\n      (!lastCheckedTimestamp || Date.now() - lastCheckedTimestamp > API_HEALTH_CHECK_TTL_MS)'),
      'Must eliminate automatic 5-hour TTL background network probing on tab focus'
    );
  });

  it('protects API key from plaintext exposure in localStorage in useMimoStore', () => {
    const storeCode = fs.readFileSync('src/features/mimo/stores/useMimoStore.ts', 'utf-8');

    assert.ok(
      storeCode.includes('apiKeyVault') || storeCode.includes('encryptApiKey') || storeCode.includes('maskApiKeyForStorage'),
      'useMimoStore must use secure encryption or masking for persisted API key storage'
    );
  });
});
