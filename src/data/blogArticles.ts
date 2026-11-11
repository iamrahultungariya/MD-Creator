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

export const CATEGORIES: ('All' | BlogCategory)[] = [
  'All',
  'Engineering',
  'Productivity',
  'Guides',
  'Architecture',
  'Design'
];

export const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'art-katex-guide',
    title: 'The Complete Guide to KaTeX Math in Markdown: Inline, Blocks & Formulas',
    slug: 'katex-math-in-markdown-complete-guide',
    excerpt: 'Master mathematical typesetting in Markdown. Learn LaTeX syntax for equations, matrices, integrals, and avoid common currency symbol parsing traps.',
    category: 'Guides',
    readTime: '6 min read',
    date: 'Nov 4, 2026',
    featured: true,
    status: 'published',
    author: {
      name: 'Rahul Tungariya',
      role: 'Founder & Lead Architect',
      avatar: '/logo.png',
    },
    content: `# The Complete Guide to KaTeX Math in Markdown

Mathematical documentation is critical for machine learning researchers, physicists, computer science students, and engineers. While traditional LaTeX tools are heavy and slow, **KaTeX** brings sub-millisecond mathematical typesetting directly to modern Markdown editors.

## 1. Inline vs Display Math

In standard LaTeX notation within MD Writer:
- **Inline equations** use single dollar signs: \`$E = mc^2$\` renders as $E = mc^2$.
- **Display math blocks** use double dollar signs:
\`\`\`latex
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
\`\`\`

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 2. The Currency Symbol Trap ($50 and $100)

Many standard markdown parsers fail when writers discuss money:
> *"The subscription costs $20 for students and $50 for professionals."*

Naïve parsers assume \`$20 for students and $\` is an inline LaTeX equation! MD Writer's custom tokenizer isolates numerical currency mentions using lookahead regex, ensuring financial text remains pure text while mathematical expressions render perfectly.

## 3. Essential Formula Reference

### Fractions and Square Roots
\`\`\`latex
$$
f(x) = \\frac{a + b}{\\sqrt{c^2 + d^2}}
$$
\`\`\`

$$
f(x) = \\frac{a + b}{\\sqrt{c^2 + d^2}}
$$

### Sums, Products & Limits
\`\`\`latex
$$
\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}, \\quad \\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1
$$
\`\`\`

$$
\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}, \\quad \\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1
$$

### Linear Algebra & Matrices
\`\`\`latex
$$
\\mathbf{A} = \\begin{pmatrix}
a_{11} & a_{12} \\\\
a_{21} & a_{22}
\\end{pmatrix}
$$
\`\`\`

$$
\\mathbf{A} = \\begin{pmatrix}
a_{11} & a_{12} \\\\
a_{21} & a_{22}
\\end{pmatrix}
$$

## 4. Vector PDF & DOCX Export

When exporting via MD Writer's Studio Export suite, KaTeX formulas are converted directly into vector glyphs or native MathML equations, guaranteeing razor-sharp print quality without rasterization blur.`,
  },
  {
    id: 'art-local-first',
    title: 'Why Local-First Architecture Beats Cloud Vendor Lock-in for Developers',
    slug: 'why-local-first-markdown-architecture-wins',
    excerpt: 'Explore how IndexedDB, Dexie.js, and the File System Access API deliver zero-latency typing, 100% offline uptime, and absolute privacy sovereignty.',
    category: 'Architecture',
    readTime: '8 min read',
    date: 'Nov 8, 2026',
    featured: true,
    status: 'published',
    author: {
      name: 'Rahul Tungariya',
      role: 'Founder & Lead Architect',
      avatar: '/logo.png',
    },
    content: `# Why Local-First Architecture Beats Cloud Vendor Lock-in

For over a decade, SaaS applications forced a central cloud model: every keystroke round-trips over HTTPS to a remote database. If the server slows down or the airport Wi-Fi disconnects, your productivity freezes.

**Local-first software** flips this paradigm. Your personal computer or device is the primary source of truth; the cloud is merely an optional synchronization layer.

## The Pillars of Local-First Architecture

\`\`\`mermaid
flowchart TD
    User([Writer Keystroke]) --> CM[CodeMirror 6 Buffer]
    CM -->|Sub-10ms Atomic| IDB[(Browser IndexedDB)]
    CM -.->|Optional Ctrl+O| FS[Local Hard Drive .md]
    IDB -.->|Background WebSocket| Cloud[(Supabase PostgreSQL)]
\`\`\`

### 1. Instant 0ms Typing Latency
In MD Writer, note updates never wait for network ACKs. Every transaction executes atomically in memory and persists to browser IndexedDB in under 10 milliseconds via LZ-String delta compression.

### 2. File System Access API (Ctrl+O)
Through the W3C File System Access API, users can open entire local folders directly into MD Writer. Files remain raw \`.md\` files on your disk, version-controlled by your local Git repository.

### 3. Client-Side AI Privacy Shield
When pair-writing with Gemini 3.x (Mimo), sensitive lines marked with \`/private\` are redacted before API submission. You bring your own Google AI Studio key with zero middleman inspection.`,
  },
  {
    id: 'art-mermaid-guide',
    title: 'Mermaid.js Flowcharts, Architecture Maps, and Sequence Diagrams in Markdown',
    slug: 'mermaid-diagrams-markdown-cheatsheet',
    excerpt: 'Complete tutorial on rendering software architectures, sequence diagrams, and git graphs directly in Markdown using Mermaid 11.x.',
    category: 'Engineering',
    readTime: '5 min read',
    date: 'Nov 10, 2026',
    status: 'published',
    author: {
      name: 'Rahul Tungariya',
      role: 'Founder & Lead Architect',
      avatar: '/logo.png',
    },
    content: `# Mermaid.js Diagrams in Markdown: Complete Reference

Documenting distributed systems, state machines, and sequence workflows in pure code is dramatically faster than maintaining PNG diagrams in Figma. MD Writer includes native, client-side **Mermaid.js 11.x** rendering.

## 1. Flowcharts & Directional Graphs

\`\`\`mermaid
flowchart LR
    Client[Browser Client] -->|Encrypted HTTPS| Gateway[API Gateway]
    Gateway --> Auth[Auth Service]
    Gateway --> DB[(PostgreSQL)]
\`\`\`

Use \`flowchart TD\` for top-to-bottom or \`flowchart LR\` for left-to-right arrangements.

## 2. Sequence Diagrams

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Alice
    actor Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: I am doing well, thank you!
\`\`\`

## 3. State Diagrams

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> InReview: Submit
    InReview --> Approved: Pass QA
    InReview --> Draft: Request Changes
    Approved --> Published: Deploy
    Published --> [*]
\`\`\`

All diagrams scale infinitely as SVG vectors and export cleanly into print-ready PDFs.`,
  },
  {
    id: 'art-benchmark-comparison',
    title: 'MD Writer vs Obsidian vs Notion: The Clean Plain-Text Benchmark',
    slug: 'md-writer-vs-obsidian-vs-notion',
    excerpt: 'We measured cold boot times, memory footprint, telemetry requests, and LaTeX typesetting speed. Here is how modern Markdown studios compare.',
    category: 'Productivity',
    readTime: '7 min read',
    date: 'Nov 11, 2026',
    status: 'published',
    author: {
      name: 'Rahul Tungariya',
      role: 'Founder & Lead Architect',
      avatar: '/logo.png',
    },
    content: `# MD Writer vs Obsidian vs Notion: Speed Benchmark

Choosing a long-term note-taking environment determines your daily writing flow. We conducted reproducible cold-start benchmarks across three popular tools on a clean modern browser instance.

## Benchmark Matrix

| Dimension | MD Writer | Obsidian (Desktop) | Notion (Web) |
| :--- | :--- | :--- | :--- |
| **Cold Boot Latency** | **74ms** | 1,420ms (Electron) | 2,800ms (Heavy Cloud) |
| **Storage Architecture** | 100% Local IndexedDB | Local Markdown | Remote PostgreSQL |
| **Offline Capability** | Complete & Instant | Complete | Degraded / Partial |
| **LaTeX Math Engine** | Native KaTeX 0.18 | MathJax / Plugin | KaTeX Cloud Block |
| **AI Model Support** | Google Gemini 3.x BYOK | Plugins / Community | Closed SaaS ($10/mo) |
| **Cloud Sync Cost** | **Free / $49 Lifetime** | $4–$8/mo (Obsidian Sync) | $10–$20/mo |

## Key Takeaways

1. **Cold Boot Speed:** Browser-based local-first execution eliminates Electron runtime overhead, delivering sub-80ms startup times.
2. **Zero Vendor Lock-in:** MD Writer stores standard GitHub Flavored Markdown files. You can export or switch anytime with zero proprietary schema lock-in.`,
  },
];
