import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  RotateCcw, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  SlidersHorizontal,
  ExternalLink,
  GripVertical
} from 'lucide-react';
import { useToolbarSettingsStore, ALL_TOOLBAR_ACTIONS } from '../../stores/useToolbarSettingsStore';
import { ACTION_ICON_MAP } from '../../features/editor/components/FloatingFormattingDock';

export const ToolbarSettingsModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    enabledActions, 
    isOpen, 
    closeSettings, 
    toggleAction, 
    moveAction, 
    resetDefaults 
  } = useToolbarSettingsStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      moveAction(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white font-sans">
                Floating Toolbar Settings
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                Drag to reorder and choose tools in your cursor dock
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Dock Pill with Drag-and-Drop */}
        <div className="p-3.5 sm:p-4 bg-neutral-50 dark:bg-neutral-950/50 border-b border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-2 shrink-0">
          <div className="flex items-center justify-between w-full px-2 text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
            <span>Dock Preview</span>
            <span className="text-[10px] lowercase font-normal text-neutral-400 italic">drag icons to reorder</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-[#18181c]/95 text-neutral-700 dark:text-neutral-200 border border-neutral-200/90 dark:border-neutral-800/90 shadow-md max-w-full overflow-x-auto select-none">
            {enabledActions.map((actionId, idx) => (
              <div 
                key={actionId}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing transition-all ${
                  draggedIndex === idx 
                    ? 'opacity-40 scale-90 ring-2 ring-blue-500' 
                    : dragOverIndex === idx 
                    ? 'bg-blue-100 dark:bg-blue-950 scale-105 ring-1 ring-blue-400' 
                    : 'bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                }`}
                title={`Drag to reorder: ${actionId}`}
              >
                {ACTION_ICON_MAP[actionId]?.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Tools Configuration List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {ALL_TOOLBAR_ACTIONS.map((action) => {
            const isEnabled = enabledActions.includes(action.id);
            const activeIndex = enabledActions.indexOf(action.id);

            return (
              <div
                key={action.id}
                draggable={isEnabled}
                onDragStart={(e) => isEnabled && handleDragStart(e, activeIndex)}
                onDragOver={(e) => isEnabled && handleDragOver(e, activeIndex)}
                onDrop={(e) => isEnabled && handleDrop(e, activeIndex)}
                onDragEnd={handleDragEnd}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                  isEnabled
                    ? draggedIndex === activeIndex
                      ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 opacity-60 scale-98'
                      : dragOverIndex === activeIndex
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-2xs'
                    : 'border-neutral-100 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-950/20 opacity-60'
                }`}
              >
                {/* Left: Grip Handle + Icon & Label */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {isEnabled ? (
                    <div 
                      className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shrink-0 p-0.5" 
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 shrink-0" />
                  )}

                  <div 
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isEnabled
                        ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        : 'border-neutral-200/50 dark:border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {ACTION_ICON_MAP[action.id]?.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-white font-sans">
                        {action.label}
                      </span>
                      {action.shortcut && (
                        <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                          {action.shortcut}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-sans">
                      {action.description}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Order buttons & Toggle Switch */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {isEnabled && (
                    <div className="flex items-center gap-0.5 mr-1 sm:mr-2">
                      <button
                        onClick={() => {
                          if (activeIndex > 0) {
                            moveAction(activeIndex, activeIndex - 1);
                          }
                        }}
                        disabled={activeIndex === 0}
                        className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        title="Move Left"
                      >
                        <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                      <button
                        onClick={() => {
                          if (activeIndex < enabledActions.length - 1) {
                            moveAction(activeIndex, activeIndex + 1);
                          }
                        }}
                        disabled={activeIndex === enabledActions.length - 1}
                        className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        title="Move Right"
                      >
                        <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>
                  )}

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleAction(action.id)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-sans ${
                      isEnabled
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                        : 'border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <span>Add</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={resetDefaults}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => {
                closeSettings();
                navigate('/settings');
              }}
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Full Settings Page</span>
            </button>
          </div>

          <button
            onClick={closeSettings}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
