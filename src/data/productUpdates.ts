import React from 'react';
import { 
  Cpu, 
  Printer, 
  ListTree, 
  Cloud, 
  PenTool, 
  GitCommit, 
  Layers,
  Image as ImageIcon
} from 'lucide-react';

export type UpdateCategory = 'all' | 'engine' | 'publishing' | 'sync' | 'ux';

export interface UpdateMilestone {
  version: string;
  isLatest?: boolean;
  date: string;
  title: string;
  category: UpdateCategory;
  categoryLabel: string;
  summary: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  highlights: {
    type: 'new' | 'improved' | 'perf' | 'fix';
    text: string;
  }[];
}

export const MILESTONES: UpdateMilestone[] = [
  {
    version: 'v0.9.0 Beta',
    isLatest: true,
    date: 'October 2026',
    title: 'Minimalist Architecture, Interactive Community Reviews, Curated Visual Tools & Performance Focus',
    category: 'ux',
    categoryLabel: 'Refinement & Platform Polish',
    summary: 'A major release dedicated to purity, structural elegance, and essential workflows: introduced interactive community reviews, comprehensive editorial blog platform, refined MacBook workspace mockup, visual table & KaTeX studios, purged obsolete experimental modes (Zen, Typewriter, Canvas FX) for native typing responsiveness, and elevated overall design system to high-contrast modern minimalism.',
    icon: Layers,
    iconColor: 'text-neutral-900 dark:text-neutral-100',
    iconBg: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    highlights: [
      { type: 'new', text: 'Top 5 Community Reviews: Dynamic reviews showcase with verified author badges, star ratings, local persistence, and an interactive review submission studio.' },
      { type: 'new', text: 'Community Blog Platform: Multi-category publication hub supporting Engineering, Productivity, Guides, Architecture, and Design with reader modal and instant filtering.' },
      { type: 'improved', text: 'Pure Editor Performance: Purged experimental particle engines and extraneous modes to guarantee zero-latency 0ms raw typing canvas performance.' },
      { type: 'improved', text: 'Curated Slash Menu: Replaced cluttered prompt list with essential visual studios (KaTeX, Table Builder, Headings, Callouts, and Mermaid diagrams).' },
      { type: 'improved', text: 'Hero Laptop Mockup Overhaul: Pixel-perfect MacBook frame with calibrated camera notch, 4-blueprint studio tabs, and elimination of decorative SVG noise.' },
      { type: 'improved', text: 'Refined Subscription Architecture: Clean editorial launch initiative card replacing gradient noise, with zero external platform comparisons.' },
      { type: 'fix', text: 'Presentation Theme Contrast Isolation: Synchronized slide color modes directly with system theme transitions to guarantee crisp contrast across Nordic, Sepia, and Dark themes.' }
    ]
  },
  {
    version: 'v0.8.0 Beta',
    date: 'September 2026',
    title: 'Writing Mode Redesign, Floating Formatting Dock, Slash Menu Polish, Eye-Comfort Reader & Minimalist Aesthetics',
    category: 'ux',
    categoryLabel: 'Editor & Reader Architecture',
    summary: 'A transformative design and usability evolution: centered paper writing canvas with dimmed line numbers, floating formatting dock [B, I, S, </>, 🔗, ☰, 1., "], completely overhauled slash command engine with zero accidental triggers on enter/backspace, contrast-balanced eye-comfort reader themes (Warm Sepia & Nordic Slate), verified typography scaling (sm, base, lg, xl), genuinely differentiated reading column widths (576px, 896px, 1152px), and a unified minimalist palette free of distracting AI-slop colors and badges.',
    icon: ImageIcon,
    iconColor: 'text-neutral-700 dark:text-neutral-300',
    iconBg: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    highlights: [
      { type: 'new', text: 'Writing Mode Redesign & Floating Formatting Dock: Centered paper canvas with dimmed line numbers (1, 2, 3...) and a sleek floating formatting pill [B, I, S, </>, 🔗, ☰, 1., "] for instant text styling without focus loss.' },
      { type: 'fix', text: 'Slash Menu Interaction Overhaul: Fixed accidental triggers on Enter and Backspace; deleting / now dismisses the palette immediately, and natural newlines proceed cleanly without hijacking.' },
      { type: 'improved', text: 'Eye-Comfort Reader Themes & Table Contrast: Harmonized table borders and cell backgrounds for Warm Sepia and Nordic Slate, and synchronized Default mode with app light/dark theme.' },
      { type: 'improved', text: 'Proportional Reader Font Scaling: Explicit typography sizing system (.reader-size-sm through xl) guaranteeing instant font scaling across all markdown prose elements.' },
      { type: 'improved', text: 'Differentiated Reader Column Widths: Truly distinct layout profiles for Focused (576px editorial), Standard (896px article), and Wide (1152px expansive specs and tables).' },
      { type: 'improved', text: 'Purged "AI Slop" Visual Distractions: Stripped disparate carnival rainbow colors and sparkle star icons across headers, toolbars, and menus in favor of a timeless monochrome aesthetic.' },
      { type: 'new', text: 'Embed Image Studio (Offline + Web): Dual-tab image insertion dialog with client-side HTML5 Canvas bicubic downscaling, WebP conversion, and live size savings telemetry.' },
      { type: 'perf', text: 'Zero-Blocking Initial Render: Code-split non-critical dialogs and decoupled Rollup chunks into vendor-query, vendor-dexie, and vendor-supabase.' }
    ]
  },
  {
    version: 'v0.7.5',
    date: 'March 2026',
    title: 'Architecture Modularization, PWA Desktop & Mobile App, KaTeX Studio & Rich Visual Icons',
    category: 'engine',
    categoryLabel: 'Flagship Architecture',
    summary: 'A landmark platform release: total architectural decomposition with 0 monolithic files > 600 LOC, a 98.8% initial bundle reduction (31 kB entry), standalone PWA installability with 95 offline precached assets, a 20+ formula KaTeX studio, debounced 0ms Mermaid caching, and a rich visual icon engine on all platforms.',
    icon: Layers,
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-900/50',
    highlights: [
      { type: 'perf', text: '98.8% Bundle Size Reduction: Initial JavaScript chunk compressed from 2.56 MB down to 31.9 kB via fine-grained Rollup manualChunks and route-level code splitting.' },
      { type: 'perf', text: 'Zero Monoliths Architecture: Deconstructed 1,215 LOC EditorPage and 786 LOC ExportPdfModal into modular, highly testable sub-300 LOC micro-components and hooks.' },
      { type: 'new', text: 'Progressive Web App (PWA v1.3): Full standalone app experience for Chrome/Edge, Android, and iOS Safari with 95 precached assets for offline writing without network.' },
      { type: 'new', text: 'Rich Visual Icon Engine: Converts all Unicode symbols and shortcodes (:rocket:, :fire:, :sparkles:) into authentic, high-DPI 3D visual icons on all operating systems.' },
      { type: 'new', text: 'Predefined KaTeX Mathematical Studio: 20+ categorized formulas across Calculus, Linear Algebra, Physics, and Statistics with 1-click insert and live preview via /math.' },
      { type: 'new', text: 'Global Raycast Command Palette (Ctrl+K): Instant fuzzy document search, system actions, theme toggling, and math shortcuts.' },
      { type: 'improved', text: 'Zero-Lag Debounced Mermaid Studio: 350ms typing debounce and module-level in-memory SVG caching (0ms re-render) eliminating all keystroke lag and syntax flicker.' },
      { type: 'improved', text: 'High-Contrast Callout Alerts: Vibrant Obsidian/GitHub-style alerts for [!NOTE] (Blue), [!TIP] (Emerald), [!WARNING] (Amber), [!IMPORTANT] (Purple), and [!CAUTION] (Rose Red).' },
      { type: 'improved', text: 'Home Bottom Showcase Redesign: Pixel-perfect floating macOS editor window with 3D perspective tilt, interactive checklist syncing, and static elevation.' }
    ]
  },
  {
    version: 'v0.7.0',
    date: 'September 2026',
    title: 'High-Throughput Canvas Engine & Idempotent Cloud Sync',
    category: 'engine',
    categoryLabel: 'Performance & Engine',
    summary: 'A complete architectural rebuild of the writing effect pipeline. Replaced DOM particle rendering with a hardware-accelerated 2D canvas layer and persistent mirror singleton, eliminating all input lag during rapid typing.',
    icon: Cpu,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-900/50',
    highlights: [
      { type: 'perf', text: 'Hardware-Accelerated 2D Canvas Layer: Full-screen High-DPI canvas overlay with 0 DOM nodes mounted per keypress.' },
      { type: 'perf', text: 'Zero-Allocation Particle Pool: Pre-allocated pool of 256 particle structures, entirely eliminating Garbage Collection pauses.' },
      { type: 'perf', text: 'Persistent Mirror Singleton: Caret measurement now completes in < 0.05ms without adding/removing DOM elements or forcing synchronous reflows.' },
      { type: 'perf', text: 'Direct GPU-Composited Cursor: Visual carets positioned via direct translate3d transform, bypassing React render cycles for native 0ms typing latency.' },
      { type: 'new', text: 'Self-Sleeping RAF Loop: Animation loop automatically sleeps when particles fade, dropping CPU & GPU usage to 0.00% when idle.' },
      { type: 'fix', text: 'Idempotent Supabase SQL & Pre-signup Email Validation: Added checkEmailExists() and robust DROP POLICY IF EXISTS scripts to eliminate error 42710.' }
    ]
  },
  {
    version: 'v0.6.5',
    date: 'August 2026',
    title: 'PDF Publishing Studio v2 & Running Footer Geometry',
    category: 'publishing',
    categoryLabel: 'Vector Publishing',
    summary: 'Transformed document export into an isolated high-resolution vector publishing studio with curated typographic themes, standalone cover pages, auto TOC, and pinned running footers.',
    icon: Printer,
    iconColor: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-900/50',
    highlights: [
      { type: 'new', text: '5 Curated Typographic Presets: Editorial (Sans), Technical RFC (Mono), Academic (Serif), Corporate, and Swiss Minimalist.' },
      { type: 'new', text: 'Standalone Cover Pages & Table of Contents: Automatically extracts H1–H3 headings with dotted leader tabs.' },
      { type: 'fix', text: 'Pinned Footer Geometry: Screen preview and print engine updated with flexbox column layout and min-height 88vh to pin running footers firmly to page bottom.' },
      { type: 'improved', text: 'Isolated Print Engine: Renders through a hidden sandboxed iframe to preserve document-perfect print typography with 0 UI chrome.' }
    ]
  },
  {
    version: 'v0.6.0',
    date: 'July 2026',
    title: 'Interactive Outline Navigator & Centralized Safety Confirmation',
    category: 'ux',
    categoryLabel: 'UI & Safety',
    summary: 'Introduced the Document Outline drawer for effortless navigation across long-form documents, paired with a global promise-based confirmation system.',
    icon: ListTree,
    iconColor: 'text-purple-500 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-900/50',
    highlights: [
      { type: 'new', text: 'Real-time Outline Drawer: Parses # through ###### Markdown headings with hierarchy indentations and 1-click jump-to-line navigation.' },
      { type: 'new', text: 'Global Confirmation Architecture: Promise-based useConfirmStore modal with safety auto-focus on Cancel for destructive actions.' },
      { type: 'improved', text: 'Card Hover Physics: Smooth spring lift and elevation shadows on the library document grid.' },
      { type: 'new', text: 'Writing FX Studio Popover: Interactive effects playground with real-time typewriter loop demo and keystroke testing sandbox.' }
    ]
  },
  {
    version: 'v0.5.0',
    date: 'June 2026',
    title: 'Bi-Directional Supabase Cloud Sync & Multi-Device Hub',
    category: 'sync',
    categoryLabel: 'Cloud & Offline',
    summary: 'Bridges offline-first Dexie IndexedDB with real-time Supabase cloud sync, enabling seamless cross-device writing and instant recovery.',
    icon: Cloud,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-900/50',
    highlights: [
      { type: 'new', text: 'Inbound Cloud Pull: Automatically queries Supabase on startup to populate local Dexie with documents written on other devices.' },
      { type: 'new', text: 'Sync All Engine: Pushes offline drafts to Supabase in the background upon login or reconnect.' },
      { type: 'improved', text: 'Row-Level Security (RLS): All documents and revisions isolated per user_id with cryptographically verified auth tokens.' }
    ]
  },
  {
    version: 'v0.4.0',
    date: 'April 2026',
    title: 'Design System Overhaul, Slash Commands & Typewriter Mode',
    category: 'ux',
    categoryLabel: 'Core Experience',
    summary: 'A ground-up modern UI overhaul introducing keyboard-centric slash commands, vertical typewriter centering, and sprint interval timers.',
    icon: PenTool,
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-900/50',
    highlights: [
      { type: 'new', text: 'Slash Commands (/): Instant menu for headings, code blocks, checklists, quotes, and visual table builder.' },
      { type: 'new', text: 'Typewriter Scrolling: Centers the active line vertically so your gaze never drops to the bottom of the screen.' },
      { type: 'new', text: 'Focus Sprint Timer: 15, 25, and 45-minute writing sprint modes with live word velocity tracking.' },
      { type: 'improved', text: 'Tailwind CSS v4 & Framer Motion v13 Design Tokens: Pure modern minimalism with fluid dark mode.' }
    ]
  },
  {
    version: 'v0.1.0',
    date: 'January 2026',
    title: 'Foundational Release: The Offline-First Markdown Architecture',
    category: 'engine',
    categoryLabel: 'Foundation',
    summary: 'The original launch of MD Writer: instant offline persistence, KaTeX mathematical typesetting, and distraction-free writing modes.',
    icon: GitCommit,
    iconColor: 'text-neutral-500 dark:text-neutral-400',
    iconBg: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    highlights: [
      { type: 'new', text: 'Zero-Latency Dexie IndexedDB: Client-side database caching thousands of documents with instant search.' },
      { type: 'new', text: 'Split, Write, Read, & Zen Modes: Flexible workspaces adapting to drafting, reading, and pure flow.' },
      { type: 'new', text: 'KaTeX & Syntax Highlighting: Mathematical formulas and code syntax highlighting out of the box.' }
    ]
  }
];
