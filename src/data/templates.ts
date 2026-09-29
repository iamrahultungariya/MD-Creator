export type TemplateCategory = 'Work' | 'Personal' | 'Content & Dev';

export interface MarkdownTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  desc: string;
  badge?: string;
  content: string;
}

export const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
  // ── 1. WORK TEMPLATES ──────────────────────────────────────
  {
    id: 'project-brief',
    title: 'Project Brief & Specifications.md',
    category: 'Work',
    desc: 'High-impact project brief featuring objective statements, stakeholder roles, milestone tables, and risk callouts.',
    badge: 'Popular',
    content: `# Project Brief: [Initiative Name]

> [!IMPORTANT]
> **Target Delivery Date**: Q3 2026 • **Status**: Active Draft  
> **Lead Owner**: [Your Name] • **Executive Sponsor**: [Sponsor Name]

---

## 🎯 1. Problem Statement & Mission
Describe the core user problem this project solves. Why now, and what measurable impact does it drive?

- **Primary Goal**: Accelerate document export speed by 40%.
- **Target Audience**: Technical writers, engineers, and product teams.
- **Success Metric**: > 90% customer satisfaction score upon release.

---

## 📋 2. Core Requirements & Scope

| Feature Component | Priority | Status | Target Sprint |
| :--- | :--- | :--- | :--- |
| **PDF Vector Print Engine** | P0 (Critical) | Completed | Sprint 1 |
| **Client WebP Optimizer** | P0 (Critical) | In Progress | Sprint 2 |
| **Password-Protected Links** | P1 (High) | Planned | Sprint 3 |
| **Team Style Presets** | P2 (Medium) | Scoped | Sprint 4 |

---

## ✅ 3. Launch Readiness Checklist
- [x] Technical architecture reviewed by engineering team
- [x] Typography presets verified for high-resolution vector print
- [ ] Automated regression tests passing in CI/CD pipeline
- [ ] User onboarding documentation updated

> [!TIP]
> Keep deliverables small and iterate with rapid prototype feedback loops.
`
  },
  {
    id: 'meeting-sync',
    title: 'Meeting Notes & 1:1 Sync.md',
    category: 'Work',
    desc: 'Structured meeting template with agenda items, decision logs, discussion notes, and assignable action items.',
    content: `# Team Sync & Decision Log

- **Meeting Topic**: [e.g. Weekly Product & Architecture Sync]
- **Date & Time**: ${new Date().toLocaleDateString()} at 10:00 AM UTC
- **Facilitator**: [Name]
- **Attendees**: @alice, @bob, @carol, @rahul

---

## 📌 Agenda
1. Review sprint commitments and blockers (10 mins).
2. Architecture discussion: Hardware-accelerated canvas engine (20 mins).
3. Design sign-off: Minimalist navigation & Resources dropdown (15 mins).

---

## 💡 Key Discussion Notes
- **Topic 1**: Decoupled vendor chunks in Vite build to isolate heavy animation libraries.
- **Topic 2**: Transitioned from raw 60 FPS label to informative ⚡ Smooth 60fps with canvas tooltip.

---

## ⚖️ Decisions Made
- [x] **Decision 1**: All offline documents remain 100% free with IndexedDB storage.
- [x] **Decision 2**: Keep Beta features unrestricted for active community feedback.

---

## ✅ Action Items & Owners

| Task | Owner | Due Date | Status |
| :--- | :--- | :--- | :--- |
| Deploy updated template library | @lead | Tomorrow | In Progress |
| Connect feedback willingness-to-pay field | @dev | Friday | Planned |
| Audit typography presets for PDF export | @designer | Next Week | Planned |
`
  },
  {
    id: 'api-docs',
    title: 'API Documentation Spec.md',
    category: 'Work',
    desc: 'Clean RESTful/GraphQL API specification template with endpoint routes, headers, parameter tables, and JSON responses.',
    badge: 'Developer',
    content: `# API Reference: Document Synchronization Service

Version \`v1.2.0\` • Base URL: \`https://api.mdwriter.dev/v1\`

> [!NOTE]
> All endpoints require an \`Authorization: Bearer <token>\` header unless otherwise specified.

---

## 📡 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| \`GET\` | \`/documents\` | List all user documents | Yes |
| \`POST\` | \`/documents\` | Create or reconcile document | Yes |
| \`GET\` | \`/documents/:id\` | Fetch document with revision history | Yes |
| \`DELETE\` | \`/documents/:id\` | Soft-delete document | Yes |

---

## 🔍 \`POST /documents\` — Create Document

### Request Headers
\`\`\`http
POST /v1/documents HTTP/1.1
Host: api.mdwriter.dev
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
\`\`\`

### Request Payload Example
\`\`\`json
{
  "title": "Quarterly Retrospective.md",
  "content": "# Q3 Retrospective\\n\\nWhat went well...",
  "tags": ["Work", "Retrospective"],
  "client_timestamp": "${new Date().toISOString()}"
}
\`\`\`

### Response Example (\`201 Created\`)
\`\`\`json
{
  "success": true,
  "data": {
    "id": "doc_991823",
    "version": 1,
    "synced_at": "${new Date().toISOString()}"
  }
}
\`\`\`
`
  },

  // ── 2. PERSONAL TEMPLATES ──────────────────────────────────
  {
    id: 'daily-journal',
    title: 'Daily Focus Journal & Habits.md',
    category: 'Personal',
    desc: 'Mindful productivity template with top 3 daily priorities, time-blocking blocks, habit checks, and evening reflection.',
    badge: 'Daily',
    content: `# Daily Focus & Productivity Log — ${new Date().toLocaleDateString()}

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

---

## 🎯 Top 3 High-Impact Priorities (Must Win Today)
- [ ] **1. Deep Focus**: Ship template library categorization and verification.
- [ ] **2. Product Quality**: Verify 0 TypeScript build errors and inspect bundle sizes.
- [ ] **3. Feedback**: Connect monetization survey fields to understand willingness to pay.

---

## ⏱️ Time-Blocking Schedule

| Time Window | Planned Activity | Reflection |
| :--- | :--- | :--- |
| **09:00 - 11:30** | Deep Work Block: Core Architecture | 2.5 hours flow state achieved |
| **12:30 - 13:30** | Team Sync & Design Alignment | Finalized typography guidelines |
| **14:30 - 17:00** | Code Implementation & Review | Pushed commits to remote repository |

---

## 🌙 Evening Retrospective
- **What went exceptionally well today?**:
- **What caused friction or delay?**:
- **One thing I will improve tomorrow**:
`
  },
  {
    id: 'reading-list',
    title: 'Reading List & Book Summary.md',
    category: 'Personal',
    desc: 'Curated book analysis template featuring book metadata, executive summary, key takeaways, and favorite quotes.',
    content: `# Book Notes: [Book Title]

- **Author**: [Author Name]
- **Finished Reading**: ${new Date().toLocaleDateString()}
- **Rating**: ⭐⭐⭐⭐⭐ (5/5)
- **Category**: Non-Fiction / Engineering / Philosophy

---

## 💡 The One-Sentence Thesis
What is the single most important message the author conveys in this book?

> [!TIP]
> Summarize the core thesis in your own words before looking at external summaries.

---

## 🔑 Key Takeaways & Mental Models
1. **First-Principles Thinking**: Break problems down into foundational truths rather than reasoning by analogy.
2. **Compound Momentum**: Small daily disciplines sustained over long horizons outperform irregular bursts of intensity.
3. **Subtraction over Addition**: Removing friction is often twice as effective as adding new features.

---

## 📝 Memorable Quotes & Excerpts
> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."  
> — *Antoine de Saint-Exupéry*
`
  },
  {
    id: 'recipe-mealprep',
    title: 'Weekend Recipe & Meal Prep.md',
    category: 'Personal',
    desc: 'Culinary recipe blueprint featuring prep times, structured ingredients table, cook instructions, and chef tips.',
    content: `# Sourdough French Toast with Caramelized Pecans

A rich, golden weekend brunch recipe perfected for slow Sunday mornings.

> [!TIP]
> For optimal custard absorption, use thick sliced day-old brioche or sourdough bread.

---

## ⏱️ Recipe Stats
- **Prep Time**: 15 minutes • **Cook Time**: 10 minutes • **Servings**: 4 portions

---

## 🛒 Ingredients Table

| Ingredient | Quantity | Notes |
| :--- | :--- | :--- |
| Brioche or Sourdough | 8 thick slices | Day-old preferred |
| Large Eggs | 4 | Room temperature |
| Whole Milk or Oat Milk | 3/4 cup | Unsweetened |
| Heavy Cream | 1/4 cup | For rich custard texture |
| Pure Vanilla Extract | 1 tsp | High-grade bourbon vanilla |
| Ground Cinnamon | 1/2 tsp | Freshly ground |
| Salted Butter | 2 tbsp | For skillet |
| Maple Syrup & Pecans | To taste | Warm before serving |

---

## 🍳 Cooking Steps
- [x] Whisk eggs, milk, cream, vanilla, and cinnamon in a shallow bowl until blended.
- [ ] Heat butter in a cast iron skillet over medium heat until lightly bubbling.
- [ ] Dip each bread slice for 20 seconds per side.
- [ ] Fry for 3–4 minutes per side until golden brown and crisp on edges.
- [ ] Garnish with warm pecans and pure maple syrup.
`
  },

  // ── 3. CONTENT & DEV TEMPLATES ─────────────────────────────
  {
    id: 'readme',
    title: 'Project README.md',
    category: 'Content & Dev',
    desc: 'Production-ready GitHub project documentation with badges, installation quickstart, architecture table, and license.',
    badge: 'Popular',
    content: `# Project Name

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> A concise, high-impact summary describing the core mission and purpose of this project.

---

## ⚡ Key Highlights
- **Blazing Fast**: Optimized 60-144fps rendering with zero forced layout reflows.
- **Offline First**: Instant persistence in IndexedDB with background cloud reconciliation.
- **Developer First**: Fully typed TypeScript architecture with modular components.

---

## 🚀 Quickstart

### Prerequisites
- Node.js \`>= 20.0.0\`
- npm or pnpm

### Installation
\`\`\`bash
# Clone the repository
git clone https://github.com/organization/project-name.git

# Navigate into project directory
cd project-name

# Install dependencies
npm install

# Start local development server
npm run dev
\`\`\`

---

## 📐 Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + Tailwind CSS | Component tree & responsive styling |
| **State Management** | Zustand 5 | Global state slices & reactive stores |
| **Local Cache** | Dexie.js (IndexedDB) | Zero-latency client persistence |
| **Cloud Sync** | Supabase | Multi-device synchronization |

---

## 🤝 Contributing
Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.

## 📄 License
Distributed under the MIT License. See [LICENSE](LICENSE) for details.
`
  },
  {
    id: 'changelog',
    title: 'Changelog (Keep a Changelog).md',
    category: 'Content & Dev',
    desc: 'Industry-standard Keep a Changelog template for documenting semantic versions, added features, fixes, and breaking changes.',
    badge: 'Dev Standard',
    content: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
- Direct clipboard screenshot pasting via \`Ctrl+V\`
- Client-side WebP image compression studio

---

## [3.1.0] - ${new Date().toISOString().split('T')[0]}
### Added
- **Embed Image Studio**: HTML5 Canvas WebP compression with offline persistence.
- **Minimalist Decluttered Navbar**: Clean primary navigation with spacious Resources dropdown.
- **Dedicated Feedback Channel**: Built-in category selector, sentiment scale, and bug diagnostics.
- **Fluid Motion & Typography Refinements**: High-contrast dark mode selection and smooth spring animations.

### Performance
- **Zero-Blocking First Paint**: Code-split global modals, reducing initial JS entry to 19 kB.
- **Fine-Grained Vendor Splitting**: Decoupled Rollup chunks into query, dexie, supabase, and animation.

---

## [3.0.0] - 2026-03-01
### Added
- Progressive Web App (PWA) installability with 100+ precached offline assets.
- Predefined KaTeX Mathematical Studio with 20+ formulas across Calculus and Physics.
- Debounced Mermaid diagram compiler with 0ms in-memory SVG cache.
`
  },
  {
    id: 'blog-post',
    title: 'Technical Blog Post & Tutorial.md',
    category: 'Content & Dev',
    desc: 'Engaging engineering article blueprint complete with TL;DR callout, code walkthroughs, diagrams, and concluding summary.',
    content: `# Building a Zero-Latency Offline Markdown Studio

**Published on**: ${new Date().toLocaleDateString()} • **Author**: [Your Name]  
**Reading Time**: 6 min read • **Tags**: \`TypeScript\`, \`IndexedDB\`, \`Web Performance\`

---

## ⚡ TL;DR Summary
> [!TIP]
> By eliminating synchronous DOM queries and using an off-screen canvas pool, we achieved steady 60–144fps keystroke performance on low-spec hardware without dropping frames.

---

## 1. The Bottleneck: DOM Layout Thrashing
Traditional browser rich text editors suffer from layout recalculations whenever a key is pressed. Every time you measure caret coordinates using \`window.getComputedStyle()\`, the browser is forced to flush pending styles:

\`\`\`typescript
// ⚠️ Anti-pattern: Forces synchronous layout recalculation
const rect = element.getBoundingClientRect();
\`\`\`

---

## 2. The Solution: Persistent Mirror Singleton
Instead of creating and destroying temporary measurement nodes on every keystroke, we maintain a persistent single-instance offscreen DOM mirror:

\`\`\`typescript
class CaretMirror {
  private static instance: CaretMirror;
  private mirrorEl: HTMLDivElement;

  public static get(): CaretMirror {
    if (!this.instance) this.instance = new CaretMirror();
    return this.instance;
  }
}
\`\`\`

---

## 3. Results & Impact

| Measurement Metric | Previous Architecture | Canvas Singleton Engine |
| :--- | :--- | :--- |
| **Input Latency** | 18–24 ms | **< 0.05 ms** (Instant) |
| **Dropped Frames** | 12% on rapid typing | **0.0%** (Locked 60fps) |
| **Garbage Collection** | Spikes every 30s | **Zero Allocations** |

---

## Conclusion
Building for performance requires treating web apps with the discipline of game development. Focus on zero-allocation loops, persistent singletons, and offline-first persistence.
`
  }
];
