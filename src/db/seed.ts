import { db, saveDocument } from './index';

export const INITIAL_SEED_DOCUMENTS = [
  {
    id: 'doc-master-user-guide',
    title: 'MD Writer — Ultimate User Guide & Reference.md',
    tags: ['Guide', 'Reference', 'Documentation'],
    content: `# MD Writer — Ultimate User Guide & Reference

Welcome to **MD Writer** — a private, offline-first Markdown studio engineered for writers, engineers, and researchers who demand zero latency, publication-grade exports, and distraction-free focus.

> [!TIP]
> Press <kbd>Ctrl+K</kbd> (or <kbd>Cmd+K</kbd> on macOS) anywhere to open the global **Command Palette**, or press <kbd>Ctrl+M</kbd> to rapidly switch between workspace modes.

---

## 1.0 Architecture & Offline Sovereignty

MD Writer is architected around a strict **local-first paradigm**:
- **Browser-Native Storage**: All your documents, outlines, drafts, and settings are saved instantaneously into your browser's persistent **IndexedDB database** (<0.5ms write latency).
- **Offline Parity**: You can draft, edit, format, and generate publication PDFs completely without an internet connection.
- **Privacy Standard**: Your written words remain on your machine unless you explicitly choose to authenticate and enable cloud synchronization.
- **No AI Training**: Your text and intellectual property are never ingested, scraped, or used to train artificial intelligence models.

---

## 2.0 Workspace Modes

MD Writer adapts to your state of work with five dedicated workspace modes:

| Mode | Shortcut | Best For | Description |
| :--- | :--- | :--- | :--- |
| **Split Mode** | <kbd>Ctrl+M</kbd> → Split | Drafting & Editing | Synchronized dual-pane editor with instant live Markdown preview. |
| **Writing Mode** | <kbd>Ctrl+M</kbd> → Write | Focus & Zen Writing | Single-column distraction-free canvas with floating formatting dock above cursor. |
| **Reader Mode** | <kbd>Ctrl+M</kbd> → Read | Proofreading & Review | Clean publication article layout with custom eye-comfort themes and reading progress. |
| **Presentation** | <kbd>Ctrl+M</kbd> → Present | Keynotes & Pitches | Transforms Markdown headings and sections into interactive slide decks. |
| **PDF Studio** | <kbd>Ctrl+P</kbd> | Publishing & Print | Vector print engine with running headers, footers, page breaks, and cover pages. |

---

## 3.0 Keyboard Shortcuts Cheatsheet

Speed up your writing workflow with these universal keyboard shortcuts:

| Action | Windows / Linux | macOS | Scope |
| :--- | :--- | :--- | :--- |
| **Command Palette** | <kbd>Ctrl+K</kbd> | <kbd>Cmd+K</kbd> | Everywhere |
| **Switch Mode** | <kbd>Ctrl+M</kbd> or <kbd>Alt+M</kbd> | <kbd>Cmd+M</kbd> or <kbd>Opt+M</kbd> | Editor Header |
| **Document Switcher** | <kbd>Ctrl+O</kbd> | <kbd>Cmd+O</kbd> | Files / Documents |
| **Print & PDF Studio** | <kbd>Ctrl+P</kbd> | <kbd>Cmd+P</kbd> | Studio Export |
| **Force Save** | <kbd>Ctrl+S</kbd> | <kbd>Cmd+S</kbd> | Editor Canvas |
| **Find in Document** | <kbd>Ctrl+F</kbd> | <kbd>Cmd+F</kbd> | Search Bar |
| **Find & Replace** | <kbd>Ctrl+H</kbd> | <kbd>Cmd+H</kbd> | Search & Replace |
| **Bold Selection** | <kbd>Ctrl+B</kbd> | <kbd>Cmd+B</kbd> | Formatting |
| **Italic Selection** | <kbd>Ctrl+I</kbd> | <kbd>Cmd+I</kbd> | Formatting |
| **Insert Hyperlink** | <kbd>Ctrl+L</kbd> | <kbd>Cmd+K</kbd> | Formatting |
| **Quick Block Insert** | Type <kbd>/</kbd> on empty line | Type <kbd>/</kbd> on empty line | Slash Commands |

---

## 4.0 Rich Markdown & Formatting Syntax

### 4.1 Typography & Emphasis
- **Bold text**: \`**bold text**\` or \`__bold text__\`
- *Italic text*: \`*italic text*\` or \`_italic text_\`
- ~~Strikethrough~~: \`~~strikethrough~~\`
- ==Highlighted text==: \`==highlighted text==\`
- \`Inline code\`: Wrap code snippets with backticks \`\`\`code\`\`\`
- [External Hyperlink](https://github.com): \`[Link Text](https://url.com)\`

### 4.2 Interactive Task Lists
- [x] Complete project kickoff review
- [x] Implement local database persistence
- [ ] Connect multi-page vector print layout
- [ ] Publish documentation to shared workspace

> [!NOTE]
> You can click any task checkbox directly in the Preview pane to toggle its completion state in real time!

---

## 5.0 GitHub-Style Callout Alert Boxes

Communicate warnings, important notes, and tips using standard GitHub blockquote callout syntax:

> [!NOTE]
> Useful background information, implementation context, and technical details.

> [!TIP]
> Helpful recommendations, best practices, and workflow acceleration advice.

> [!IMPORTANT]
> Critical prerequisites, operational steps, or must-know product rules.

> [!WARNING]
> Potential edge cases, breaking changes, or operational hazards to avoid.

> [!CAUTION]
> High-risk actions that could impact data storage or external deployments.

---

## 6.0 Mathematical Expressions with KaTeX

MD Writer includes native, hardware-accelerated **KaTeX** formula rendering.

### Inline Formula
You can embed formulas inline like Einstein's mass-energy equivalence $E = mc^2$, or Gaussian distributions $f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$.

### Display Equation Block
For multi-line mathematical proofs or complex integrals, use double-dollar syntax:

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

$$\\mathbf{A} = \\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}$$

---

## 7.0 Architecture Diagrams via Mermaid

Render interactive diagrams directly from text using fenced \`mermaid\` blocks:

\`\`\`mermaid
graph TD
    A["Editor Canvas"] -->|"Instant Keystroke"| B["IndexedDB Local Storage"]
    A -->|"Deferred AST"| C["Markdown & KaTeX Parser"]
    C --> D["Live Dual-Pane Preview"]
    C --> E["Vector PDF Studio Engine"]
    B -.->|"Optional Auth"| F["Encrypted Cloud Sync"]
\`\`\`

---

## 8.0 Visual Table Studio & Media Embedding

### Structured Data Tables
Tables automatically render with clean typography, zebra striping, and touch-friendly horizontal scrolling:

| Feature Dimension | Community Edition | Pro Studio Tier | Team Workspace |
| :--- | :--- | :--- | :--- |
| **Local Storage** | Unlimited IndexedDB | Unlimited IndexedDB | Unlimited IndexedDB |
| **PDF Vector Print** | Multi-Page Engine | Custom Margins & Covers | Custom Brand Watermarks |
| **Word .docx Export** | Supported | Supported | Bulk Export |
| **Cloud Device Sync** | Free during Beta | Included in Beta | Multi-seat sync |
| **Web Publishing** | Public links | Password-protected links | Custom vanity domains |

> [!TIP]
> Type \`/table\` anywhere in the editor to launch the interactive Visual Table Designer!

---

## 9.0 Publication-Grade PDF & Document Export

When you are ready to share your work, MD Writer provides publication-level export engines:
1. **Multi-Page Print & PDF Studio (<kbd>Ctrl+P</kbd>)**:
   - Automatic content-aware page pagination (no orphan headings).
   - Running header with document title and customizable running footer with page numbers.
   - Clean, light print preview themes designed to save printer ink and produce professional PDFs.
2. **Word Document (.docx)**:
   - Export structured headings, lists, tables, and code snippets straight into Microsoft Word format.
3. **Plain Markdown (.md)**:
   - Instant single-file markdown export with zero metadata distortion.
4. **Web Publishing**:
   - Share a live, read-only web link of your document with one click.

---

### Need Help or Have Feedback?
Have a feature request or found an edge case? Open the **Feedback & Reviews** page from the navigation bar or join our community discussions. Happy writing!
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
