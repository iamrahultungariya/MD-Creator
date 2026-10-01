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
  GitBranch,
  Image as ImageIcon,
  Highlighter,
  Command,
  X
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
    description: 'Interactive todo item',
    icon: CheckSquare,
    shortcut: '- [ ]',
    insertSnippet: '- [ ] New task\n- [ ] Follow-up task\n'
  },
  {
    id: 'bullet-list',
    title: 'Bullet List',
    description: 'Un-ordered list',
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
    id: 'quote',
    title: 'Blockquote',
    description: 'Highlighted quotation',
    icon: Quote,
    shortcut: '>',
    insertSnippet: '> Write your quotation or insight here.\n'
  },
  {
    id: 'highlight',
    title: 'Text Highlight',
    description: 'Highlight key passage (==text==)',
    icon: Highlighter,
    shortcut: '/hl',
    insertSnippet: '==highlighted text=='
  },
  {
    id: 'table-builder',
    title: 'Visual Table Builder',
    description: 'Interactive grid designer',
    icon: Table2,
    shortcut: '/table',
    insertSnippet: '__ACTION_OPEN_TABLE_BUILDER__'
  },
  {
    id: 'table',
    title: '3x3 Quick Table',
    description: 'Markdown pipe table',
    icon: Table2,
    shortcut: 'table',
    insertSnippet: '\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Alpha | Feature A | Active |\n| Beta | Feature B | Ready |\n| Gamma | Feature C | Done |\n\n'
  },
  {
    id: 'math-studio',
    title: 'Formula Studio',
    description: 'KaTeX library presets',
    icon: Sigma,
    shortcut: '/math',
    insertSnippet: '__ACTION_OPEN_MATH_STUDIO__'
  },
  {
    id: 'math',
    title: 'LaTeX Formula',
    description: 'Raw KaTeX math block',
    icon: Sigma,
    shortcut: '$$',
    insertSnippet: '$$\nE = mc^2\n$$\n'
  },
  {
    id: 'image',
    title: 'Embed Image',
    description: 'Upload local or URL',
    icon: ImageIcon,
    shortcut: '/image',
    insertSnippet: '__ACTION_OPEN_IMAGE_MODAL__'
  },
  {
    id: 'callout-note',
    title: 'Note Callout',
    description: 'GitHub-style note box',
    icon: AlertCircle,
    shortcut: '/note',
    insertSnippet: '> [!NOTE]\n> Write your note or key context here.\n'
  },
  {
    id: 'callout-tip',
    title: 'Tip Callout',
    description: 'Helpful advice callout',
    icon: Lightbulb,
    shortcut: '/tip',
    insertSnippet: '> [!TIP]\n> Write your helpful tip here.\n'
  },
  {
    id: 'callout-warning',
    title: 'Warning Callout',
    description: 'Cautionary callout',
    icon: AlertTriangle,
    shortcut: '/warning',
    insertSnippet: '> [!WARNING]\n> Write your cautionary warning here.\n'
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Horizontal separator',
    icon: Minus,
    shortcut: '---',
    insertSnippet: '\n---\n\n'
  },
  {
    id: 'mermaid',
    title: 'Mermaid Diagram',
    description: 'Architecture flowchart',
    icon: GitBranch,
    shortcut: '/mermaid',
    insertSnippet: '```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result 1]\n    B -->|No| D[Result 2]\n```\n'
  }
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

  // Compute cursor-anchored position
  const menuWidth = 280;
  const menuHeight = 260;

  let positionStyle: React.CSSProperties = {};
  if (caretCoords) {
    const isTopPlacement = (caretCoords.top - menuHeight) > 55;
    const top = isTopPlacement ? caretCoords.top - 8 : caretCoords.bottom + 8;
    const transform = isTopPlacement ? 'translateY(-100%)' : 'translateY(0)';
    // Clamp left so it never clips on screen borders
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

  return (
    <div 
      data-slash-menu="true" 
      style={caretCoords ? positionStyle : undefined}
      className={`z-50 select-none overflow-hidden rounded-2xl bg-white/95 dark:bg-[#15111E]/95 backdrop-blur-xl border border-neutral-200/90 dark:border-[#2A2338] shadow-2xl shadow-black/25 flex flex-col p-2 animate-in fade-in zoom-in-95 duration-100 ${
        !caretCoords
          ? 'fixed bottom-14 left-4 right-4 sm:left-auto sm:right-auto sm:w-[280px] sm:bottom-16 sm:left-6'
          : ''
      }`}
    >
      {/* Sleek Minimal Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Command className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate">
            {searchQuery ? `"${searchQuery}"` : 'Blocks'}
          </span>
          <span className="text-[10px] font-mono text-neutral-400 shrink-0">
            ({filteredCommands.length})
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
            ESC
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-0.5 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Commands List - Compact & Contained */}
      <div 
        ref={listContainerRef} 
        className="max-h-56 overflow-y-auto overflow-x-hidden space-y-0.5 pr-0.5 scroll-smooth"
      >
        {filteredCommands.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
            No blocks for "{searchQuery}"
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
                className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer gap-2 ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-xs font-medium'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate leading-tight">{cmd.title}</p>
                    <p className={`text-[10px] truncate leading-tight ${isSelected ? 'text-white/80' : 'text-neutral-400 dark:text-neutral-500'}`}>
                      {cmd.description}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  isSelected 
                    ? 'bg-white/25 text-white' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}>
                  {cmd.shortcut}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
