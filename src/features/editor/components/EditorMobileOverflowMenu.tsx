import React from 'react';
import {
  MoreVertical,
  FolderOpen,
  FolderTree,
  Globe,
  Info,
  Printer,
  ListTree,
  Table2,
  Image as ImageIcon,
  LayoutTemplate,
  History,
  Sliders,
  FileX,
  Trash2,
} from 'lucide-react';

interface EditorMobileOverflowMenuProps {
  isOpen: boolean;
  setIsOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  onBeforeOpen?: () => void;
  onOpenSwitcher: () => void;
  onOpenLocalFolder?: () => void;
  onOpenPublish?: () => void;
  onOpenDrawer: () => void;
  onOpenPdfStudio: () => void;
  onOpenOutline: () => void;
  onOpenTableBuilder: () => void;
  onOpenImageModal?: () => void;
  onOpenTemplates: () => void;
  onOpenRevisions: () => void;
  onOpenSprintPopover: () => void;
  onClearContent: () => void;
  onDeleteCurrentDoc: () => void;
}

export const EditorMobileOverflowMenu: React.FC<EditorMobileOverflowMenuProps> = ({
  isOpen,
  setIsOpen,
  onBeforeOpen,
  onOpenSwitcher,
  onOpenLocalFolder,
  onOpenPublish,
  onOpenDrawer,
  onOpenPdfStudio,
  onOpenOutline,
  onOpenTableBuilder,
  onOpenImageModal,
  onOpenTemplates,
  onOpenRevisions,
  onOpenSprintPopover: _onOpenSprintPopover,
  onClearContent,
  onDeleteCurrentDoc,
}) => {
  return (
    <div className="sm:hidden relative">
      <button
        onClick={() => {
          onBeforeOpen?.();
          setIsOpen((prev) => !prev);
        }}
        className={`min-h-[44px] min-w-[44px] p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs font-sans ${
          isOpen
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs'
            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
        }`}
        title="More Actions & Tools"
        aria-label="More Actions and Tools"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Mobile Overflow Menu Sheet */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 max-h-[80vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-1 font-sans">
            {/* File & Publishing Section */}
            <div className="px-2.5 py-1 text-[11px] font-semibold text-neutral-400 font-sans">
              Document &amp; Storage
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSwitcher();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-neutral-500" />
                <span className="font-semibold text-neutral-900 dark:text-white">Document Switcher</span>
              </div>
              <kbd className="text-[10px] font-sans font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md shadow-2xs">Ctrl+O</kbd>
            </button>

            {onOpenLocalFolder && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLocalFolder();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
              >
                <FolderTree className="w-4 h-4 text-neutral-500" />
                <span className="font-semibold text-neutral-900 dark:text-white">Local Vault / Folder</span>
              </button>
            )}

            {onOpenPublish && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPublish();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
              >
                <Globe className="w-4 h-4 text-brand-500" />
                <span className="font-semibold text-neutral-900 dark:text-white">Publish to Web Link</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenDrawer();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
            >
              <Info className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">Document Details &amp; Tags</span>
            </button>

            <div className="border-t border-neutral-100 dark:border-neutral-800 my-1.5" />

            {/* Studio Tools Section */}
            <div className="px-2.5 py-1 text-[11px] font-semibold text-neutral-400 font-sans">
              Writing &amp; Export Tools
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenPdfStudio();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-neutral-500" />
                <span className="font-semibold text-neutral-900 dark:text-white">Print &amp; PDF Studio</span>
              </div>
              <kbd className="text-[10px] font-sans font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md shadow-2xs">Ctrl+P</kbd>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenOutline();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
            >
              <ListTree className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">Document Outline (TOC)</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenTableBuilder();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
            >
              <Table2 className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">Table Builder</span>
            </button>

            {onOpenImageModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenImageModal();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
              >
                <ImageIcon className="w-4 h-4 text-neutral-500" />
                <span className="font-semibold text-neutral-900 dark:text-white">Embed Image Studio</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenTemplates();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
            >
              <LayoutTemplate className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">Templates Library</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenRevisions();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
            >
              <History className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">Revision History</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent('open-preferences-modal'));
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300 cursor-pointer font-sans"
            >
              <Sliders className="w-4 h-4 text-brand-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">Preferences</span>
            </button>

            <div className="border-t border-neutral-100 dark:border-neutral-800 my-1.5" />

            <button
              onClick={() => {
                setIsOpen(false);
                onClearContent();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2.5 text-amber-600 dark:text-amber-400 cursor-pointer font-sans"
            >
              <FileX className="w-4 h-4 text-amber-500" />
              <span className="font-semibold">Clear Content...</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onDeleteCurrentDoc();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 text-red-600 dark:text-red-400 cursor-pointer font-sans"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="font-semibold">Delete Document...</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
