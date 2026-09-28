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

export type UpdateCategory = 'all' | 'publishing' | 'sync' | 'ux';

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
    version: 'v0.9.1 Beta',
    isLatest: true,
    date: 'October 2026',
    title: 'Streamlined Navigation, Active Mode Selector, Customizable Formatting Toolbar, Community Reviews & PDF Studio',
    category: 'ux',
    categoryLabel: 'Workflow & Refinement',
    summary: 'A major update focused on writing focus, personalized toolbar customization, and publishing tools: streamlined the top navbar with an Active Mode selector, added customizable floating toolbar preferences with drag-and-drop reordering, introduced community reviews with editorial moderation, history-aware back navigation, and high-fidelity multi-page print and PDF export.',
    icon: Layers,
    iconColor: 'text-neutral-900 dark:text-neutral-100',
    iconBg: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    highlights: [
      { type: 'new', text: 'Clean Orbital Loader: Minimalist geometric animation for smooth page transitions.' },
      { type: 'new', text: 'Active Mode Dropdown & Shortcuts: Instant switching between Split, Write, Read, and Present modes with Alt+M / Ctrl+M hotkeys.' },
      { type: 'new', text: 'Floating Formatting Dock Preferences: Full control to customize which tools appear in the cursor formatting pill, with live theme adaptation.' },
      { type: 'new', text: 'Drag-and-Drop Toolbar Reordering: Effortlessly rearrange quick formatting tools by dragging them with mouse or touch.' },
      { type: 'new', text: 'Community Reviews & Moderation Desk: Share your writing experience with ratings, post-submission edits, and verified editorial moderation.' },
      { type: 'improved', text: 'History-Aware Back Navigation: Back buttons in writing, presentation, and document views now seamlessly follow your browser history.' },
      { type: 'improved', text: 'Publication Print & Multi-Page PDF Studio: Fixed page break distribution, clean print mode without editor chrome, multi-page export, and direct PDF download.' },
      { type: 'improved', text: 'Publication Legal & Privacy Center: Clear, human-readable terms, privacy protections, and zero-tracking commitment.' }
    ]
  },
  {
    version: 'v0.9.0 Beta',
    isLatest: false,
    date: 'October 2026',
    title: 'Minimalist Design, Community Reviews, Curated Visual Tools & Writing Speed',
    category: 'ux',
    categoryLabel: 'Refinement & Platform Polish',
    summary: 'A major release dedicated to simplicity, clean design, and essential workflows: introduced community reviews, editorial publishing platform, refined laptop workspace preview, visual table & formula studios, and a distraction-free writing environment.',
    icon: Layers,
    iconColor: 'text-neutral-900 dark:text-neutral-100',
    iconBg: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    highlights: [
      { type: 'new', text: 'Top 5 Community Reviews: Dynamic reviews showcase with verified author badges, star ratings, local persistence, and an interactive review submission studio.' },
      { type: 'new', text: 'Community Blog Platform: Multi-category publication hub supporting Engineering, Productivity, Guides, Architecture, and Design with reader modal and instant filtering.' },
      { type: 'improved', text: 'Pure Editor Performance: Streamlined editor mechanics to guarantee instant, responsive typing feedback.' },
      { type: 'improved', text: 'Curated Slash Menu: Replaced cluttered prompt list with essential visual studios (Math Formulas, Table Builder, Headings, Callouts, and Mermaid diagrams).' },
      { type: 'improved', text: 'Hero Laptop Mockup Overhaul: Clean MacBook preview frame with studio blueprint tabs for quick discovery.' },
      { type: 'improved', text: 'Refined Subscription Details: Clean editorial plans and transparent pricing overview.' },
      { type: 'fix', text: 'Presentation Theme Contrast Isolation: Synchronized slide color modes directly with system theme transitions to guarantee crisp contrast across Nordic, Sepia, and Dark themes.' }
    ]
  },
  {
    version: 'v0.8.0 Beta',
    date: 'September 2026',
    title: 'Writing Mode Redesign, Floating Formatting Dock, Slash Menu Polish, Eye-Comfort Reader & Minimalist Aesthetics',
    category: 'ux',
    categoryLabel: 'Editor & Reader Architecture',
    summary: 'A transformative design and usability evolution: centered paper writing canvas with dimmed line numbers, floating formatting dock, overhauled slash command menu, contrast-balanced eye-comfort reader themes, verified typography scaling, and clean reading column widths.',
    icon: ImageIcon,
    iconColor: 'text-neutral-700 dark:text-neutral-300',
    iconBg: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    highlights: [
      { type: 'new', text: 'Writing Mode Redesign & Floating Formatting Dock: Centered paper canvas with dimmed line numbers (1, 2, 3...) and a sleek floating formatting pill for instant text styling without focus loss.' },
      { type: 'fix', text: 'Slash Menu Interaction Overhaul: Fixed accidental triggers on Enter and Backspace; deleting / now dismisses the palette immediately, and natural newlines proceed cleanly without hijacking.' },
      { type: 'improved', text: 'Eye-Comfort Reader Themes & Table Contrast: Harmonized table borders and cell backgrounds for Warm Sepia and Nordic Slate, and synchronized Default mode with app light/dark theme.' },
      { type: 'improved', text: 'Proportional Reader Font Scaling: Explicit typography sizing system guaranteeing instant font scaling across all markdown prose elements.' },
      { type: 'improved', text: 'Differentiated Reader Column Widths: Truly distinct layout profiles for Focused (editorial), Standard (article), and Wide (expansive specs and tables).' },
      { type: 'improved', text: 'Distraction-Free Visual Design: Refined monochromatic interface focusing entirely on content.' },
      { type: 'new', text: 'Embed Image Studio: Clean image insertion dialog with automatic compression and preview.' },
      { type: 'perf', text: 'Instant Document Loading: Optimized document loading ensures rapid opening and smooth editing.' }
    ]
  },
  {
    version: 'v0.7.5',
    date: 'March 2026',
    title: 'High-Speed Architecture, PWA App & KaTeX Math Studio',
    category: 'ux',
    categoryLabel: 'Speed & Architecture',
    summary: 'A landmark platform release: lightweight modular design with rapid loading, standalone PWA installability with offline writing support, a 20+ formula KaTeX studio, and rich visual icons across all platforms.',
    icon: Layers,
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-900/50',
    highlights: [
      { type: 'perf', text: 'Lightning-Fast Startup: Highly optimized bundle loading for instant cold starts and smooth page transitions.' },
      { type: 'perf', text: 'Smooth Editor Engine: Modular architecture ensuring zero typing lag across long-form documents.' },
      { type: 'new', text: 'Progressive Web App (PWA): Full standalone app experience for Chrome/Edge, Android, and iOS Safari with offline writing support.' },
      { type: 'new', text: 'Rich Visual Icon Engine: Converts Unicode symbols and shortcodes into authentic, high-DPI visual icons on all operating systems.' },
      { type: 'new', text: 'Predefined KaTeX Mathematical Studio: 20+ categorized formulas across Calculus, Linear Algebra, Physics, and Statistics with 1-click insert.' },
      { type: 'new', text: 'Global Command Palette (Ctrl+K): Instant fuzzy document search, system actions, theme toggling, and shortcuts.' },
      { type: 'improved', text: 'Zero-Lag Mermaid Diagrams: Instant preview caching and debounced rendering eliminating keystroke flicker.' },
      { type: 'improved', text: 'High-Contrast Callout Alerts: Clean alert boxes for Note, Tip, Warning, Important, and Caution.' },
      { type: 'improved', text: 'Home Workspace Showcase: Sleek interactive preview window highlighting live markdown editing.' }
    ]
  },
  {
    version: 'v0.7.0',
    date: 'September 2026',
    title: 'Typing Responsiveness & Reliable Cloud Synchronization',
    category: 'ux',
    categoryLabel: 'Performance & Sync',
    summary: 'A complete architectural rebuild of the text input pipeline. Optimized keystroke handling and cloud sync to eliminate typing latency and ensure rock-solid data integrity.',
    icon: Cpu,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-900/50',
    highlights: [
      { type: 'perf', text: 'Zero Typing Latency: Streamlined input rendering to guarantee instantaneous keystroke feedback even on complex documents.' },
      { type: 'perf', text: 'Fluid Cursor Tracking: Smooth, responsive caret movement that never lags during rapid writing.' },
      { type: 'perf', text: 'Efficient Memory Management: Optimized local state management for butter-smooth long-form editing sessions.' },
      { type: 'new', text: 'Battery & Resource Saver: Background rendering pauses automatically when idle, preserving laptop battery life.' },
      { type: 'fix', text: 'Reliable Cloud Backup: Enhanced session safety and seamless automatic synchronization across devices.' }
    ]
  },
  {
    version: 'v0.6.5',
    date: 'August 2026',
    title: 'PDF Publishing Studio v2 & Clean Print Typography',
    category: 'publishing',
    categoryLabel: 'Vector Publishing',
    summary: 'Transformed document export into an isolated high-resolution vector publishing studio with curated typographic themes, standalone cover pages, auto TOC, and pinned running footers.',
    icon: Printer,
    iconColor: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-900/50',
    highlights: [
      { type: 'new', text: '5 Curated Typographic Presets: Editorial (Sans), Technical RFC (Mono), Academic (Serif), Corporate, and Swiss Minimalist.' },
      { type: 'new', text: 'Standalone Cover Pages & Table of Contents: Automatically extracts H1–H3 headings with dotted leader tabs.' },
      { type: 'fix', text: 'Pinned Running Footers: Page numbers and document metadata stay neatly positioned at the bottom of printed sheets.' },
      { type: 'improved', text: 'Clean Print Mode: Automatically strips all editor buttons, sidebars, and menus when printing for publication-grade output.' }
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
    title: 'Cloud Synchronization & Multi-Device Writing',
    category: 'sync',
    categoryLabel: 'Cloud & Offline',
    summary: 'Combines offline-first local storage with real-time cloud synchronization, enabling seamless cross-device writing and instant recovery.',
    icon: Cloud,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-900/50',
    highlights: [
      { type: 'new', text: 'Automatic Multi-Device Sync: Open your notes on any computer or mobile browser and find your latest edits ready.' },
      { type: 'new', text: 'Offline-First Sync: Write freely without an internet connection; drafts sync automatically to the cloud whenever you reconnect.' },
      { type: 'improved', text: 'Private & Encrypted Storage: Every document is strictly isolated and accessible only to your authenticated account.' }
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
    category: 'sync',
    categoryLabel: 'Foundation & Offline',
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
