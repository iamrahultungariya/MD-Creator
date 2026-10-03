import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Type, Sliders, HardDrive } from 'lucide-react';
import { usePreferencesStore } from '../../stores/usePreferencesStore';
import { db } from '../../db';
import { PreferencesEditorTab } from './preferences/PreferencesEditorTab';
import { PreferencesToolbarTab } from './preferences/PreferencesToolbarTab';
import { PreferencesStorageTab } from './preferences/PreferencesStorageTab';

export const PreferencesModal: React.FC = () => {
  const { isOpen, closePreferences } = usePreferencesStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'toolbar' | 'storage'>('editor');
  const [docCount, setDocCount] = useState<number>(0);

  // Load document count from IndexedDB
  useEffect(() => {
    if (isOpen) {
      db.documents.count().then(setDocCount).catch(() => {});
    }
  }, [isOpen]);

  // Global Esc key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreferences();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePreferences]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-white dark:bg-[#131118] border border-neutral-200/90 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-900 dark:text-neutral-100"
      >
        {/* Window Titlebar */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-[#181620] shrink-0">
          {/* Mac-style Traffic Light Window Controls */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-xs" />
          </div>

          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-xs sm:text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              Preferences
            </h2>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200/70 dark:border-neutral-700/70">
              Ctrl+,
            </kbd>
          </div>

          <button
            type="button"
            onClick={closePreferences}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close preferences"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Segmented Navigation Tab Bar */}
        <div className="px-5 pt-3.5 pb-2 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/30 dark:bg-[#131118] shrink-0">
          <div className="grid grid-cols-3 p-1 rounded-lg bg-neutral-100/90 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-[#8257F5]" />
              <span>Editor &amp; Type</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('toolbar')}
              className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer ${
                activeTab === 'toolbar'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#8257F5]" />
              <span>Toolbar Dock</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('storage')}
              className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer ${
                activeTab === 'storage'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-[#8257F5]" />
              <span>Storage &amp; Backup</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'editor' && <PreferencesEditorTab />}
          {activeTab === 'toolbar' && <PreferencesToolbarTab />}
          {activeTab === 'storage' && <PreferencesStorageTab docCount={docCount} />}
        </div>

        {/* Clean Footer Bar */}
        <div className="px-5 py-3 border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-[#181620] shrink-0 text-xs">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Changes apply instantly to the active workspace.
          </span>
          <button
            type="button"
            onClick={closePreferences}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
