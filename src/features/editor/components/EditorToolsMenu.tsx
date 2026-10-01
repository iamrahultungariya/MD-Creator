import React from 'react';
import {
  Sliders,
  ChevronDown,
  Printer,
  ListTree,
  Table2,
  Image as ImageIcon,
  LayoutTemplate,
  History,
  Timer,
  FileX,
  Trash2,
  Film,
} from 'lucide-react';

interface EditorToolsMenuProps {
  isOpen: boolean;
  setIsOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  onBeforeOpen?: () => void;
  onOpenPdfStudio: () => void;
  onOpenClipStudio?: () => void;
  isAdmin?: boolean;
  onOpenOutline: () => void;
  onOpenTableBuilder: () => void;
  onOpenImageModal?: () => void;
  onOpenTemplates: () => void;
  onOpenRevisions: () => void;
  onOpenSprintPopover: () => void;
  onClearContent: () => void;
  onDeleteCurrentDoc: () => void;
}

export const EditorToolsMenu: React.FC<EditorToolsMenuProps> = ({
  isOpen,
  setIsOpen,
  onBeforeOpen,
  onOpenPdfStudio,
  onOpenClipStudio,
  isAdmin,
  onOpenOutline,
  onOpenTableBuilder,
  onOpenImageModal,
  onOpenTemplates,
  onOpenRevisions,
  onOpenSprintPopover,
  onClearContent,
  onDeleteCurrentDoc,
}) => {
  return (
    <div className="relative">
      <button
        onClick={() => {
          onBeforeOpen?.();
          setIsOpen((prev) => !prev);
        }}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs'
            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
        }`}
        title="Writing tools, outline, tables, effects & templates"
      >
        <Sliders className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
        <span>Tools</span>
        <ChevronDown
          className={`w-3 h-3 text-neutral-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Writing Studio Tools
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenPdfStudio();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Print &amp; PDF Studio</div>
                  <div className="text-[10px] text-neutral-500">Publication PDF &amp; print formatting</div>
                </div>
              </div>
              <kbd className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md shadow-2xs">
                Ctrl+P
              </kbd>
            </button>

            {isAdmin && onOpenClipStudio && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenClipStudio();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span>Social Clip Studio</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30">
                        Admin
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500">Auto-zoom Reels, Threads &amp; X clips</div>
                  </div>
                </div>
                <kbd className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md shadow-2xs">
                  Ctrl+Alt+R
                </kbd>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenOutline();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <ListTree className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Document Outline</div>
                  <div className="text-[10px] text-neutral-500">Live H1–H6 table of contents</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">TOC</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenTableBuilder();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Table2 className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Table Builder</div>
                  <div className="text-[10px] text-neutral-500">Visual rows & columns designer</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">/table</span>
            </button>

            {onOpenImageModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenImageModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Embed Image Studio</div>
                    <div className="text-[10px] text-neutral-500">Offline upload or web link</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">/image</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenTemplates();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <LayoutTemplate className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Templates Library</div>
                  <div className="text-[10px] text-neutral-500">8 curated specs, PRDs & notes</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">8 Presets</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenRevisions();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Revision History</div>
                  <div className="text-[10px] text-neutral-500">IndexedDB checkpoints & rollback</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">History</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSprintPopover();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Timer className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Focus Sprint Timer</div>
                  <div className="text-[10px] text-neutral-500">Pomodoro focus sprint mode</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">25m</span>
            </button>

            <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                onClearContent();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-between text-amber-600 dark:text-amber-400 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FileX className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400">Clear Content...</div>
                  <div className="text-[10px] text-neutral-500">Wipe current markdown text</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Clear</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onDeleteCurrentDoc();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-between text-red-600 dark:text-red-400 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-red-500" />
                <div>
                  <div className="font-semibold text-red-700 dark:text-red-400">Delete Document...</div>
                  <div className="text-[10px] text-neutral-500">Move to Recycle Bin</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Del</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
