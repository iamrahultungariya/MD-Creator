export interface SampleDoc {
  id: string;
  title: string;
  badge: string;
  folder: string;
  status: string;
  content: string;
}

export const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'quickstart',
    title: 'QuickStart.md',
    badge: 'Spec',
    folder: 'Product Specs',
    status: 'Synced',
    content: `# ⚡ Fast Markdown Studio

Turn ideas into publication-ready PDFs with **instant local-first rendering**.

> [!TIP]
> Try typing directly in this editor or click the task checkboxes below!

### Interactive Checklist
- [x] Instant client-side IndexedDB cache
- [x] Real-time GitHub alert callouts
- [ ] Live Mermaid.js system architecture
- [ ] Vector PDF export with custom typography & cover pages

> [!NOTE]
> All changes are stored 100% offline in client-side IndexedDB.`
  },
  {
    id: 'architecture',
    title: 'SystemFlow.md',
    badge: 'Diagram',
    folder: 'Architecture',
    status: 'Verified',
    content: `# 🏛️ Dual-Engine Architecture

Zero-latency input with seamless cloud persistence.

\`\`\`mermaid
flowchart LR
    A[⌨️ Keystroke (0ms)] --> B[(IndexedDB Cache)]
    B --> C{Online?}
    C -->|Yes| D[☁️ Cloud Sync]
    C -->|No| E[📦 Local Store]
\`\`\`

> [!IMPORTANT]
> IndexedDB guarantees **0ms read/write latency** even during completely offline work.`
  }
];

export type ViewMode = 'split' | 'code' | 'preview';
export type SideTab = 'write' | 'organize' | 'create' | 'export';

export interface SparkParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export const SPARK_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#a855f7'];

export const QUICK_SNIPPETS = [
  { label: 'Alert Tip', snippet: '> [!TIP]\n> 🚀 Instant 0ms response time with 60FPS particle engine!' },
  { label: 'Mermaid Flow', snippet: '```mermaid\ngraph TD\n  A[Code] --> B(Product)\n```' },
  { label: 'Checklist Item', snippet: '- [ ] New milestone item' },
  { label: 'Math Formula', snippet: '$$E = mc^2$$' }
];
