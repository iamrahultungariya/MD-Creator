import React, { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { X, Type, Sliders, HardDrive, Cpu, Loader2 } from 'lucide-react';
import { usePreferencesStore, PreferencesTab } from '../../stores/usePreferencesStore';
import { db } from '../../db';

const PreferencesEditorTab = React.lazy(() =>
  import('./preferences/PreferencesEditorTab').then((m) => ({ default: m.PreferencesEditorTab }))
);
const PreferencesToolbarTab = React.lazy(() =>
  import('./preferences/PreferencesToolbarTab').then((m) => ({ default: m.PreferencesToolbarTab }))
);
const PreferencesStorageTab = React.lazy(() =>
  import('./preferences/PreferencesStorageTab').then((m) => ({ default: m.PreferencesStorageTab }))
);
const PreferencesAiTab = React.lazy(() =>
  import('./preferences/PreferencesAiTab').then((m) => ({ default: m.PreferencesAiTab }))
);

export const PreferencesModal: React.FC = () => {
  const isOpen = usePreferencesStore((s) => s.isOpen);
  const closePreferences = usePreferencesStore((s) => s.closePreferences);
  const activeTab = usePreferencesStore((s) => s.activeTab || 'editor');
  const setActiveTab = usePreferencesStore((s) => s.setActiveTab);
  const [docCount, setDocCount] = React.useState<number>(0);

  // Load document count from local DB
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

  const tabList: { id: PreferencesTab; label: string; icon: React.ElementType }[] = [
    { id: 'editor', label: 'Editor & Type', icon: Type },
    { id: 'toolbar', label: 'Toolbar Dock', icon: Sliders },
    { id: 'storage', label: 'Storage & Backup', icon: HardDrive },
    { id: 'ai', label: 'AI Models', icon: Cpu },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 6 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-900 dark:text-neutral-100 font-sans"
      >
        {/* Window Titlebar (Clean, typography-led, zero fake traffic light dots) */}
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900 shrink-0">
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
        <div className="px-5 pt-3.5 pb-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-lg bg-neutral-100/90 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 text-xs">
            {tabList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Suspense
            fallback={
              <div className="py-12 flex items-center justify-center text-xs text-neutral-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400" />
                <span>Loading preferences...</span>
              </div>
            }
          >
            {activeTab === 'editor' && <PreferencesEditorTab />}
            {activeTab === 'toolbar' && <PreferencesToolbarTab />}
            {activeTab === 'storage' && <PreferencesStorageTab docCount={docCount} />}
            {activeTab === 'ai' && <PreferencesAiTab />}
          </Suspense>
        </div>

        {/* Clean Footer Bar */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900 shrink-0 text-xs">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Changes apply instantly to the active workspace.
          </span>
          <button
            type="button"
            onClick={closePreferences}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs active:translate-y-[1px] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
