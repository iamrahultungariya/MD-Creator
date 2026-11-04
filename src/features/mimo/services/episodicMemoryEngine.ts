import { MimoMessage } from '../types/mimoTypes';

/**
 * Deterministic local-first extractive episodic summarizer.
 * Analyzes conversational turns and generates concise, high-density 1-sentence bullets
 * summarizing the key user requests and assistant decisions with ZERO API cost or latency.
 */
export function extractEpisodicBulletsLocally(messages: MimoMessage[]): string[] {
  const userAndAssistantTurns = messages.filter(
    (m) => m.text && m.text.trim().length > 0 && !m.id.startsWith('welcome-')
  );

  if (userAndAssistantTurns.length < 4) {
    return [];
  }

  const bullets: string[] = [];

  for (let i = 0; i < userAndAssistantTurns.length; i += 2) {
    const userMsg = userAndAssistantTurns[i];
    const asstMsg = userAndAssistantTurns[i + 1];

    if (!userMsg || userMsg.role !== 'user') continue;

    // Clean user query
    const rawUser = userMsg.text.trim().replace(/\n+/g, ' ');
    const userTopic =
      rawUser.length > 90 ? `${rawUser.slice(0, 85).trim()}...` : rawUser;

    let asstResolution = '';
    if (asstMsg && asstMsg.text) {
      if (asstMsg.diffHunk) {
        asstResolution = ` (proposed diff for ${asstMsg.diffHunk.lineRange ? `L${asstMsg.diffHunk.lineRange.start}-L${asstMsg.diffHunk.lineRange.end}` : 'active section'})`;
      } else if (asstMsg.clarification) {
        asstResolution = ' (prompted clarification options)';
      } else {
        // Extract first punchy sentence of assistant response
        const firstSentence = asstMsg.text.split(/(?<=[.?!])\s+/)[0]?.trim() || '';
        if (firstSentence && firstSentence.length > 10 && firstSentence.length < 100) {
          asstResolution = ` -> ${firstSentence.replace(/[*#`]/g, '')}`;
        }
      }
    }

    bullets.push(`• Discussed: "${userTopic}"${asstResolution}`);
  }

  // Keep up to 6 most informative episodic summary bullets
  return bullets.slice(-6);
}

/**
 * Checks if the message history is long enough to trigger episodic compression.
 */
export function shouldCompressEpisodicTurns(messages: MimoMessage[]): boolean {
  const meaningfulTurns = messages.filter(
    (m) => m.text && m.text.trim().length > 0 && !m.id.startsWith('welcome-')
  );
  return meaningfulTurns.length >= 6;
}

/**
 * Formats episodic memory bullets into a structured silent prompt layer.
 */
export function formatEpisodicMemoryPromptLayer(episodicBullets: string[]): string {
  if (!episodicBullets || episodicBullets.length === 0) return '';

  return `[Episodic Memory of Prior Discussion]
The following decisions, topics, and conclusions were established earlier in this conversation:
${episodicBullets.join('\n')}
(Keep these agreed facts and context in mind when answering the current turn).`;
}

/**
 * Generates an optimized, token-efficient history payload for Gemini API.
 * 
 * If episodic memory is present:
 * - Emits the consolidated episodic memory as a system/context prompt layer
 * - Only includes the last 3-4 raw conversational turns (recent exchange)
 * 
 * If no episodic memory:
 * - Emits the last 6 turns (truncated safely).
 */
export function buildTokenOptimizedHistory(
  history: MimoMessage[],
  episodicBullets: string[] = []
): {
  historyContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  episodicPromptLayer: string;
} {
  const meaningfulTurns = (history || []).filter(
    (m) => m.text && m.text.trim().length > 0 && !m.id.startsWith('welcome-')
  );

  const episodicPromptLayer = formatEpisodicMemoryPromptLayer(episodicBullets);

  // If we have episodic memory, only keep the last 3-4 turns to minimize tokens
  const turnsToKeep = episodicBullets.length > 0 ? 4 : 6;
  const recentSlice = meaningfulTurns.slice(-turnsToKeep);

  const historyContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of recentSlice) {
    const trimmed =
      msg.text.length > 600
        ? `${msg.text.slice(0, 600)}\n... [truncated for token economy]`
        : msg.text;

    historyContents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: trimmed }],
    });
  }

  return {
    historyContents,
    episodicPromptLayer,
  };
}
