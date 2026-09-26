export type BlogCategory = 'Engineering' | 'Productivity' | 'Guides' | 'Architecture' | 'Design';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featured?: boolean;
  content: string;
  isUserCreated?: boolean;
}

export const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'local-first-future',
    title: 'Why Local-First Architecture with Dexie.js and Supabase is the Future of Note-Taking',
    excerpt: 'Cloud-only tools feel sluggish when connections drop. Here is how combining browser IndexedDB with PostgreSQL background sync provides instantaneous writing with bulletproof backup.',
    category: 'Architecture',
    readTime: '8 min read',
    date: 'Sep 2, 2026',
    featured: true,
    author: {
      name: 'Rahul Mehta',
      role: 'Founding Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    content: `# Why Local-First Architecture is the Future of Note-Taking

Note-taking is one of the most intimate, low-latency creative activities you do on a computer. When inspiration strikes, waiting even 400 milliseconds for a network spinner creates cognitive friction that disrupts flow state.

## The Problem with Cloud-Only Software
Most modern document editors make a round-trip network request on every keystroke:
1. Client makes network call to centralized API
2. Database writes are throttled or queued
3. If Wi-Fi drops, document locking fails

## The Local-First Pattern in MD Writer
Instead of treating local storage as an afterthought, MD Writer treats **IndexedDB via Dexie.js as the primary source of truth**:

\`\`\`typescript
// Every keystroke saves instantly to local Dexie IndexedDB
await db.documents.put({
  id: docId,
  title,
  snippet: content.slice(0, 180),
  updatedAt: Date.now()
});
\`\`\`

### Key Benefits:
- **0 ms Latency**: Typing never lags, even on high-refresh 120Hz displays.
- **100% Offline**: Open your laptop on an airplane or train and keep writing.
- **Background Cloud Sync**: When connected, changes automatically replicate to Supabase PostgreSQL without blocking user input.
`
  },
  {
    id: 'katex-math-guide',
    title: 'Mastering LaTeX Math and KaTeX in Technical Documentation',
    excerpt: 'From inline physics notations to multi-line matrix algebra, learn how to embed clean mathematical formulas effortlessly into your markdown.',
    category: 'Engineering',
    readTime: '6 min read',
    date: 'Aug 28, 2026',
    author: {
      name: 'Elena Rostova',
      role: 'Open Source Maintainer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    content: `# Mastering LaTeX Math and KaTeX in Technical Documentation

Technical writing frequently demands precision that standard ASCII characters cannot express. With KaTeX integration, MD Writer renders complex LaTeX equations instantly in the live preview.

## Inline Math
Surround equations with single dollar signs: '$E = mc^2$' or '$\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J}$'.

## Block Math
Use double dollar signs for standalone equation blocks:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Matrix Notation
$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix}
d & -b \\\\
-c & a
\\end{pmatrix}
$$
`
  },
  {
    id: 'distraction-free-writing',
    title: 'The Distraction-Free Flow State: Clean Canvas & Minimalist Writing',
    excerpt: 'How centered paper margins, proportional typography, and keyboard shortcuts stimulate uninterrupted creative momentum.',
    category: 'Productivity',
    readTime: '5 min read',
    date: 'Aug 22, 2026',
    author: {
      name: 'David Chen',
      role: 'Technical Writer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    content: `# The Distraction-Free Flow State

Cognitive psychology research shows that visual clutter inside an application drains subconscious working memory.

## What Minimalist Architecture Eliminates
- Unnecessary sidebar navigations
- Persistent blinking counters and status meters
- Multiple panes competing for visual dominance

## Entering the Zone
In MD Writer, Writing Mode centers your typography into an optimal reading width (65-75 characters per line), with subtle line numbers and 0ms typing response.
`
  },
  {
    id: 'markdown-shortcuts-cheatsheet',
    title: 'Markdown Cheat Sheet: From Tables to Task Lists and Callouts',
    excerpt: 'The complete visual reference for formatting GitHub Flavored Markdown (GFM) with speed and elegance.',
    category: 'Guides',
    readTime: '4 min read',
    date: 'Aug 15, 2026',
    author: {
      name: 'Elena Rostova',
      role: 'Open Source Maintainer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    content: `# Markdown Cheat Sheet & Shortcuts

Markdown is the lingua franca of technical communication. Here is the fast track to utilizing all GFM features.

## Task Checklists
Interactive checkboxes allow you to track todos directly inside your preview:
- [x] Create project repository
- [x] Configure Tailwind custom tokens
- [ ] Review documentation spec

## Callout Quotes
> **Important Note**
> Blockquotes provide visual emphasis for key takeaways and architectural warnings.

## Formatted Tables
| Feature | Supported | Latency |
| :--- | :--- | :--- |
| IndexedDB | Yes | < 2ms |
| Supabase | Yes | Cloud |
| KaTeX | Yes | Instant |
`
  },
  {
    id: 'senior-typography-ui',
    title: 'Senior UI/UX for Note Taking: Why Typography and Contrast Matter',
    excerpt: 'An inside look at color theory, font hierarchy, and accessibility guidelines that make text effortless to read in both Light and Dark mode.',
    category: 'Design',
    readTime: '5 min read',
    date: 'Aug 08, 2026',
    author: {
      name: 'Rahul Mehta',
      role: 'Founding Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    content: `# Senior UI/UX for Note Taking

A great writing application should feel like high-grade stationery: quiet, dependable, and aesthetically inspiring.

## Visual Hierarchy
1. **Headings**: Plus Jakarta Sans with distinct font weight hierarchy (900 -> 700 -> 600).
2. **Body**: Inter for maximum legibility at 14px-16px sizes.
3. **Monospace**: JetBrains Mono for code blocks and raw markdown syntax.

## Theme Contrast Standards
In light mode, pure '#000000' text on pure '#ffffff' causes eye strain during long writing sessions. MD Writer uses balanced neutral tones on a soft paper tint for sustained comfort.
`
  },
  {
    id: 'publication-grade-pdf',
    title: 'How to Turn Markdown into Publication-Grade Print PDFs',
    excerpt: 'How our specialized print media stylesheet strips UI chrome, balances page breaks, and outputs pristine A4 documents.',
    category: 'Guides',
    readTime: '6 min read',
    date: 'Aug 01, 2026',
    author: {
      name: 'David Chen',
      role: 'Technical Writer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    content: `# Publication-Grade Print PDFs

Exporting Markdown usually results in awkward web page screenshots with cut-off lines and header bars.

## Print CSS Architecture
MD Writer implements an isolated \`@media print\` stylesheet:
- Forces pure white paper background regardless of active dark mode.
- Injects smart \`break-inside: avoid\` rules on tables, figures, and code blocks.
- Hides status bars, navigation menus, and editing toolbars.
`
  }
];

export const CATEGORIES: ('All' | BlogCategory)[] = ['All', 'Engineering', 'Productivity', 'Guides', 'Architecture', 'Design'];
export const LOCAL_STORAGE_KEY = 'md_writer_custom_articles';
