export type BlogCategory = 'Engineering' | 'Productivity' | 'Guides' | 'Architecture' | 'Design';

export interface Article {
  id: string;
  user_id?: string | null;
  title: string;
  slug?: string;
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
  status: 'pending' | 'published' | 'rejected';
  submittedAt?: string;
  userEmail?: string;
}

export const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'default-art-1',
    title: 'Zero Latency Markdown: Building High Performance In-Browser Editors',
    slug: 'zero-latency-markdown-editor',
    excerpt: 'How CodeMirror 6, Web Workers, and Dexie IndexedDB combine to provide instantaneous 0ms typing feedback for technical writers.',
    category: 'Engineering',
    readTime: '4 min read',
    date: 'Sep 28, 2026',
    author: {
      name: 'Rahul (MD Writer Team)',
      role: 'Core Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    featured: true,
    status: 'published',
    content: `# Zero Latency Markdown: Building High Performance In-Browser Editors

When building MD Writer, our #1 design constraint was **zero typing latency**. Most modern rich-text editors degrade as documents scale beyond a few thousand words due to synchronous DOM recalculations.

Here is how we solved this problem using modern web technologies:

---

## 1. Asynchronous Web Worker Compilation
Instead of parsing Markdown, MathJax/KaTeX, and syntax highlighting on the browser main UI thread, we delegate AST token generation to an isolated Web Worker:

\`\`\`typescript
// markdown.worker.ts
self.onmessage = (event) => {
  const { markdown, id } = event.data;
  const parsedAST = parseMarkdownFast(markdown);
  self.postMessage({ id, parsedAST });
};
\`\`\`

## 2. Local-First Offline Resilience with Dexie IndexedDB
Every keystroke saves instantly to local browser IndexedDB using **Dexie.js**. This ensures that even during network drops or tab closures, your work is never lost:

- Instant writes without network waiting
- Background cloud sync to Supabase when online
- Conflict-free revision snapshots

---

## Conclusion
Modern web applications don't have to compromise on typing speed or safety. By keeping the main thread clean, technical writers enjoy instantaneous keystroke feedback!
`,
  },
  {
    id: 'default-art-2',
    title: 'Mastering KaTeX Mathematical Formulas in Technical Documentation',
    slug: 'mastering-katex-mathematical-formulas',
    excerpt: 'A comprehensive guide to rendering complex mathematical equations, physics symbols, and matrices with KaTeX in MD Writer.',
    category: 'Guides',
    readTime: '3 min read',
    date: 'Sep 26, 2026',
    author: {
      name: 'Sarah Chen',
      role: 'Research Contributor',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SarahChen',
    },
    featured: false,
    status: 'published',
    content: `# Mastering KaTeX Mathematical Formulas

MD Writer includes native support for **KaTeX**, the fastest mathematical typesetting library on the web.

---

## Inline Math vs. Display Math
Wrap expressions in single dollar signs for inline math: \`$E = mc^2$\`, or double dollar signs on their own line for prominent centered display math:

$$f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi$$

### Useful Formulas
- **Quadratic Formula**:
  $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

- **Matrices**:
  $$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$

Happy formula writing!
`,
  },
  {
    id: 'default-art-3',
    title: 'The Local-First Revolution: Why Writers Prefer Offline Storage',
    slug: 'local-first-revolution-offline-storage',
    excerpt: 'Exploring the architectural shift towards offline-first applications and how client storage safeguards your intellectual property.',
    category: 'Architecture',
    readTime: '5 min read',
    date: 'Sep 24, 2026',
    author: {
      name: 'Alex Rivera',
      role: 'Staff Engineer',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AlexRivera',
    },
    featured: false,
    status: 'published',
    content: `# The Local-First Revolution

Cloud-only note taking applications suffer from constant spinners, synchronization conflicts, and reliance on remote servers. 

**Local-first software** treats your device as the primary source of truth:
1. You own your raw data on disk.
2. The application works at full speed without an internet connection.
3. Cloud synchronization is an optional convenience layer, not a bottleneck.

---

MD Writer is built on these foundational principles. Your thoughts belong to you.
`,
  }
];

export const CATEGORIES: ('All' | BlogCategory)[] = [
  'All',
  'Engineering',
  'Productivity',
  'Guides',
  'Architecture',
  'Design'
];
