import React from 'react';
import { 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote,
  Highlighter,
  CheckSquare,
  Minus
} from 'lucide-react';
import { useToolbarSettingsStore, FormatAction } from '../../../stores/useToolbarSettingsStore';

export type { FormatAction };

export interface DockCoords {
  left: number;
  top: number;
  placement: 'top' | 'bottom';
}

interface FloatingFormattingDockProps {
  onFormat: (action: FormatAction) => void;
  className?: string;
  isVisible?: boolean;
  coords: DockCoords | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ACTION_ICON_MAP: Record<FormatAction, { label: string; icon: React.ReactNode; tooltip: string }> = {
  h1: {
    label: 'H1',
    icon: <span className="font-black text-xs font-sans leading-none tracking-tight">H1</span>,
    tooltip: 'Heading 1 (Ctrl+1)',
  },
  h2: {
    label: 'H2',
    icon: <span className="font-black text-xs font-sans leading-none tracking-tight">H2</span>,
    tooltip: 'Heading 2 (Ctrl+2)',
  },
  h3: {
    label: 'H3',
    icon: <span className="font-black text-xs font-sans leading-none tracking-tight">H3</span>,
    tooltip: 'Heading 3 (Ctrl+3)',
  },
  bold: {
    label: 'B',
    icon: <span className="font-black text-xs font-sans leading-none">B</span>,
    tooltip: 'Bold (Ctrl+B)',
  },
  italic: {
    label: 'I',
    icon: <span className="italic text-xs font-sans leading-none font-bold">I</span>,
    tooltip: 'Italic (Ctrl+I)',
  },
  strike: {
    label: 'S',
    icon: <span className="line-through text-xs font-sans leading-none font-semibold">S</span>,
    tooltip: 'Strikethrough (~~text~~)',
  },
  highlight: {
    label: 'HL',
    icon: <Highlighter className="w-3.5 h-3.5" />,
    tooltip: 'Highlight (==text==)',
  },
  code: {
    label: '</>',
    icon: <span className="font-sans text-[11px] font-bold tracking-tight leading-none">&lt;/&gt;</span>,
    tooltip: 'Inline Code / Code Block',
  },
  link: {
    label: 'Link',
    icon: <LinkIcon className="w-3.5 h-3.5" />,
    tooltip: 'Insert Link (Ctrl+K)',
  },
  quote: {
    label: 'Quote',
    icon: <Quote className="w-3.5 h-3.5" />,
    tooltip: 'Blockquote (> )',
  },
  bullet: {
    label: 'Bullet List',
    icon: <List className="w-3.5 h-3.5" />,
    tooltip: 'Bullet List (- )',
  },
  ordered: {
    label: 'Ordered List',
    icon: <ListOrdered className="w-3.5 h-3.5" />,
    tooltip: 'Numbered List (1. )',
  },
  task: {
    label: 'Task List',
    icon: <CheckSquare className="w-3.5 h-3.5" />,
    tooltip: 'Todo Checkbox (- [ ] )',
  },
  hr: {
    label: 'Divider',
    icon: <Minus className="w-3.5 h-3.5" />,
    tooltip: 'Horizontal Rule (---)',
  },
};

export const FloatingFormattingDock: React.FC<FloatingFormattingDockProps> = ({
  onFormat,
  className = '',
  isVisible = true,
  coords,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const shouldShow = Boolean(coords && (isVisible || isHovered));
  const { enabledActions } = useToolbarSettingsStore();

  if (!coords) return null;

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onMouseLeave?.();
      }}
      style={{
        position: 'fixed',
        left: `${coords.left}px`,
        top: `${coords.top}px`,
        transform: `translate(-50%, ${coords.placement === 'bottom' ? '0%' : '-100%'})`,
      }}
      className={`z-40 transition-all duration-200 ease-out select-none ${
        shouldShow
          ? 'opacity-100 scale-100 pointer-events-auto'
          : 'opacity-0 scale-95 pointer-events-none'
      } ${className}`}
    >
      {/* Light & Dark Theme Followed Pristinely */}
      <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-1 rounded-xl bg-white/95 dark:bg-[#18181c]/95 text-neutral-700 dark:text-neutral-200 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800/90 shadow-xl dark:shadow-2xl font-sans">
        {enabledActions.map((actionId) => {
          const act = ACTION_ICON_MAP[actionId];
          if (!act) return null;

          return (
            <button
              key={actionId}
              type="button"
              onMouseDown={(e) => {
                // Prevent blurring the CodeMirror editor selection
                e.preventDefault();
                onFormat(actionId);
              }}
              title={act.tooltip}
              aria-label={act.tooltip}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/80 dark:hover:bg-brand-950/40 active:scale-95 transition-all cursor-pointer shrink-0 font-sans"
            >
              {act.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
