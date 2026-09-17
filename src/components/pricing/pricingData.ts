export interface ComparisonRow {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
  team: boolean | string;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Local Offline Storage (IndexedDB)', free: true, pro: true, team: true },
  { feature: 'Markdown & KaTeX Math Rendering', free: true, pro: true, team: true },
  { feature: 'Basic PDF & Clean Markdown Export', free: true, pro: true, team: true },
  { feature: 'Native Slash Commands (/) & Fast Formatting', free: true, pro: true, team: true },
  { feature: 'Curated Starter Blueprint Templates (8)', free: true, pro: true, team: true },
  { feature: 'Client-Side WebP Image Compression', free: true, pro: true, team: true },
  { feature: 'Supabase Multi-Device Cloud Sync', free: false, pro: true, team: true },
  { feature: 'Publication-Grade PDF (Custom Cover & TOC)', free: false, pro: true, team: true },
  { feature: 'Full & Unlimited Template Library', free: false, pro: true, team: true },
  { feature: 'Local Checkpoints & Version History', free: false, pro: true, team: true },
  { feature: '1-Click Web Publishing & Passwords', free: false, pro: true, team: true },
  { feature: 'Real-Time Multiplayer Collaboration', free: false, pro: false, team: true },
  { feature: 'Shared Team Workspace & Tags', free: false, pro: false, team: true },
  { feature: 'Support Level', free: 'Community', pro: 'Priority Email', team: 'Dedicated 24/7' }
];

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: 'Can I use MD Writer completely offline without an account?',
    a: 'Yes! The Starter plan is 100% free and offline-first. Your documents are stored safely inside your browser using IndexedDB (Dexie.js). You do not need to register, log in, or install anything.'
  },
  {
    q: 'How does the Earlybird 1-time coupon reward work?',
    a: 'When you claim one of our 100 limited Earlybird spots, you receive a unique one-time coupon (e.g. EARLYBIRD-XXXXX) bound to your account. Redeeming it on the Monthly plan grants 1 month of Pro completely free. Redeeming it on the Annual plan stacks an extra 2 months of free Pro on top of our 20% annual discount.'
  },
  {
    q: 'How does Supabase multi-device cloud synchronization work?',
    a: 'When you upgrade to Pro and connect your account, every edit is debounced and synchronized securely to your personal PostgreSQL database on Supabase. This delivers instant multi-device backup with last-write-wins resolution.'
  },
  {
    q: 'How is Regional / PPP pricing validated?',
    a: 'We show display currencies based on Geo-IP detection (with fallback to US $8). At checkout, payment processors (such as Stripe Adaptive Pricing / Paddle) validate your card billing country to prevent currency arbitrage while granting equitable access across India, SEA, and Latin America.'
  },
  {
    q: 'What happens to my documents if I cancel my subscription?',
    a: 'You never lose access to your data. All documents are stored in open Markdown format and remain accessible in your local browser storage. You can export all your files anytime with one click.'
  },
  {
    q: 'Can I export to PDF without any watermark or ads?',
    a: 'Absolutely. Starter gives clean print PDF export. Pro upgrades you to our publication studio with custom cover designs, dynamic table of contents, and custom branding.'
  }
];
