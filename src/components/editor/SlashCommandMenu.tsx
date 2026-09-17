import React, { useEffect, useRef } from 'react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code2, 
  Quote, 
  Table2, 
  Sigma, 
  Minus,
  AlertCircle,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  Keyboard,
  GitBranch,
  LayoutTemplate,
  Image as ImageIcon,
  Braces,
  Tag,
  Bookmark,
  FileDown,
  Printer,
  Sliders,
  Sparkles
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  shortcut: string;
  insertSnippet: string;
}

export const COMMANDS: CommandItem[] = [
  {
    id: 'clean-markdown',
    title: 'Clean & Format Markdown',
    description: 'Repair fragmented lines, clean metrics & normalize spacing',
    icon: Sparkles,
    shortcut: '/clean',
    insertSnippet: '__ACTION_CLEAN_FORMAT__'
  },
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Main section title',
    icon: Heading1,
    shortcut: '#',
    insertSnippet: '# Heading 1\n'
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Sub-section heading',
    icon: Heading2,
    shortcut: '##',
    insertSnippet: '## Heading 2\n'
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Small sub-heading',
    icon: Heading3,
    shortcut: '###',
    insertSnippet: '### Heading 3\n'
  },
  {
    id: 'checklist',
    title: 'Task Checklist',
    description: 'Interactive todo list item',
    icon: CheckSquare,
    shortcut: '- [ ]',
    insertSnippet: '- [ ] New task\n- [ ] Follow-up task\n'
  },
  {
    id: 'bullet-list',
    title: 'Bullet List',
    description: 'Simple un-ordered list',
    icon: List,
    shortcut: '-',
    insertSnippet: '- List item 1\n- List item 2\n- List item 3\n'
  },
  {
    id: 'numbered-list',
    title: 'Numbered List',
    description: 'Sequential ordered list',
    icon: ListOrdered,
    shortcut: '1.',
    insertSnippet: '1. Step one\n2. Step two\n3. Step three\n'
  },
  {
    id: 'code-block',
    title: 'Code Block',
    description: 'Syntax highlighted code',
    icon: Code2,
    shortcut: '```',
    insertSnippet: '```typescript\n// Write your code here\nconst greeting = "Hello, MD Writer!";\nconsole.log(greeting);\n```\n'
  },
  {
    id: 'callout-note',
    title: 'Alert Note',
    description: 'GitHub-style note callout box',
    icon: AlertCircle,
    shortcut: '/note',
    insertSnippet: '> [!NOTE]\n> Write your note or key context here.\n'
  },
  {
    id: 'callout-tip',
    title: 'Alert Tip',
    description: 'GitHub-style helpful tip callout',
    icon: Lightbulb,
    shortcut: '/tip',
    insertSnippet: '> [!TIP]\n> Write your helpful tip here.\n'
  },
  {
    id: 'callout-warning',
    title: 'Alert Warning',
    description: 'GitHub-style cautionary warning',
    icon: AlertTriangle,
    shortcut: '/warning',
    insertSnippet: '> [!WARNING]\n> Write your cautionary warning here.\n'
  },
  {
    id: 'details',
    title: 'Collapsible Accordion',
    description: 'Expandable spoiler / details section',
    icon: ChevronDown,
    shortcut: '/details',
    insertSnippet: '<details>\n<summary>Click to view details</summary>\n\nHidden details and specifications go here.\n\n</details>\n'
  },
  {
    id: 'kbd',
    title: 'Keyboard Shortcut',
    description: 'Styled keycap combination badge',
    icon: Keyboard,
    shortcut: '/kbd',
    insertSnippet: '<kbd>Ctrl</kbd> + <kbd>K</kbd>'
  },
  {
    id: 'mermaid',
    title: 'Mermaid Flowchart',
    description: 'Architecture diagram & sequence chart',
    icon: GitBranch,
    shortcut: '/mermaid',
    insertSnippet: '```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result 1]\n    B -->|No| D[Result 2]\n```\n'
  },
  {
    id: 'template',
    title: 'Insert Template',
    description: 'Choose from 8 curated blueprints',
    icon: LayoutTemplate,
    shortcut: '/template',
    insertSnippet: '__ACTION_OPEN_TEMPLATES__'
  },
  {
    id: 'quote',
    title: 'Blockquote',
    description: 'Highlighted quote passage',
    icon: Quote,
    shortcut: '>',
    insertSnippet: '> Write your quotation or insight here.\n'
  },
  {
    id: 'table-builder',
    title: 'Visual Table Builder',
    description: 'Design custom rows & columns in a grid',
    icon: Table2,
    shortcut: '/table',
    insertSnippet: '__ACTION_OPEN_TABLE_BUILDER__'
  },
  {
    id: 'table',
    title: '3x3 Quick Table',
    description: 'Formatted markdown table',
    icon: Table2,
    shortcut: 'table',
    insertSnippet: '\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Alpha | Feature A | Active |\n| Beta | Feature B | Ready |\n| Gamma | Feature C | Done |\n\n'
  },
  {
    id: 'math-studio',
    title: 'KaTeX Formula Studio',
    description: 'Predefined formulas library (Calculus, Algebra, Physics, Stats)',
    icon: Sigma,
    shortcut: '/math',
    insertSnippet: '__ACTION_OPEN_MATH_STUDIO__'
  },
  {
    id: 'math',
    title: 'Raw Math Formula (KaTeX)',
    description: 'Insert raw LaTeX equation block',
    icon: Sigma,
    shortcut: '$$',
    insertSnippet: '$$\nE = mc^2\n$$\n'
  },
  {
    id: 'image',
    title: 'Embed Image Studio',
    description: 'Upload local image (compressed offline) or enter web URL',
    icon: ImageIcon,
    shortcut: '/image',
    insertSnippet: '__ACTION_OPEN_IMAGE_MODAL__'
  },
  {
    id: 'api-json',
    title: 'API Response (JSON)',
    description: 'Structured REST JSON mock response with status & schema',
    icon: Braces,
    shortcut: '/json /api',
    insertSnippet: '```json\n{\n  "status": 200,\n  "message": "Success",\n  "data": {\n    "id": "item_101",\n    "name": "Production Resource",\n    "active": true\n  }\n}\n```\n'
  },
  {
    id: 'badge-status',
    title: 'Status Badges',
    description: 'Visual status badges (Active, Passing, v1.0)',
    icon: Tag,
    shortcut: '/badge /status',
    insertSnippet: '![Status: Active](https://img.shields.io/badge/status-active-emerald?style=flat-square) ![Build: Passing](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square) ![Version: 1.0.0](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)\n\n'
  },
  {
    id: 'footnote',
    title: 'Footnote & Citation',
    description: 'Inline reference citation badge with matching definition',
    icon: Bookmark,
    shortcut: '/footnote /fn',
    insertSnippet: '[^1]\n\n[^1]: Explanatory citation or reference source.\n'
  },
  {
    id: 'export-md',
    title: 'Export Markdown (.md)',
    description: 'Directly download current document as a .md file',
    icon: FileDown,
    shortcut: '/exportmd',
    insertSnippet: '__ACTION_EXPORT_MD__'
  },
  {
    id: 'export-pdf',
    title: 'Export to PDF Studio',
    description: 'Open publication-ready PDF toolbar with themes & cover styling',
    icon: Printer,
    shortcut: '/exportpdf',
    insertSnippet: '__ACTION_OPEN_PDF_STUDIO__'
  },
  {
    id: 'yaml-frontmatter',
    title: 'YAML Front Matter',
    description: 'Metadata header for Jekyll, Hugo, Astro & Obsidian',
    icon: Sliders,
    shortcut: '/yaml /frontmatter',
    insertSnippet: '__ACTION_INSERT_FRONTMATTER__'
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Horizontal rule separator',
    icon: Minus,
    shortcut: '---',
    insertSnippet: '\n---\n\n'
  }
];

interface SlashCommandMenuProps {
  isOpen: boolean;
  selectedIndex: number;
  searchQuery: string;
  onSelect: (snippet: string) => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen,
  selectedIndex,
  searchQuery,
  onSelect
}) => {
  const activeItemRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.shortcut.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll the selected item into view whenever selectedIndex changes
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex, filteredCommands.length]);

  if (!isOpen) return null;

  return (
    <div 
      data-slash-menu="true" 
      className="fixed md:absolute bottom-0 md:bottom-12 left-0 md:left-6 right-0 md:right-auto z-50 md:z-40 w-full md:w-80 bg-white dark:bg-neutral-900 border-t md:border border-neutral-200 dark:border-neutral-800 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-150 select-none max-h-[70vh]"
    >
      
      {/* Menu Header with Query Indicator */}
      <div className="px-3.5 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/40 text-xs">
        <span className="font-semibold text-neutral-600 dark:text-neutral-300">
          Markdown Blocks {searchQuery ? `("${searchQuery}")` : ''}
        </span>
        <span className="text-[10px] text-neutral-400 bg-neutral-200/60 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">
          ESC to cancel
        </span>
      </div>

      {/* Commands List */}
      <div ref={listContainerRef} className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 scroll-smooth">
        {filteredCommands.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-400">
            No matching blocks for "{searchQuery}"
          </div>
        ) : (
          filteredCommands.map((cmd, idx) => {
            const Icon = cmd.icon;
            const isSelected = idx === (selectedIndex % filteredCommands.length);
            return (
              <div
                key={cmd.id}
                data-slash-item="true"
                data-selected={isSelected ? 'true' : 'false'}
                ref={isSelected ? activeItemRef : undefined}
                onClick={() => onSelect(cmd.insertSnippet)}
                className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected 
                      ? 'bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-950' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs">{cmd.title}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                      {cmd.description}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isSelected 
                    ? 'bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-900' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                }`}>
                  {cmd.shortcut}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation Tip */}
      <div className="px-3.5 py-1.5 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
        <span>Press <strong className="text-neutral-600 dark:text-neutral-300">↑ ↓</strong> to choose</span>
        <span><strong className="text-neutral-600 dark:text-neutral-300">↵ Enter</strong> to insert</span>
      </div>
    </div>
  );
};
