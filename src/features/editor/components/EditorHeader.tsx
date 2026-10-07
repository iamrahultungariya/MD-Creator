import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Columns, 
  PenTool, 
  Eye, 
  FileText, 
  Info, 
  ChevronDown, 
  FolderOpen, 
  Presentation,
  Globe, 
  FolderTree,
  Printer,
  Check,
  Cloud
} from 'lucide-react';
import { ViewMode } from '../types';
import { DocumentMetadata } from '../../../db';
import { PwaInstallButton } from '../../../components/common/PwaInstallButton';
import { EditorMobileOverflowMenu } from './EditorMobileOverflowMenu';
import { EditorToolsMenu } from './EditorToolsMenu';
import { useAuthStore } from '../../../stores/useAuthStore';

interface EditorHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  isSaved: boolean;
  isSaving: boolean;
  isOffline?: boolean;
  executeSave: (content: string, title: string) => void;
  docMetadata: DocumentMetadata | null;
  onOpenSwitcher: () => void;
  onOpenDrawer: () => void;
  onOpenPdfStudio: () => void;
  onOpenClipStudio?: () => void;
  onOpenSocialCard?: () => void;
  isAdmin?: boolean;
  onOpenTableBuilder: () => void;
  onOpenImageModal?: () => void;
  onOpenOutline: () => void;
  onOpenTemplates: () => void;
  onOpenRevisions: () => void;
  onOpenSprintPopover: () => void;
  onExportMd: () => void;
  onExportDocx?: () => void;
  onCopyMarkdown: () => void;
  onClearContent: () => void;
  onDeleteCurrentDoc: () => void;
  isToolsMenuOpen: boolean;
  setIsToolsMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isExportMenuOpen?: boolean;
  setIsExportMenuOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
  onOpenPublish?: () => void;
  onOpenLocalFolder?: () => void;
  onOpenAuth?: () => void;
  mobileTab?: 'edit' | 'preview';
  onSelectMobileTab?: (tab: 'edit' | 'preview') => void;
}

interface ModeOptionItem {
  id: ViewMode;
  mode: ViewMode;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ALL_MODE_OPTIONS: ModeOptionItem[] = [
  { id: 'split', mode: 'split', label: 'Split Mode', desc: 'Editor & Live Preview', icon: Columns },
  { id: 'write', mode: 'write', label: 'Writing Mode', desc: 'Distraction-free canvas', icon: PenTool },
  { id: 'read', mode: 'read', label: 'Reader Mode', desc: 'Eye-comfort reading view', icon: Eye },
  { id: 'present', mode: 'present', label: 'Presentation Deck', desc: 'Interactive slide deck', icon: Presentation },
];

export const EditorHeader: React.FC<EditorHeaderProps> = React.memo(({
  viewMode,
  setViewMode,
  title,
  setTitle,
  content,
  isSaved,
  isSaving,
  isOffline = false,
  executeSave,
  docMetadata,
  onOpenSwitcher,
  onOpenDrawer,
  onOpenPdfStudio,
  onOpenClipStudio,
  onOpenSocialCard,
  isAdmin,
  onOpenTableBuilder,
  onOpenImageModal,
  onOpenOutline,
  onOpenTemplates,
  onOpenRevisions,
  onOpenSprintPopover,
  onExportMd: _onExportMd,
  onExportDocx: _onExportDocx,
  onCopyMarkdown: _onCopyMarkdown,
  onClearContent,
  onDeleteCurrentDoc,
  isToolsMenuOpen,
  setIsToolsMenuOpen,
  isExportMenuOpen: _isExportMenuOpen,
  setIsExportMenuOpen: _setIsExportMenuOpen,
  onOpenPublish,
  onOpenLocalFolder,
  onOpenAuth,
  mobileTab: _mobileTab = 'edit',
  onSelectMobileTab: _onSelectMobileTab,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isFilesMenuOpen, setIsFilesMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);

  // Compute active mode badge label and icon for current view
  let currentModeLabel = 'Split';
  let CurrentModeIcon: React.ComponentType<{ className?: string }> = Columns;

  if (viewMode === 'write') {
    currentModeLabel = 'Write';
    CurrentModeIcon = PenTool;
  } else if (viewMode === 'read') {
    currentModeLabel = 'Read';
    CurrentModeIcon = Eye;
  } else if (viewMode === 'present') {
    currentModeLabel = 'Present';
    CurrentModeIcon = Presentation;
  }

  const handleSelectMode = (opt: ModeOptionItem) => {
    setViewMode(opt.mode);
    setIsModeMenuOpen(false);
  };

  const isModeSelected = (opt: ModeOptionItem) => {
    return opt.mode === viewMode;
  };

  // Save Indicator Element
  const renderSaveIndicator = (showText = false) => {
    if (isOffline) {
      return (
        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium" title="Saved locally in offline storage">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {showText && <span className="text-[11px]">Saved (Offline)</span>}
        </span>
      );
    }
    if (isSaving) {
      return (
        <span className="text-amber-500 flex items-center gap-1.5" title="Saving changes...">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          {showText && <span className="text-[11px]">Saving...</span>}
        </span>
      );
    }
    if (isSaved) {
      return (
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium" title="All changes saved in local cache">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {showText && <span className="text-[11px]">Saved</span>}
        </span>
      );
    }
    return (
      <span className="text-neutral-400 flex items-center gap-1.5" title="Unsaved changes">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {showText && <span className="text-[11px]">Unsaved</span>}
      </span>
    );
  };

  return (
    <div className="shrink-0 select-none z-30 transition-all no-print">
      {/* Primary Header Row */}
      <header className="h-14 sm:h-15 border-b border-neutral-200/80 dark:border-neutral-800/80 px-2 sm:px-6 flex items-center justify-between bg-white dark:bg-neutral-900">
        
        {/* Zone 1 (Left): Back to Documents & Desktop Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/documents')}
            className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0 shadow-2xs font-sans"
            title="Back to Documents Library"
            aria-label="Back to Documents Library"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Docs</span>
          </button>

          {/* Desktop Title & Save Indicator (hidden on mobile, rendered in sub-row) */}
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 shrink-0" />
            <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => executeSave(content, title)}
              placeholder="Untitled Document"
              className="bg-transparent font-bold text-xs sm:text-sm text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/40 dark:focus:ring-brand-400/40 rounded-md px-2 py-1 w-auto min-w-[120px] max-w-[180px] md:max-w-[260px] lg:max-w-[340px] truncate transition-colors font-sans hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40"
              title="Click to rename document"
            />
            <div className="flex items-center gap-2 text-xs font-sans shrink-0 pl-1 font-medium">
              {renderSaveIndicator(true)}
              {user?.id ? (
                <div 
                  className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-sans"
                  title={`Cloud backup active: ${user.email}`}
                >
                  <Cloud className="w-3 h-3 text-emerald-500" />
                  <span>Synced</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 border border-neutral-200 dark:border-neutral-700/60 transition-all cursor-pointer shadow-2xs font-sans"
                  title="Notes saved locally in this browser. Click to back up to cloud."
                >
                  <Cloud className="w-3 h-3 text-neutral-400" />
                  <span>Back Up</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Zone 2 (Center/Primary): Prominent Mode Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsModeMenuOpen((prev) => !prev);
              setIsFilesMenuOpen(false);
              setIsToolsMenuOpen(false);
              setIsOverflowMenuOpen(false);
            }}
            className="min-h-[44px] px-3 sm:px-3.5 py-1.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/90 hover:bg-neutral-100 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-neutral-100 shadow-2xs transition-all cursor-pointer flex items-center gap-2 font-sans select-none active:scale-98"
            title="Switch Active Mode (Ctrl+M or Alt+M)"
            aria-label="Switch Active Workspace Mode"
          >
            <CurrentModeIcon className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm tracking-tight">
              <span className="sm:hidden">{currentModeLabel}</span>
              <span className="hidden sm:inline">{viewMode === 'split' ? 'Split View' : `${currentModeLabel} Mode`}</span>
            </span>
            <kbd className="hidden md:inline-block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md shadow-2xs font-mono">
              Ctrl+M
            </kbd>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${isModeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isModeMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsModeMenuOpen(false)} />
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-1 font-sans">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 font-sans flex items-center justify-between">
                  <span>Workspace Modes</span>
                  <kbd className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md shadow-2xs font-sans">
                    Alt+M
                  </kbd>
                </div>

                {ALL_MODE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = isModeSelected(opt);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectMode(opt)}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer font-sans ${
                        isSelected
                          ? 'bg-brand-50/80 dark:bg-brand-950/40 text-neutral-950 dark:text-white font-semibold border border-brand-200/70 dark:border-brand-800/60 shadow-2xs'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-brand-500 text-white shadow-2xs'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div className={`font-semibold text-xs truncate ${isSelected ? 'text-brand-900 dark:text-brand-100' : ''}`}>
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal truncate">
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Zone 3 (Right): Consolidated Desktop Cluster OR Mobile Overflow Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile-Only Overflow Menu */}
          <EditorMobileOverflowMenu
            isOpen={isOverflowMenuOpen}
            setIsOpen={setIsOverflowMenuOpen}
            onBeforeOpen={() => {
              setIsModeMenuOpen(false);
              setIsFilesMenuOpen(false);
              setIsToolsMenuOpen(false);
            }}
            onOpenSwitcher={onOpenSwitcher}
            onOpenLocalFolder={onOpenLocalFolder}
            onOpenPublish={onOpenPublish}
            onOpenDrawer={onOpenDrawer}
            onOpenPdfStudio={onOpenPdfStudio}
            onOpenOutline={onOpenOutline}
            onOpenTableBuilder={onOpenTableBuilder}
            onOpenImageModal={onOpenImageModal}
            onOpenTemplates={onOpenTemplates}
            onOpenRevisions={onOpenRevisions}
            onOpenSprintPopover={onOpenSprintPopover}
            onClearContent={onClearContent}
            onDeleteCurrentDoc={onDeleteCurrentDoc}
          />

          {/* Desktop Right Cluster (Hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
            {/* Instant Web Publishing Trigger */}
            {onOpenPublish && (
              <button
                onClick={onOpenPublish}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0 font-sans"
                title="Publish document to a shareable web link"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Publish</span>
              </button>
            )}

            {/* Files Dropdown (Document Switcher & Vault) */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsFilesMenuOpen((prev) => !prev);
                  setIsModeMenuOpen(false);
                  setIsToolsMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs font-sans ${
                  isFilesMenuOpen
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                }`}
                title="Open documents or local vault folder"
              >
                <FolderOpen className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>Files</span>
                <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-150 ${isFilesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilesMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilesMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-0.5 font-sans">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 font-sans">
                      File Operations
                    </div>

                    <button
                      onClick={() => {
                        setIsFilesMenuOpen(false);
                        onOpenSwitcher();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group transition-colors font-sans"
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderOpen className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">Open Switcher</div>
                          <div className="text-[10px] text-neutral-500">Search and open any document</div>
                        </div>
                      </div>
                      <kbd className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md shadow-2xs font-sans">Ctrl+O</kbd>
                    </button>

                    {onOpenLocalFolder && (
                      <button
                        onClick={() => {
                          setIsFilesMenuOpen(false);
                          onOpenLocalFolder();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300 cursor-pointer group transition-colors font-sans"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderTree className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-white">Local Vault / Folder</div>
                            <div className="text-[10px] text-neutral-500">Open markdown from your disk</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-neutral-400">Disk</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Document Print & PDF Studio Trigger */}
            <button
              onClick={onOpenPdfStudio}
              className="hidden lg:flex p-2 rounded-lg border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs font-semibold cursor-pointer items-center justify-center shadow-2xs"
              title="Document Print & PDF Studio (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Consolidated Tools & Studio Dropdown Menu */}
            <EditorToolsMenu
              isOpen={isToolsMenuOpen}
              setIsOpen={setIsToolsMenuOpen}
              onBeforeOpen={() => {
                setIsFilesMenuOpen(false);
                setIsModeMenuOpen(false);
              }}
              onOpenPdfStudio={onOpenPdfStudio}
              onOpenClipStudio={onOpenClipStudio}
              onOpenSocialCard={onOpenSocialCard}
              isAdmin={isAdmin}
              onOpenOutline={onOpenOutline}
              onOpenTableBuilder={onOpenTableBuilder}
              onOpenImageModal={onOpenImageModal}
              onOpenTemplates={onOpenTemplates}
              onOpenRevisions={onOpenRevisions}
              onOpenSprintPopover={onOpenSprintPopover}
              onClearContent={onClearContent}
              onDeleteCurrentDoc={onDeleteCurrentDoc}
            />

            {/* Document Insights / Drawer Trigger */}
            <button
              onClick={onOpenDrawer}
              className="p-2 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer relative shadow-2xs"
              title="Document details & tags"
            >
              <Info className="w-4 h-4" />
              {docMetadata?.tags?.length ? (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-600" />
              ) : null}
            </button>

            {/* PWA Install Button */}
            <PwaInstallButton variant="compact" />
          </div>
        </div>
      </header>

      {/* Mobile Title Sub-Row (< 640px) */}
      <div className="sm:hidden px-3 py-2 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/90 dark:bg-neutral-900/60 flex items-center justify-between gap-2.5 text-xs transition-colors">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => executeSave(content, title)}
            className="bg-transparent font-bold text-xs text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 rounded px-1.5 py-0.5 w-full truncate font-sans"
            placeholder="Untitled Document..."
            title="Tap to rename document"
          />
        </div>

        {/* Real-time Save status badge on mobile */}
        <div className="shrink-0 flex items-center gap-1 font-sans font-medium text-[11px]">
          {renderSaveIndicator(true)}
        </div>
      </div>
    </div>
  );
});

EditorHeader.displayName = 'EditorHeader';
