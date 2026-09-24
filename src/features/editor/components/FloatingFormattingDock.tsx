import React from 'react';
import { 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote 
} from 'lucide-react';

export type FormatAction = 
  | 'bold' 
  | 'italic' 
  | 'strike' 
  | 'code' 
  | 'link' 
  | 'bullet' 
  | 'ordered' 
  | 'quote';

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

  const actions: { id: FormatAction; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      id: 'bold',
      label: 'B',
      icon: <span className="font-bold text-xs font-serif leading-none">B</span>,
      tooltip: 'Bold (Ctrl+B)',
    },
    {
      id: 'italic',
      label: 'I',
      icon: <span className="italic text-xs font-serif leading-none font-medium">I</span>,
      tooltip: 'Italic (Ctrl+I)',
    },
    {
      id: 'strike',
      label: 'S',
      icon: <span className="line-through text-xs font-serif leading-none font-medium">S</span>,
      tooltip: 'Strikethrough (~~text~~)',
    },
    {
      id: 'code',
      label: '</>',
      icon: <span className="font-mono text-[11px] font-semibold tracking-tighter leading-none">&lt;/&gt;</span>,
      tooltip: 'Inline Code / Code Block',
    },
    {
      id: 'link',
      label: 'Link',
      icon: <LinkIcon className="w-3.5 h-3.5" />,
      tooltip: 'Insert Link (Ctrl+K)',
    },
    {
      id: 'bullet',
      label: 'Bullet List',
      icon: <List className="w-3.5 h-3.5" />,
      tooltip: 'Bullet List (- )',
    },
    {
      id: 'ordered',
      label: 'Ordered List',
      icon: <ListOrdered className="w-3.5 h-3.5" />,
      tooltip: 'Numbered List (1. )',
    },
    {
      id: 'quote',
      label: 'Quote',
      icon: <Quote className="w-3.5 h-3.5" />,
      tooltip: 'Blockquote (> )',
    },
  ];

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
          ? 'opacity-100 scale-100 pointer-events-auto shadow-2xl'
          : 'opacity-0 scale-95 pointer-events-none'
      } ${className}`}
    >
      <div className="flex items-center gap-0.5 sm:gap-1 px-2 py-1 rounded-2xl bg-neutral-900/95 dark:bg-[#141416]/95 text-neutral-300 backdrop-blur-md border border-neutral-800/80 shadow-2xl shadow-black/30">
        {actions.map((act, index) => (
          <React.Fragment key={act.id}>
            {index === 4 && (
              <div className="h-3.5 w-px bg-neutral-800 mx-0.5" />
            )}
            <button
              type="button"
              onMouseDown={(e) => {
                // Prevent blurring the CodeMirror editor selection
                e.preventDefault();
                onFormat(act.id);
              }}
              title={act.tooltip}
              aria-label={act.tooltip}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all cursor-pointer"
            >
              {act.icon}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
