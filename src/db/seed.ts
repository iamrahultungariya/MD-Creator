import { db, saveDocument } from './index';

export const INITIAL_SEED_DOCUMENTS = [
  {
    id: 'doc-getting-started',
    title: 'Getting Started.md',
    tags: ['Guide', 'Welcome'],
    content: `# Welcome to MD Writer

Write **faster**, stay focused, and turn plain markdown into publication-ready documents.

> [!TIP]
> Press **Ctrl+K** (or **Cmd+K**) anytime to launch the global Command Palette, or type **/** on a blank line to insert blocks.

---

## ⚡ Key Highlights
- [x] **Zero Latency**: Real-time dual-pane preview with 0ms typing lag.
- [x] **Offline First**: Documents are saved securely in your browser's IndexedDB.
- [x] **Design-Grade Export**: Publication-grade PDFs with custom typography & cover pages.
- [ ] **Try it yourself**: Click this checkbox to test interactive task lists!

---

## 📐 Mathematical Equations
Inline formulas like $E = mc^2$ or full display blocks via KaTeX:

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

> [!NOTE]
> All files remain strictly stored on your device unless you choose cloud sync. Happy writing!
`
  },
  {
    id: 'doc-product-roadmap',
    title: 'Product Roadmap Q3.md',
    tags: ['Work', 'Product', 'Planning'],
    content: `# Product Roadmap — Q3 Strategic Milestones

Quarterly product strategy focused on writer workflow acceleration and team distribution.

> [!IMPORTANT]
> Target release cutoff: **September 30**. All core initiatives must pass performance benchmarks before general rollout.

---

## 🎯 Executive Priorities

| Focus Area | Target Milestone | Owner | Status |
| :--- | :--- | :--- | :--- |
| **PDF Publishing** | Vector Print Engine v2.0 | Design Team | Completed |
| **Media Studio** | Client-Side WebP Compression | Frontend | Completed |
| **Cloud Sync** | Supabase Offline Queue Sync | Infrastructure | In Progress |
| **Mobile PWA** | Bi-directional Offline Cache | Mobile Team | In Progress |

---

## 📋 Q3 Sprint Deliverables
- [x] Streamline top navigation into clean, spacious Resources dropdown
- [x] Implement hardware-accelerated 2D canvas typing FX
- [ ] Add password-protected web publishing links
- [ ] Finalize team workspace permission matrices

> [!NOTE]
> Metrics review scheduled for alternate Tuesdays at 10:00 AM PST.
`
  },
  {
    id: 'doc-meeting-notes',
    title: 'Meeting Notes — Design Review.md',
    tags: ['Work', 'Design', 'Sync'],
    content: `# Meeting Notes — Design System Review

**Date**: September 7, 2026 • **Facilitator**: Lead Product Designer  
**Participants**: Engineering, UX Research, Brand Studio

---

## 💡 Key Discussion Points
1. **Typography & Hierarchy**: Transition all long-form body content to *Inter Sans* with *Plus Jakarta Sans* headings for optimal readability across high-DPI displays.
2. **Export Visual Quality**: Running headers and footers should pin strictly to print boundaries with dynamic chapter titles.
3. **Palette Modernization**: Adopt neutral dark tones (\`#0A0A0A\`) with high-contrast accent borders.

---

## 📝 Action Items & Ownership

- [x] Audit all typography presets for high-resolution PDF rendering (@sarah)
- [x] Replace generic system icons with open-source modern design assets (@alex)
- [ ] Prototype cover page template variations for corporate reports (@designer)
- [ ] Measure First Contentful Paint benchmarks on 3G network simulation (@dev)

> [!TIP]
> Next design sync: Thursday at 3:00 PM in the Studio Room.
`
  },
  {
    id: 'doc-weekend-recipe',
    title: 'Recipe: Weekend Brunch.md',
    tags: ['Personal', 'Lifestyle'],
    content: `# Sourdough French Toast with Caramelized Pecans

A rich, golden weekend brunch recipe perfected for slow Sunday mornings.

> [!TIP]
> For best results, use day-old thick sliced brioche or sourdough bread.

---

## ⏱️ Prep & Cook Times
- **Prep Time**: 15 minutes
- **Cook Time**: 10 minutes
- **Total Time**: 25 minutes
- **Servings**: 4 portions

---

## 🛒 Ingredients Table

| Ingredient | Quantity | Notes |
| :--- | :--- | :--- |
| Brioche or Sourdough | 8 thick slices | Day-old preferred |
| Large Eggs | 4 | Room temperature |
| Whole Milk or Oat Milk | 3/4 cup | Unsweetened |
| Heavy Cream | 1/4 cup | Adds rich custard texture |
| Pure Vanilla Extract | 1 tsp | High-grade bourbon vanilla |
| Ground Cinnamon | 1/2 tsp | Freshly ground |
| Salted Butter | 2 tbsp | For frying pan |
| Maple Syrup & Pecans | To taste | Warm before serving |

---

## 🍳 Step-by-Step Instructions
- [x] Whisk eggs, milk, heavy cream, vanilla, and cinnamon in a shallow dish until smooth.
- [ ] Heat butter in a large cast iron skillet over medium heat until gently foaming.
- [ ] Dip each bread slice for 20 seconds per side, allowing custard to soak through.
- [ ] Cook for 3–4 minutes per side until deep golden brown.
- [ ] Top with toasted pecans and a generous drizzle of warm pure maple syrup.
`
  }
];

export async function seedInitialDocuments(): Promise<void> {
  const count = await db.documents.count();
  if (count === 0) {
    for (const doc of INITIAL_SEED_DOCUMENTS) {
      await saveDocument(doc.id, doc.title, doc.content, doc.tags);
    }
  }
}
