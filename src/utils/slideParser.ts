export interface SlideData {
  index: number;
  title: string;
  body: string;
  notes: string | null;
}

/**
 * Parses a markdown document into an array of presentation slides delimited by horizontal rules (--- or ***).
 */
export function parseSlides(markdown: string): SlideData[] {
  if (!markdown || !markdown.trim()) {
    return [
      {
        index: 0,
        title: 'Empty Presentation',
        body: '# Untitled Presentation\n\nStart writing markdown separated by `---` to create slides.',
        notes: null,
      },
    ];
  }

  // Remove frontmatter if present
  let cleanMarkdown = markdown;
  const frontmatterMatch = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (frontmatterMatch) {
    cleanMarkdown = markdown.slice(frontmatterMatch[0].length);
  }

  // Split on --- or *** or <!-- slide --> surrounded by newlines
  const rawSections = cleanMarkdown.split(/(?:^|\n)(?:---|---|\*\*\*|<!--\s*slide\s*-->)(?:\n|$)/);

  const slides: SlideData[] = [];

  for (let i = 0; i < rawSections.length; i++) {
    const rawSection = rawSections[i].trim();
    if (!rawSection && i > 0 && i === rawSections.length - 1) {
      continue; // Skip trailing empty slide
    }

    // Extract speaker notes: <!-- note: ... --> or <!-- speaker: ... -->
    let notes: string | null = null;
    const noteMatch = rawSection.match(/<!--\s*(?:note|speaker):\s*([\s\S]*?)-->/i);
    if (noteMatch) {
      notes = noteMatch[1].trim();
    }

    // Remove speaker notes comments from visible slide body
    const body = rawSection
      .replace(/<!--\s*(?:note|speaker):[\s\S]*?-->/gi, '')
      .trim();

    // Extract title from first heading (# ... or ## ...)
    const headingMatch = body.match(/^#{1,4}\s+(.+)$/m);
    const title = headingMatch ? headingMatch[1].trim() : `Slide ${slides.length + 1}`;

    slides.push({
      index: slides.length,
      title,
      body: body || '# Slide ' + (slides.length + 1),
      notes,
    });
  }

  return slides.length > 0
    ? slides
    : [
        {
          index: 0,
          title: 'Slide 1',
          body: cleanMarkdown,
          notes: null,
        },
      ];
}
