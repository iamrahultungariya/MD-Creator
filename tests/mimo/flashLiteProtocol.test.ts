import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { resolveAdaptiveDepth } from '../../src/features/mimo/services/promptRouter';
import { buildFlashLiteExecutionProtocolPrompt } from '../../src/features/mimo/services/intentPromptService';

describe('Mimo 3.5 Flash-Lite Execution Protocol & Timeline', () => {
  it('resolves Adaptive Depth cleanly based on intent and user query signals', () => {
    assert.strictEqual(
      resolveAdaptiveDepth({ query: 'tl;dr summarize briefly', wordCount: 4, intent: 'GENERAL_QA' }),
      'simple'
    );
    assert.strictEqual(
      resolveAdaptiveDepth({ query: 'Write a complete architecture spec with edge cases and comparison table', wordCount: 12, intent: 'CREATIVE_EXPANSION' }),
      'comprehensive'
    );
    assert.strictEqual(
      resolveAdaptiveDepth({ query: 'Explain step-by-step how to migrate authentication', wordCount: 8, intent: 'DOC_QUERY' }),
      'detailed'
    );
    assert.strictEqual(
      resolveAdaptiveDepth({ query: 'Fix typo in heading', wordCount: 4, intent: 'DOC_TRANSFORM', hasSelection: true }),
      'standard'
    );
  });

  it('builds Expert Markdown Writing Assistant protocol prompt for 3.5 Flash-Lite without exposing reasoning', () => {
    const prompt = buildFlashLiteExecutionProtocolPrompt('DOC_TRANSFORM', {
      adaptiveDepth: 'detailed',
      hasSelection: true,
      docTitle: 'API Guide',
    });

    for (const step of ['Understand', 'Decompose', 'Develop', 'Verify', 'Polish']) {
      assert.ok(prompt.includes(step), `Protocol prompt must include step: ${step}`);
    }
    assert.ok(prompt.includes('expert Markdown writing assistant'), 'Must include Expert Markdown Writing Assistant identity');
    assert.ok(prompt.includes('Do not expose internal analysis or private reasoning'), 'Must suppress internal analysis leakage');
    assert.ok(prompt.includes('Adaptive Depth'), 'Must enforce adaptive depth calibration');
    assert.ok(prompt.includes('Selected Depth: Detailed'), 'Must propagate resolved depth level');
    assert.ok(prompt.includes('```diff') || prompt.includes('```replacement'), 'DOC_TRANSFORM mode must preserve diff/replacement output contract');
  });

  it('scopes the 5-step execution timeline strictly to gemini-3.5-flash-lite and hides MimoThoughtBlock for it', () => {
    const serviceCode = fs.readFileSync('src/features/mimo/services/mimoGeminiService.ts', 'utf-8');
    const hookCode = fs.readFileSync('src/features/mimo/hooks/useMimoChatStream.ts', 'utf-8');
    const msgCode = fs.readFileSync('src/features/mimo/components/MimoChatMessage.tsx', 'utf-8');
    const timelineCode = fs.readFileSync('src/features/mimo/components/MimoExecutionTimeline.tsx', 'utf-8');

    assert.ok(serviceCode.includes('buildFlashLiteExecutionProtocolPrompt'), 'mimoGeminiService must invoke Flash-Lite protocol prompt');
    assert.ok(serviceCode.includes('onProtocolStage'), 'mimoGeminiService must emit protocol lifecycle stages');
    assert.ok(hookCode.includes("selectedModel === 'gemini-3.5-flash-lite'"), 'useMimoChatStream must scope timeline strictly to gemini-3.5-flash-lite');
    assert.ok(hookCode.includes('protocolTimeline'), 'useMimoChatStream must populate protocolTimeline');

    assert.ok(msgCode.includes('MimoExecutionTimeline'), 'MimoChatMessage must render MimoExecutionTimeline');
    assert.ok(!msgCode.includes('{showThinking && message.activity?.protocolTimeline'), 'Timeline must show for Flash-Lite even when showThinking is false');

    assert.ok(!timelineCode.includes('animate-ping'), 'Timeline must not use animate-ping');
    assert.ok(!timelineCode.includes('<Sparkles'), 'Timeline must not use decorative Sparkles icon');
    assert.ok(!timelineCode.includes('<Brain'), 'Timeline must not use decorative Brain icon');
  });

  it('keeps MimoUsage redesign and MimoQuotaRing minimal, flat, tabular-nums, and free of decorative icon bloat', () => {
    const ringCode = fs.readFileSync('src/features/mimo/components/MimoQuotaRing.tsx', 'utf-8');
    const popoverCode = fs.readFileSync('src/features/mimo/components/drawer/MimoSettingsPopover.tsx', 'utf-8');

    assert.ok(!ringCode.includes('animate-ping'), 'MimoQuotaRing must not use animate-ping');
    assert.ok(!ringCode.includes('<Key'), 'MimoQuotaRing must not render decorative Key icon');
    assert.ok(ringCode.includes('tabular-nums'), 'MimoQuotaRing should format numbers cleanly with tabular-nums');

    const usageIdx = popoverCode.indexOf('{activeTab === \'usage\' && (');
    assert.ok(usageIdx !== -1, 'Usage tab section must exist in MimoSettingsPopover');
    const usageSlice = popoverCode.slice(usageIdx);

    assert.ok(!usageSlice.includes('animate-ping'), 'Usage section must not use animate-ping');
    assert.ok(!usageSlice.includes('<Zap'), 'Usage section must not use decorative Zap icon');
    assert.ok(!usageSlice.includes('<Brain'), 'Usage section must not use decorative Brain icon');
    assert.ok(!usageSlice.includes('<BarChart3'), 'Usage section must not use decorative BarChart3 icon');
    assert.ok(!usageSlice.includes('<Sparkles'), 'Usage section must not use decorative Sparkles icon');
    assert.ok(usageSlice.includes('tabular-nums'), 'Usage metrics must use tabular-nums');
    assert.ok(popoverCode.includes('3.6 Flash'), 'Should maintain clean Gemini 3.6 Flash naming');
  });
});
