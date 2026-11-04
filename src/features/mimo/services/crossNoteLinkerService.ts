import { db, getDocumentContent } from '../../../db';

export interface CrossNoteFinding {
  id: string;
  type: 'link_suggestion' | 'fact_check';
  targetDocId: string;
  targetDocTitle: string;
  matchedText: string;
  suggestedLink?: string;
  explanation: string;
  lineContext?: string;
}

export interface CrossNoteReport {
  totalDocsScanned: number;
  findings: CrossNoteFinding[];
  scannedAt: number;
}

const GENERIC_TITLES = new Set([
  'untitled',
  'untitled document',
  'new document',
  'notes',
  'draft',
  'test',
  'readme',
  'index',
]);

/**
 * Scans local IndexedDB vault to find unlinked mentions of other notes
 * and potential numerical or parameter contradictions.
 */
export async function generateCrossNoteReport(
  currentDocId: string,
  currentContent: string
): Promise<CrossNoteReport> {
  const findings: CrossNoteFinding[] = [];

  try {
    const allDocs = await db.documents.toArray();
    const vaultDocs = allDocs.filter(
      (doc) => doc.id !== currentDocId && !doc.isDeleted && !doc.isAiExcluded
    );

    if (vaultDocs.length === 0 || !currentContent.trim()) {
      return { totalDocsScanned: 0, findings: [], scannedAt: Date.now() };
    }

    const lines = currentContent.split('\n');

    // 1. Scan for unlinked document title mentions
    for (const doc of vaultDocs) {
      const cleanTitle = (doc.title || '').trim();
      const lowerTitle = cleanTitle.toLowerCase();

      if (cleanTitle.length < 3 || GENERIC_TITLES.has(lowerTitle)) {
        continue;
      }

      // Check if title is already wiki-linked or markdown-linked in current doc
      const alreadyLinkedRegex = new RegExp(
        `\\[\\[${escapeRegex(cleanTitle)}\\]\\]|\\[[^\\]]*\\]\\([^)]*${escapeRegex(doc.id)}[^)]*\\)`,
        'i'
      );
      if (alreadyLinkedRegex.test(currentContent)) {
        continue;
      }

      // Check if unlinked phrase exists in current doc lines
      const titleRegex = new RegExp(`\\b${escapeRegex(cleanTitle)}\\b`, 'i');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (titleRegex.test(line) && !line.includes(`[[${cleanTitle}]]`)) {
          findings.push({
            id: `link-${doc.id}-${i}`,
            type: 'link_suggestion',
            targetDocId: doc.id,
            targetDocTitle: cleanTitle,
            matchedText: cleanTitle,
            suggestedLink: `[[${cleanTitle}]]`,
            explanation: `Found mention of "${cleanTitle}". Link this reference to connect your vault graph.`,
            lineContext: line.trim().slice(0, 100),
          });
          break; // One link suggestion per document
        }
      }
    }

    // 2. Scan for parameter and numerical contradictions against top recent vault docs
    const recentCandidates = vaultDocs.slice(0, 8);
    for (const doc of recentCandidates) {
      let otherContent = '';
      try {
        otherContent = await getDocumentContent(doc.id);
      } catch {
        const cached = await db.document_cache.get(doc.id);
        otherContent = cached?.content || '';
      }

      if (!otherContent) continue;

      const contradictions = detectMetricContradictions(
        doc.id,
        doc.title || 'Untitled',
        currentContent,
        otherContent
      );
      findings.push(...contradictions);
    }

    return {
      totalDocsScanned: vaultDocs.length,
      findings: findings.slice(0, 8), // Keep top 8 high-impact findings
      scannedAt: Date.now(),
    };
  } catch (err) {
    console.error('[crossNoteLinkerService] Scan failed:', err);
    return {
      totalDocsScanned: 0,
      findings: [],
      scannedAt: Date.now(),
    };
  }
}

/**
 * Detects divergent parameters (rate limits, timeouts, ports, versions) across notes.
 */
function detectMetricContradictions(
  targetDocId: string,
  targetDocTitle: string,
  currentDoc: string,
  vaultDoc: string
): CrossNoteFinding[] {
  const findings: CrossNoteFinding[] = [];

  const patterns = [
    {
      name: 'Rate Limit',
      regex: /(?:rate\s*limit|limit)\s*[:=is\s]*(\d+[\w/]*)/i,
    },
    {
      name: 'Port',
      regex: /(?:port|localhost)\s*[:=is\s]*(\d{3,5})/i,
    },
    {
      name: 'Timeout',
      regex: /(?:timeout|ttl)\s*[:=is\s]*(\d+\s*(?:ms|s|sec|min))/i,
    },
    {
      name: 'Version Target',
      regex: /(?:target\s*version|version|release)\s*[:=is\s]*(v?\d+\.\d+(?:\.\d+)?)/i,
    },
  ];

  for (const { name, regex } of patterns) {
    const curMatch = currentDoc.match(regex);
    const vaultMatch = vaultDoc.match(regex);

    if (curMatch && vaultMatch) {
      const curVal = curMatch[1].trim().toLowerCase();
      const vaultVal = vaultMatch[1].trim().toLowerCase();

      if (curVal !== vaultVal) {
        findings.push({
          id: `contra-${targetDocId}-${name.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'fact_check',
          targetDocId,
          targetDocTitle,
          matchedText: curMatch[0].trim(),
          explanation: `Parameter divergence for "${name}": Current document specifies "${curVal}", but "${targetDocTitle}" specifies "${vaultVal}".`,
          lineContext: curMatch[0].trim(),
        });
      }
    }
  }

  return findings;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
