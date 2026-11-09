export interface ChangelogItem {
  type: 'added' | 'changed' | 'performance' | 'removed' | 'fixed';
  title: string;
  description: string;
  badge?: string;
}

export interface ChangelogRelease {
  version: string;
  versionLabel: string;
  date: string;
  title: string;
  summary: string;
  tag: 'Latest' | 'Stable' | 'Major';
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  items: ChangelogItem[];
}

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: '2.2.0',
    versionLabel: 'v2.2.0',
    date: 'November 9, 2026',
    title: 'Studio Craftsmanship, Anti-AI Slop UI & Mimo Preference Scoreboard',
    summary:
      'A comprehensive engineering overhaul eliminating decorative AI design tropes, purging unused font payloads, introducing modular route skeletons, and deploying an adaptive task preference scoreboard for Mimo.',
    tag: 'Latest',
    metrics: [
      { label: 'Cold-start payload cut', value: '-115 KB' },
      { label: 'Production build time', value: '39.1s' },
      { label: 'Slash menu icons', value: '0 (Pure text)' },
      { label: 'Cloud sync idle debounce', value: '10s' },
    ],
    items: [
      {
        type: 'performance',
        title: 'Purged Dead Web Font Requests',
        description:
          'Eliminated redundant Plus Jakarta Sans and Caveat font links from index.html. Standardized the entire application on Geist Sans for crisp UI controls and Geist Mono for code/tabular numbers.',
        badge: '-115 KB',
      },
      {
        type: 'changed',
        title: 'Universal Modular Route Skeletons',
        description:
          'Retired the 518-line 3D physics PageLoader. Replaced with lightweight, instant skeleton states tailored for each route (Home, Documents, Editor, Admin, Auth, Feedback), eliminating layout shifts and initial lag.',
        badge: 'Zero CLS',
      },
      {
        type: 'added',
        title: 'Mimo Task Preference Scoreboard',
        description:
          'Implemented a local-first Dexie IndexedDB system (mimo_task_scoreboard.md). Automatically tracks operation frequencies (summarization, tables, grammar polish) upon task completion with zero-token regex classification.',
        badge: 'Local-First',
      },
      {
        type: 'added',
        title: 'Supabase Scoreboard Sync & Atomic RPC',
        description:
          'Added public.mimo_task_scores table with GREATEST() conflict resolution. Features 10-second inactivity debounced push and cross-device hydration on login with strict Row Level Security (RLS).',
        badge: 'Postgres RPC',
      },
      {
        type: 'changed',
        title: 'Dynamic Row-Wise Suggestions (3 vs 2 Rule)',
        description:
          'Purged bulky 2-column cards and giant hero blocks from Mimo. Initial empty state now provides exactly 3 compact row-wise buttons based on document analysis, while active chat displays 2 contextual follow-up pills anchored above the dock.',
        badge: 'Ergonomic',
      },
      {
        type: 'removed',
        title: 'Decorative Icon Purge (Anti-AI Slop)',
        description:
          'Removed non-functional decorative icons from the Editor slash command menu and Mimo input dock. Replaced with high-contrast typography, category headers, and tactile keyboard shortcut tags.',
        badge: 'Studio UI',
      },
      {
        type: 'added',
        title: 'Mimo Text-Only Slash Quick Actions',
        description:
          'Introduced an inline / popover within Mimo prompt textarea supporting keyboard navigation (Arrow keys, Enter to execute, Escape to dismiss) for /summarize, /polish, /table, /compact, and /clean-md.',
        badge: 'Keyboard Fast',
      },
    ],
  },
  {
    version: '2.1.0',
    versionLabel: 'v2.1.0',
    date: 'October 31, 2026',
    title: 'Intelligent Clarification, Scoped AST Surgeon & Context Compaction',
    summary:
      'Introduced interactive clarification questions to eliminate ambiguous prompts, AST-based section edits, Mimo ambient sleeping states, and conversation memory compaction.',
    tag: 'Stable',
    metrics: [
      { label: 'Token savings on edits', value: 'Up to 80%' },
      { label: 'Inactivity auto-sleep', value: '30s' },
      { label: 'Chat turns per compaction', value: '14+ turns' },
    ],
    items: [
      {
        type: 'added',
        title: 'Interactive Clarification Cards',
        description:
          'Mimo automatically detects ambiguous requests and renders targeted multi-choice questions with 3 curated options plus a custom text field before generating output, eliminating guesswork.',
        badge: 'Zero Guesswork',
      },
      {
        type: 'added',
        title: 'AST Section Surgeon',
        description:
          'Scoped markdown transformer modifies only the active heading section without touching or re-generating the rest of your note, keeping document hierarchy intact and saving rewrite tokens.',
        badge: 'Token Saver',
      },
      {
        type: 'added',
        title: 'Mimo Ambient Sleep & Activity States',
        description:
          'Ambient 30-second inactivity auto-sleep mode with gentle breathing animation. Wakes up instantly on cursor hover or typing, with real-time mascot transitions (Thinking, Typing, Excited, Happy).',
        badge: 'Ambient AI',
      },
      {
        type: 'added',
        title: '/compact Conversational Compaction',
        description:
          'Executes high-density episodic memory extraction, distilling extended conversational turns into persistent summary bullets while resetting chat history footprint for maximum speed.',
        badge: 'Memory Engine',
      },
      {
        type: 'changed',
        title: 'Minimal Dual-Column Diff Viewer',
        description:
          'Redesigned line-numbered diff gutter inspired by GitHub and Linear. Soft emerald and rose inline tints for effortless review with one-click non-destructive diff application.',
        badge: 'Clean Diff',
      },
      {
        type: 'added',
        title: 'Anchored Dock Settings Popover',
        description:
          'Replaced modal dialogues with a tactile anchored popover on the input dock. Direct access to Thinking budget toggles and Google Search Grounding without blocking screen view.',
        badge: 'Anchored',
      },
    ],
  },
  {
    version: '2.0.0',
    versionLabel: 'v2.0.0',
    date: 'October 12, 2026',
    title: 'MD Writer 2.0 — Offline-First Engine, Supabase Realtime & Pure Gemini',
    summary:
      'The foundational 2.0 release delivering 100% free offline writing with Dexie IndexedDB local caching, Supabase Postgres cloud synchronization, pure Gemini BYOK streaming, and mathematical formula authoring.',
    tag: 'Major',
    metrics: [
      { label: 'Typing latency', value: '0 ms' },
      { label: 'Offline capacity', value: 'Unlimited' },
      { label: 'Gemini Models', value: '3.5 Lite, 3.5 & 3.8' },
    ],
    items: [
      {
        type: 'added',
        title: 'Dual-Layer Offline & Cloud Architecture',
        description:
          'Instant 0ms local reads and writes powered by Dexie IndexedDB. Background non-blocking sync to Supabase Postgres with offline queueing and cross-device reconciliation.',
        badge: 'Offline-First',
      },
      {
        type: 'added',
        title: 'Pure Gemini BYOK Streaming Integration',
        description:
          'Direct client-side streaming using the official @google/genai SDK. Zero intermediary backend hops, full rate limit transparency, and customizable reasoning depth (Auto, Low, Medium, High).',
        badge: 'Official SDK',
      },
      {
        type: 'added',
        title: 'KaTeX Math Studio & Formula Builder',
        description:
          'Integrated KaTeX math studio supporting inline math ($...$) and display formulas ($$...$$). Includes auto-shorthand conversion, matrix templates, and live visual preview.',
        badge: 'KaTeX Engine',
      },
      {
        type: 'added',
        title: 'Interactive Table Generator',
        description:
          'Visual spreadsheet-like table creator with paste-from-Excel support, automatic GFM alignment, and dynamic row/column insertion.',
        badge: 'GFM Tables',
      },
      {
        type: 'added',
        title: 'Cross-Device Deletion & Supabase Realtime',
        description:
          'Full replica identity broadcast synchronization across browser tabs and devices, ensuring soft-deletions and restores propagate instantly.',
        badge: 'Realtime Sync',
      },
      {
        type: 'added',
        title: 'Community Feedback & Moderation Hub',
        description:
          'Integrated bug reporting, feature suggestions, and sentiment tracking with administrative moderation panel and real-time status management.',
        badge: 'Community',
      },
    ],
  },
];
