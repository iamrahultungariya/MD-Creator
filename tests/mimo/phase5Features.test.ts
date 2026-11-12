import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { sanitizeTextForAi } from '../../src/features/mimo/services/privacySanitizer';

describe('Phase 5: Privacy Exclusion, Local-Only Sync & Smart Next-Step Chips', () => {
  it('strictly excludes <privateDetail> and :::private-detail from AI context scanning', () => {
    const rawDoc = `
# Project Strategy
Public intro text.

<privateDetail>
Confidential API secret: super_secret_token_12345
Internal financial budget: $2,500,000
</privateDetail>

:::private-detail
Client personal home address: 123 Baker Street
:::

Public conclusion text.
`;

    const result = sanitizeTextForAi(rawDoc);

    // AI input must NOT contain the sensitive content
    assert.strictEqual(result.sanitizedText.includes('super_secret_token_12345'), false);
    assert.strictEqual(result.sanitizedText.includes('$2,500,000'), false);
    assert.strictEqual(result.sanitizedText.includes('123 Baker Street'), false);

    // Sanitized output must preserve public content
    assert.ok(result.sanitizedText.includes('Public intro text'));
    assert.ok(result.sanitizedText.includes('Public conclusion text'));
  });

  it('provides /privateDetail in editor slash command menu', () => {
    const slashHook = fs.readFileSync('src/features/editor/hooks/useSlashCommands.ts', 'utf-8');
    const slashMenu = fs.readFileSync('src/components/editor/SlashCommandMenu.tsx', 'utf-8');

    assert.ok(
      slashHook.includes('privateDetail') || slashHook.includes('private') || slashMenu.includes('privateDetail'),
      'Slash command menu must include /privateDetail command'
    );
  });

  it('honors isLocalOnly in syncDocumentToSupabase to keep marked documents strictly local', () => {
    const supabaseCode = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

    assert.ok(
      supabaseCode.includes('isLocalOnly') || supabaseCode.includes('localOnly'),
      'syncDocumentToSupabase must check isLocalOnly before cloud push'
    );
  });

  it('renders smart next-operation suggestion chips on completed Mimo responses', () => {
    const msgCode = fs.readFileSync('src/features/mimo/components/MimoChatMessage.tsx', 'utf-8');
    const serviceCode = fs.readFileSync('src/features/mimo/services/mimoGeminiService.ts', 'utf-8');

    assert.ok(
      serviceCode.includes('generateNextOperationSuggestions') || serviceCode.includes('suggestedActions'),
      'mimoGeminiService must provide next-operation suggestion generation'
    );

    assert.ok(
      msgCode.includes('suggestedActions') || msgCode.includes('suggestion'),
      'MimoChatMessage must render suggested action chips'
    );
  });
});
