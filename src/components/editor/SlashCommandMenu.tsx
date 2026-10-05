import React, { useEffect, useRef } from 'react';
import { Command, X } from 'lucide-react';
import { DynamicIcon, type IconName } from '../common/DynamicIcon';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ElementType;
  iconName: IconName | string;
  shortcut: string;
  insertSnippet: string;
  category: 'Structure' | 'Rich Blocks' | 'Callouts' | 'Media & Tools';
}

export const COMMANDS: CommandItem[] = [
  // 1. Structure
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Top-level document heading',
    iconName: 'heading-1',
    shortcut: '#',
    insertSnippet: '# Heading 1\n',
    category: 'Structure',
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Sub-section heading',
    iconName: 'heading-2',
    shortcut: '##',
    insertSnippet: '## Heading 2\n',
    category: 'Structure',
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Small sub-heading',
    iconName: 'heading-3',
    shortcut: '###',
    insertSnippet: '### Heading 3\n',
    category: 'Structure',
  },
  {
    id: 'checklist',
    title: 'Task Checklist',
    description: 'Interactive todo checkboxes',
    iconName: 'check-square',
    shortcut: '- [ ]',
    insertSnippet: '- [ ] Action item 1\n- [ ] Action item 2\n',
    category: 'Structure',
  },
  {
    id: 'bullet-list',
    title: 'Bullet List',
    description: 'Standard unordered bullet points',
    iconName: 'list',
    shortcut: '-',
    insertSnippet: '- Bullet point 1\n- Bullet point 2\n- Bullet point 3\n',
    category: 'Structure',
  },
  {
    id: 'numbered-list',
    title: 'Numbered List',
    description: 'Sequential ordered steps',
    iconName: 'list-ordered',
    shortcut: '1.',
    insertSnippet: '1. Step one\n2. Step two\n3. Step three\n',
    category: 'Structure',
  },
  {
    id: 'quote',
    title: 'Blockquote',
    description: 'Indented quotation block',
    iconName: 'quote',
    shortcut: '>',
    insertSnippet: '> Write your quotation or insight here.\n',
    category: 'Structure',
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Horizontal rule line',
    iconName: 'minus',
    shortcut: '---',
    insertSnippet: '\n---\n\n',
    category: 'Structure',
  },

  // 2. Rich Blocks
  {
    id: 'code-block',
    title: 'Code Block',
    description: 'Fenced code with syntax highlight',
    iconName: 'code-2',
    shortcut: '```',
    insertSnippet: '```typescript\n// Write your code here\nconst greeting = "Hello, MD Writer!";\nconsole.log(greeting);\n```\n',
    category: 'Rich Blocks',
  },
  {
    id: 'table-builder',
    title: 'Visual Table Builder',
    description: 'Interactive modal table designer',
    iconName: 'table-2',
    shortcut: '/table',
    insertSnippet: '__ACTION_OPEN_TABLE_BUILDER__',
    category: 'Rich Blocks',
  },
  {
    id: 'table',
    title: '3x3 Quick Table',
    description: 'Standard markdown pipe table',
    iconName: 'table-2',
    shortcut: 'table',
    insertSnippet: '\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Alpha | Feature A | Active |\n| Beta | Feature B | Ready |\n| Gamma | Feature C | Done |\n\n',
    category: 'Rich Blocks',
  },
  {
    id: 'math-studio',
    title: 'Formula Studio',
    description: 'Interactive KaTeX equation builder',
    iconName: 'sigma',
    shortcut: '/math',
    insertSnippet: '__ACTION_OPEN_MATH_STUDIO__',
    category: 'Rich Blocks',
  },
  {
    id: 'math',
    title: 'LaTeX Formula',
    description: 'Raw KaTeX math block',
    iconName: 'sigma',
    shortcut: '$$',
    insertSnippet: '$$\nE = mc^2\n$$\n',
    category: 'Rich Blocks',
  },
  {
    id: 'mermaid',
    title: 'Mermaid Diagram',
    description: 'Architecture flowchart & sequence graph',
    iconName: 'git-branch',
    shortcut: '/mermaid',
    insertSnippet: '```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result 1]\n    B -->|No| D[Result 2]\n```\n',
    category: 'Rich Blocks',
  },
  {
    id: 'highlight',
    title: 'Text Highlight',
    description: 'Mark passage (==text==)',
    iconName: 'highlighter',
    shortcut: '/hl',
    insertSnippet: '==highlighted text==',
    category: 'Rich Blocks',
  },

  // 3. GitHub Callouts
  {
    id: 'callout-note',
    title: 'Note Callout',
    description: 'GitHub-style blue note box',
    iconName: 'info',
    shortcut: '/note',
    insertSnippet: '> [!NOTE]\n> Key context or background information.\n',
    category: 'Callouts',
  },
  {
    id: 'callout-tip',
    title: 'Tip Callout',
    description: 'Helpful advice or optimization tip',
    iconName: 'lightbulb',
    shortcut: '/tip',
    insertSnippet: '> [!TIP]\n> Pro-tip or best practice recommendation.\n',
    category: 'Callouts',
  },
  {
    id: 'callout-important',
    title: 'Important Callout',
    description: 'Essential requirement or must-read notice',
    iconName: 'alert-circle',
    shortcut: '/important',
    insertSnippet: '> [!IMPORTANT]\n> Crucial information to remember.\n',
    category: 'Callouts',
  },
  {
    id: 'callout-warning',
    title: 'Warning Callout',
    description: 'Cautionary advisory or breaking change',
    iconName: 'alert-triangle',
    shortcut: '/warning',
    insertSnippet: '> [!WARNING]\n> Breaking changes or potential hazards.\n',
    category: 'Callouts',
  },
  {
    id: 'callout-caution',
    title: 'Caution Callout',
    description: 'High-risk action warning',
    iconName: 'shield-alert',
    shortcut: '/caution',
    insertSnippet: '> [!CAUTION]\n> Danger of data loss or security risk.\n',
    category: 'Callouts',
  },

  // 4. Media & Tools
  {
    id: 'image',
    title: 'Embed Image',
    description: 'Upload local image or embed URL',
    iconName: 'image',
    shortcut: '/image',
    insertSnippet: '__ACTION_OPEN_IMAGE_MODAL__',
    category: 'Media & Tools',
  },
  {
    id: 'templates',
    title: 'Template Library',
    description: 'Choose ready-made markdown templates',
    iconName: 'sparkles',
    shortcut: '/template',
    insertSnippet: '__ACTION_OPEN_TEMPLATES__',
    category: 'Media & Tools',
  },
  {
    id: 'pdf-studio',
    title: 'Export PDF Studio',
    description: 'Print preview & PDF pagination studio',
    iconName: 'file-down',
    shortcut: '/pdf',
    insertSnippet: '__ACTION_OPEN_PDF_STUDIO__',
    category: 'Media & Tools',
  },
];

export interface CaretCoords {
  left: number;
  top: number;
  bottom: number;
}

interface SlashCommandMenuProps {
  isOpen: boolean;
  selectedIndex: number;
  searchQuery: string;
  onSelect: (snippet: string) => void;
  onClose?: () => void;
  caretCoords?: CaretCoords | null;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen,
  selectedIndex,
  searchQuery,
  onSelect,
  onClose,
  caretCoords,
}) => {
  const activeItemRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Compute cursor-anchored position
  const menuWidth = 300;
  const menuHeight = 280;

  let positionStyle: React.CSSProperties = {};
  if (caretCoords) {
    const isTopPlacement = (caretCoords.top - menuHeight) > 55;
    const top = isTopPlacement ? caretCoords.top - 8 : caretCoords.bottom + 8;
    const transform = isTopPlacement ? 'translateY(-100%)' : 'translateY(0)';
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const clampedLeft = Math.max(12, Math.min(windowWidth - menuWidth - 12, caretCoords.left));

    positionStyle = {
      position: 'fixed',
      left: `${clampedLeft}px`,
      top: `${top}px`,
      transform,
      width: `${menuWidth}px`,
    };
  }

  let lastCategory = '';

  return (
    <div 
      data-slash-menu="true" 
      style={caretCoords ? positionStyle : undefined}
      className={`z-50 select-none overflow-hidden rounded-xl bg-white/95 dark:bg-[#15121e]/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl shadow-black/20 flex flex-col p-1.5 animate-in fade-in zoom-in-95 duration-100 ${
        !caretCoords
          ? 'fixed bottom-14 left-4 right-4 sm:left-auto sm:right-auto sm:w-[300px] sm:bottom-16 sm:left-6'
          : ''
      }`}
    >
      {/* Sleek Minimal Header with Traffic Lights & Search Query */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-1 mr-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
          </div>
          <div className="w-4 h-4 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Command className="w-2.5 h-2.5" />
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {searchQuery ? `"${searchQuery}"` : 'Insert Block'}
          </span>
          <span className="text-[10px] font-mono text-neutral-400 shrink-0">
            ({filteredCommands.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <kbd className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200/60 dark:border-neutral-700/60">
            ESC
          </kbd>
          {onClose && (
            <button
              onClick={onClose}
              className="p-0.5 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Commands List - Categorized, Subtle Squarish Items */}
      <div 
        ref={listContainerRef} 
        className="max-h-60 overflow-y-auto overflow-x-hidden space-y-0.5 pr-0.5 scroll-smooth"
      >
        {filteredCommands.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
            No matching blocks for "{searchQuery}"
          </div>
        ) : (
          filteredCommands.map((cmd, idx) => {
            const isSelected = idx === (selectedIndex % filteredCommands.length);
            const showCategoryHeader = !searchQuery && cmd.category !== lastCategory;
            if (showCategoryHeader) {
              lastCategory = cmd.category;
            }

            return (
              <React.Fragment key={cmd.id}>
                {showCategoryHeader && (
                  <div className="px-2 pt-2 pb-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold select-none">
                    {cmd.category}
                  </div>
                )}
                <div
                  data-slash-item="true"
                  data-selected={isSelected ? 'true' : 'false'}
                  ref={isSelected ? activeItemRef : undefined}
                  onClick={() => onSelect(cmd.insertSnippet)}
                  className={`w-full px-2 py-1.5 rounded-md flex items-center justify-between transition-colors cursor-pointer gap-2 ${
                    isSelected
                      ? 'bg-brand-500/15 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/30 font-medium'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-brand-500 text-white shadow-xs' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <DynamicIcon name={cmd.iconName} className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate leading-tight font-medium">{cmd.title}</p>
                      <p className={`text-[10px] truncate leading-tight ${isSelected ? 'text-brand-600/80 dark:text-brand-300/80' : 'text-neutral-400 dark:text-neutral-500'}`}>
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${
                    isSelected 
                      ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-300 font-semibold' 
                      : 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200/50 dark:border-neutral-700/50 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {cmd.shortcut}
                  </span>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};
