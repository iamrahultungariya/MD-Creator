import { db, saveDocument, getDocumentContent } from './index';

export const INITIAL_SEED_DOCUMENTS = [
  {
    id: 'doc-master-user-guide',
    title: 'MD Writer — User Guide & Quick Reference.md',
    tags: ['Guide', 'Reference', 'Documentation'],
    content: `# MD Writer — User Guide & Quick Reference

Welcome to **MD Writer** — a fast, private, distraction-free Markdown studio designed for seamless writing, note-taking, and publishing. Everything runs locally on your device with instant responsiveness, full offline capabilities, and zero setup friction.

> [!TIP]
> Press <kbd>Ctrl+K</kbd> (or <kbd>Cmd+K</kbd> on macOS) to open the **Command Palette** from anywhere, or type <kbd>/</kbd> on any blank line to access the **Quick Insert** menu.

---

## 1. Essential Keyboard Shortcuts

Boost your writing speed with these universal keyboard shortcuts:

### 1.1 Navigation & Workspace
| Shortcut (Win / Linux) | Shortcut (macOS) | Action | Scope |
| :--- | :--- | :--- | :--- |
| <kbd>Ctrl+K</kbd> | <kbd>Cmd+K</kbd> | **Command Palette** | Global search for files, actions, and settings |
| <kbd>Ctrl+M</kbd> | <kbd>Cmd+M</kbd> | **Switch Mode** | Cycle between Split, Writing, and Reader modes |
| <kbd>Ctrl+O</kbd> | <kbd>Cmd+O</kbd> | **Document Switcher** | Fast switch between your open documents |
| <kbd>Ctrl+,</kbd> | <kbd>Cmd+,</kbd> | **Preferences** | Customize fonts, font sizes, and toolbar actions |
| <kbd>Ctrl+S</kbd> | <kbd>Cmd+S</kbd> | **Save Document** | Instant save (auto-save is active by default) |

### 1.2 Text Formatting
| Shortcut (Win / Linux) | Shortcut (macOS) | Action | Markdown Syntax |
| :--- | :--- | :--- | :--- |
| <kbd>Ctrl+B</kbd> | <kbd>Cmd+B</kbd> | **Bold** | \`**bold text**\` |
| <kbd>Ctrl+I</kbd> | <kbd>Cmd+I</kbd> | **Italic** | \`*italic text*\` |
| <kbd>Ctrl+L</kbd> | <kbd>Cmd+K</kbd> | **Insert Link** | \`[Link Title](url)\` |
| <kbd>Ctrl+1</kbd> | <kbd>Cmd+1</kbd> | **Heading 1** | \`# Heading 1\` |
| <kbd>Ctrl+2</kbd> | <kbd>Cmd+2</kbd> | **Heading 2** | \`## Heading 2\` |
| <kbd>Ctrl+3</kbd> | <kbd>Cmd+3</kbd> | **Heading 3** | \`### Heading 3\` |
| <kbd>Ctrl+Z</kbd> | <kbd>Cmd+Z</kbd> | **Undo** | Revert last change |
| <kbd>Ctrl+Y</kbd> | <kbd>Cmd+Shift+Z</kbd> | **Redo** | Reapply reverted change |

### 1.3 Search & Publishing
| Shortcut (Win / Linux) | Shortcut (macOS) | Action | Description |
| :--- | :--- | :--- | :--- |
| <kbd>Ctrl+F</kbd> | <kbd>Cmd+F</kbd> | **Find** | Search text in current document |
| <kbd>Ctrl+H</kbd> | <kbd>Cmd+H</kbd> | **Find & Replace** | Search and batch replace words |
| <kbd>Ctrl+P</kbd> | <kbd>Cmd+P</kbd> | **Print & PDF Studio** | Open multi-page print layout |
| Type <kbd>/</kbd> | Type <kbd>/</kbd> | **Slash Commands** | Insert tables, math, callouts, and code |

---

## 2. Workspace Modes

MD Writer offers tailored environments for each phase of your writing:

- **Split Mode (<kbd>Ctrl+M</kbd>)**: Dual-pane layout featuring the Markdown editor on the left and a synchronized live preview on the right. Ideal for technical writing, math formulas, and structured documents.
- **Writing Mode**: Single-column, distraction-free writing canvas with an intelligent floating formatting toolbar that appears right above your text selection.
- **Reader Mode**: Clean, distraction-free reading layout with customizable eye-comfort color themes (Clean Paper, Sepia, Night) and a real-time reading progress indicator.
- **Presentation Mode**: Automatically transforms your document headings into an interactive slide presentation for keynotes and meetings.
- **PDF Studio (<kbd>Ctrl+P</kbd>)**: Professional print engine featuring automatic page breaks, running headers, customizable footers, and page numbers.

---

## 3. Core Features & Capabilities

### 3.1 Slash Commands Menu (\`/\`)
Type \`/\` on any empty line to open the quick insert menu. Insert rich elements instantly:
- **Structure**: Headings (H1, H2, H3), Bullet Lists, Numbered Lists, Task Checklists, and Horizontal Dividers.
- **Rich Blocks**: Code blocks with syntax highlighting, visual tables, KaTeX formulas, and highlighted text.
- **Callouts**: GitHub-style Note, Tip, Important, Warning, and Caution alert cards.
- **Media & Templates**: Image embed dialog, ready-made templates, and PDF studio shortcut.

### 3.2 Interactive Task Checklists
Manage tasks with interactive checkboxes that can be clicked directly in the preview pane:
- [x] Create project draft
- [x] Configure personal font and theme in Settings (<kbd>Ctrl+,</kbd>)
- [ ] Connect local folder for direct disk editing
- [ ] Export final document to PDF or Word (.docx)

### 3.3 GitHub-Style Callout Boxes
Communicate important alerts using GitHub blockquote callout syntax:

> [!NOTE]
> Helpful background context, notes, and reference information.

> [!TIP]
> Pro-tips, recommendations, and best practices to speed up your work.

> [!IMPORTANT]
> Crucial requirements, guidelines, or must-know details.

> [!WARNING]
> Advisory notices, edge cases, and potential pitfalls to avoid.

> [!CAUTION]
> High-risk warnings regarding destructive actions or sensitive data.

### 3.4 Mathematical Formulas (KaTeX)
Write clean mathematical expressions using standard LaTeX syntax:
- **Inline Formula**: Wrap with single dollar signs, like $E = mc^2$ or $\\sqrt{a^2 + b^2}$.
- **Display Block**: Wrap with double dollar signs:

$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$

> [!TIP]
> Type \`/math\` to launch the interactive Formula Studio with live visual equation preview!

### 3.5 Smart Tables & Clipboard Converter
- Design tables with clean typography, zebra striping, and smooth horizontal scrolling.
- **Smart Paste**: Copy any table directly from Microsoft Excel or Google Sheets, then press <kbd>Ctrl+V</kbd> in MD Writer — it automatically formats into clean Markdown!
- **Visual Table Designer**: Type \`/table\` to open the interactive table builder modal.

| Feature | Local-First | Cloud Sync | PDF Studio |
| :--- | :--- | :--- | :--- |
| **Instant Offline Access** | Yes | Yes | Yes |
| **Document Privacy** | 100% on device | Encrypted | Print-ready |
| **Multi-Format Export** | .md, .docx, PDF | Public link | Multi-page |

### 3.6 Local Folder Access
Open and edit \`.md\` files directly from your computer's folders without uploading them to any server. Open the Document Drawer and select **Open Folder** to work with local files.

### 3.7 Cloud Sync & Document Sharing
- **Multi-Device Sync**: Sign in to keep documents in continuous harmony across your desktop, laptop, tablet, and mobile.
- **Public Share Links**: Generate a clean, read-only web link to share your notes with anyone, with optional password protection.

### 3.8 Focus Sprint Timer
Stay in deep flow with built-in timed writing sprints. Click the sprint timer icon in the bottom status bar to start a focused writing session and track words written.

### 3.9 Multi-Format Export
Export your work anytime from the **Export** menu or press <kbd>Ctrl+P</kbd>:
- **PDF Studio**: Publication-grade multi-page vector PDF with custom margins and headers.
- **Word Document (.docx)**: Clean formatting ready for Microsoft Word.
- **Markdown (.md)**: Plain text file for maximum portability.
- **Copy HTML**: Formatted HTML ready to paste into blogs, emails, or CMS tools.
`
  }
];

export async function seedInitialDocuments(): Promise<void> {
  const count = await db.documents.count();
  if (count === 0) {
    for (const doc of INITIAL_SEED_DOCUMENTS) {
      await saveDocument(doc.id, doc.title, doc.content, doc.tags);
    }
  } else {
    // If the master user guide has older legacy content (architecture/diagrams), upgrade it in place
    try {
      const existingContent = await getDocumentContent('doc-master-user-guide');
      if (existingContent && (existingContent.includes('Architecture & Offline Sovereignty') || existingContent.includes('Architecture Diagrams via Mermaid'))) {
        const guideSeed = INITIAL_SEED_DOCUMENTS.find(d => d.id === 'doc-master-user-guide');
        if (guideSeed) {
          await saveDocument(guideSeed.id, guideSeed.title, guideSeed.content, guideSeed.tags);
        }
      }
    } catch {
      // Document might not exist or be deleted
    }
  }
}
