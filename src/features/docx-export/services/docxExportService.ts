/**
 * High-Performance Dynamic Word (.docx) Export Service
 * Lazy-loads the docx engine only on-demand, preserving 0kB bundle overhead on initial page load.
 */

export interface DocxExportOptions {
  title: string;
  markdownContent: string;
  authorName?: string;
}

/**
 * Parses inline formatting (bold, italic, inline code) into docx TextRuns.
 */
function parseInlineRuns(text: string, TextRunClass: any): any[] {
  const runs: any[] = [];
  // Tokenize bold (**text**), italic (*text*), inline code (`text`), and plain text
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|[^*`]+)/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const segment = match[0];
    if (segment.startsWith('**') && segment.endsWith('**') && segment.length >= 4) {
      runs.push(
        new TextRunClass({
          text: segment.slice(2, -2),
          bold: true,
          font: 'Calibri',
          size: 24, // 12pt
        })
      );
    } else if (segment.startsWith('*') && segment.endsWith('*') && segment.length >= 2) {
      runs.push(
        new TextRunClass({
          text: segment.slice(1, -1),
          italics: true,
          font: 'Calibri',
          size: 24,
        })
      );
    } else if (segment.startsWith('`') && segment.endsWith('`') && segment.length >= 2) {
      runs.push(
        new TextRunClass({
          text: segment.slice(1, -1),
          font: 'Consolas',
          size: 21,
          shading: {
            fill: 'F1F5F9',
          },
        })
      );
    } else {
      runs.push(
        new TextRunClass({
          text: segment,
          font: 'Calibri',
          size: 24,
        })
      );
    }
  }

  if (runs.length === 0) {
    runs.push(new TextRunClass({ text, font: 'Calibri', size: 24 }));
  }

  return runs;
}

/**
 * Exports markdown text to a genuine Microsoft Word (.docx) document.
 */
export async function exportMarkdownToDocx(options: DocxExportOptions): Promise<void> {
  const { title, markdownContent, authorName = 'MD Writer' } = options;

  // 1. Dynamically import 'docx' only when requested
  const {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    BorderStyle,
    WidthType,
    Packer,
  } = await import('docx');

  const children: any[] = [];

  // Title & Metadata
  const cleanTitle = title.replace(/\.md$/i, '');
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: cleanTitle,
          bold: true,
          font: 'Calibri',
          size: 48, // 24pt
          color: '0F172A',
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `Authored with MD Writer  •  ${new Date().toLocaleDateString()}`,
          italics: true,
          font: 'Calibri',
          size: 20, // 10pt
          color: '64748B',
        }),
      ],
    })
  );

  // Parse lines
  const lines = markdownContent.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      i++;
      continue;
    }

    // Frontmatter skip
    if (i === 0 && trimmed.startsWith('---')) {
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('---')) {
        i++;
      }
      i++;
      continue;
    }

    // Code Blocks (```)
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: 'F8FAFC' },
                  margins: { top: 160, bottom: 160, left: 240, right: 240 },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                    left: { style: BorderStyle.SINGLE, size: 4, color: '3B82F6' },
                    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                  },
                  children: codeLines.map(
                    (cl) =>
                      new Paragraph({
                        spacing: { line: 240, after: 40 },
                        children: [
                          new TextRun({
                            text: cl || ' ',
                            font: 'Consolas',
                            size: 19, // 9.5pt
                            color: '1E293B',
                          }),
                        ],
                      })
                  ),
                }),
              ],
            }),
          ],
        })
      );
      continue;
    }

    // Tables (| col | col |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const rows: any[] = [];
        tableLines.forEach((tLine, rIndex) => {
          // Skip delimiter row (e.g. |---|---|)
          if (/^\|[\s\-:|]+\|$/.test(tLine)) return;

          const cells = tLine
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());

          const isHeader = rIndex === 0;
          rows.push(
            new TableRow({
              tableHeader: isHeader,
              children: cells.map(
                (cellText) =>
                  new TableCell({
                    shading: isHeader ? { fill: 'F1F5F9' } : undefined,
                    margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                      left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                      right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                    },
                    children: [
                      new Paragraph({
                        children: parseInlineRuns(cellText, TextRun),
                      }),
                    ],
                  })
              ),
            })
          );
        });

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          })
        );
      }
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 140 },
          children: parseInlineRuns(trimmed.slice(2), TextRun),
        })
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 120 },
          children: parseInlineRuns(trimmed.slice(3), TextRun),
        })
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 220, after: 100 },
          children: parseInlineRuns(trimmed.slice(4), TextRun),
        })
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 180, after: 80 },
          children: parseInlineRuns(trimmed.slice(5), TextRun),
        })
      );
      i++;
      continue;
    }

    // Blockquotes & Callouts
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.replace(/^>\s*(\[![\w]+\]\s*)?/, '');
      children.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { before: 140, after: 140 },
          children: [
            new TextRun({
              text: '▌ ',
              bold: true,
              color: '3B82F6',
              font: 'Calibri',
            }),
            ...parseInlineRuns(quoteText, TextRun),
          ],
        })
      );
      i++;
      continue;
    }

    // Unordered / Bullet Lists & Task Lists
    const bulletMatch = trimmed.match(/^[-*+]\s+(?:\[([ xX])\]\s+)?(.*)$/);
    if (bulletMatch) {
      const isTask = Boolean(bulletMatch[1] !== undefined);
      const isChecked = isTask && bulletMatch[1].toLowerCase() === 'x';
      const text = bulletMatch[2];

      children.push(
        new Paragraph({
          bullet: isTask ? undefined : { level: 0 },
          indent: isTask ? { left: 360 } : undefined,
          spacing: { after: 80 },
          children: isTask
            ? [
                new TextRun({
                  text: isChecked ? '☑ ' : '☐ ',
                  font: 'Segoe UI Symbol',
                  size: 24,
                  bold: true,
                }),
                ...parseInlineRuns(text, TextRun),
              ]
            : parseInlineRuns(text, TextRun),
        })
      );
      i++;
      continue;
    }

    // Numbered Lists
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const text = numberedMatch[2];

      children.push(
        new Paragraph({
          indent: { left: 360 },
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${num}.  `,
              font: 'Calibri',
              bold: true,
            }),
            ...parseInlineRuns(text, TextRun),
          ],
        })
      );
      i++;
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 200 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
          },
          children: [],
        })
      );
      i++;
      continue;
    }

    // Regular Paragraph
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: parseInlineRuns(trimmed, TextRun),
      })
    );
    i++;
  }

  // 2. Build Document
  const doc = new Document({
    creator: authorName,
    title: cleanTitle,
    description: 'Generated by MD Writer',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (1440 twips)
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  // 3. Generate Blob and Trigger File Download
  const blob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${cleanTitle}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);
}

/**
 * Shorthand helper for exportMarkdownToDocx.
 */
export async function exportToDocx(
  title: string,
  markdownContent: string,
  authorName?: string
): Promise<void> {
  return exportMarkdownToDocx({ title, markdownContent, authorName });
}
