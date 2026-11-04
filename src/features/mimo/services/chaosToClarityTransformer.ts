/**
 * Chaos-to-Clarity Brain-Dump Transformer
 * 
 * Transforms messy thoughts, meeting notes, half-sentences, or Hinglish brain-dumps
 * into publication-grade, structured Markdown documents with:
 * - 📌 Executive Summary (TL;DR)
 * - 🏗️ Categorized Sections & Headings (H2/H3)
 * - 📋 Action Items with `- [ ]` Checkboxes
 * - 💡 Key Decisions & Takeaways
 * - ❓ Open Questions / Blockers
 */

export const CHAOS_TO_CLARITY_SYSTEM_DIRECTIVE = `You are Mimo's "Chaos-to-Clarity" Brain-Dump Synthesizer.
Your mission is to take messy, unorganized raw notes, Hinglish brainstorms, half-broken sentences, or meeting fragments, and transform them into a publication-grade, pristine structured Markdown document.

Strict Transformation Rules:
1. ZERO LOSS OF TRUTH:
   - Do NOT omit any technical detail, requirement, name, deadline, number, or constraint mentioned in the user's raw dump.
   - If something was in Hinglish (e.g. "auth mein JWT use karenge par refresh token IndexedDB mein mat daalna"), translate the idea cleanly into professional technical English (or natural bilingual format if requested) without altering the technical constraint.
2. PUBLICATION-GRADE STRUCTURE:
   Format the output into this canonical hierarchy:
   # [Synthesized Document Title]

   ## 📌 Executive Summary
   A 2-3 sentence high-impact summary of the document's purpose, key goals, and current status.

   ## 🏗️ Core Themes & Breakdown
   Group scattered raw points into 2 to 4 logical themed sections with H3 sub-headings, tables, or callouts where helpful.

   ## 📋 Action Items & Ownership
   Convert all tasks, to-dos, and implied next steps into clear markdown checkboxes:
   - [ ] [Task description with assignee or deadline if mentioned]

   ## 💡 Key Decisions Made
   Explicitly record choices, architectural decisions, and finalized parameters.

   ## ❓ Open Questions & Blockers
   Highlight any ambiguities or unresolved questions found in the raw notes so the author can address them.
3. OUTPUT FORMAT:
   - Provide the complete synthesized markdown ready for insertion or replacement.`;

/**
 * Builds a prompt for turning a brain dump into structured clarity.
 */
export function buildChaosToClarityPrompt(rawInput: string, hasSelection: boolean): string {
  const contextSubject = hasSelection ? 'this selected brain-dump excerpt' : 'this entire raw document';
  return `Transform ${contextSubject} using your Chaos-to-Clarity engine into a clean, structured Markdown hierarchy with Executive Summary, Themed Headings, Action Items (- [ ]), Key Decisions, and Open Questions:\n\n"""\n${rawInput.trim()}\n"""`;
}

/**
 * Deterministic offline fallback transformer.
 * If user is completely offline or no API is connected, this parser organizes
 * raw lines into structured sections locally with zero API cost.
 */
export function transformChaosLocally(rawText: string): string {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return '# Blank Document\n\nNo content to transform.';

  const actionItems: string[] = [];
  const questions: string[] = [];
  const regularPoints: string[] = [];

  const todoKeywords = ['todo', 'fix', 'add', 'need to', 'karna hai', 'bana', 'implement', 'update', 'test'];
  const questionKeywords = ['?', 'kyu', 'why', 'how', 'kya', 'check if', 'wondering'];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isTodo = todoKeywords.some((k) => lower.includes(k));
    const isQuestion = questionKeywords.some((k) => lower.includes(k));

    if (isTodo) {
      actionItems.push(`- [ ] ${line.replace(/^[-*•\d.]+\s*/, '')}`);
    } else if (isQuestion) {
      questions.push(`- ❓ ${line.replace(/^[-*•\d.]+\s*/, '')}`);
    } else {
      regularPoints.push(`- ${line.replace(/^[-*•\d.]+\s*/, '')}`);
    }
  }

  const title = lines[0].replace(/^#+\s*/, '').replace(/[-*•]/g, '').slice(0, 50) || 'Synthesized Document';

  return `# ${title}

## 📌 Executive Summary
Synthesized from raw notes (${lines.length} lines analyzed). Captures key ideas, planned action items, and open discussion points.

## 🏗️ Core Notes & Points
${regularPoints.length > 0 ? regularPoints.join('\n') : '- (All raw items categorized into Action Items or Questions below)'}

## 📋 Action Items
${actionItems.length > 0 ? actionItems.join('\n') : '- [ ] Review notes and define immediate milestones'}

## ❓ Open Questions & Clarifications
${questions.length > 0 ? questions.join('\n') : '- No immediate blockers identified in raw dump.'}
`;
}
