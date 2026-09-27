import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sliders, 
  RotateCcw, 
  Check, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2,
  Database,
  ShieldCheck,
  GripVertical
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { 
  useToolbarSettingsStore, 
  ALL_TOOLBAR_ACTIONS, 
  FormatAction,
  ActionCategory 
} from '../stores/useToolbarSettingsStore';
import { ACTION_ICON_MAP } from '../features/editor/components/FloatingFormattingDock';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    enabledActions, 
    enableAction, 
    disableAction, 
    moveAction, 
    resetDefaults 
  } = useToolbarSettingsStore();

  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleAdd = (id: FormatAction) => {
    enableAction(id);
    triggerToast(`Added ${id.toUpperCase()} to formatting toolbar`);
  };

  const handleRemove = (id: FormatAction) => {
    if (enabledActions.length <= 1) {
      triggerToast('At least one tool must remain active');
      return;
    }
    disableAction(id);
    triggerToast(`Removed from formatting toolbar`);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= enabledActions.length) return;
    moveAction(index, target);
  };

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
      triggerToast('Toolbar order updated');
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleReset = () => {
    resetDefaults();
    triggerToast('Toolbar reset to recommended defaults');
  };

  // Group actions by category
  const categories: { id: ActionCategory; title: string; desc: string }[] = [
    { 
      id: 'headings', 
      title: 'Headings & Hierarchy', 
      desc: 'Document structure and semantic outline headers' 
    },
    { 
      id: 'styling', 
      title: 'Typography & Emphasis', 
      desc: 'Visual text styling, markers, and code annotations' 
    },
    { 
      id: 'lists', 
      title: 'Lists & Quotes', 
      desc: 'Sequence tracking, task management, and callout blocks' 
    },
    { 
      id: 'structure', 
      title: 'Structure & Links', 
      desc: 'Web hyperlinks and section thematic breaks' 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar />

      {/* Floating Save Notification */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Page Header */}
        <div className="mb-10 pb-8 border-b border-neutral-100 dark:border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-3 border border-neutral-200/80 dark:border-neutral-700/80">
            <Sliders className="w-3.5 h-3.5 text-neutral-500" />
            <span>Preferences &amp; Customization</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
            Toolbar &amp; Workspace Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl mt-1.5 leading-relaxed">
            Customize the floating formatting dock that appears above your cursor in Writing Mode. Choose your preferred visual tools and arrangement.
          </p>
        </div>

        {/* Live Interactive Dock Preview Card */}
        <section className="mb-10 sm:mb-12 p-4 sm:p-6 lg:p-8 rounded-3xl bg-neutral-50/90 dark:bg-[#121316] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200/60 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-sans">
                  Live Cursor Dock Preview
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold font-sans">
                  {enabledActions.length} tools active
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-sans">
                Drag icons or use the ordering chips below to customize your cursor formatting dock.
              </p>
            </div>
          </div>

          {/* Rendered Dock in Application Theme with Drag-and-Drop */}
          <div className="py-6 sm:py-8 px-3 sm:px-4 flex flex-col items-center justify-center rounded-2xl bg-neutral-100/60 dark:bg-black/30 border border-neutral-200/50 dark:border-neutral-800/40">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-md transition-all shadow-xl max-w-full overflow-x-auto bg-white/95 text-neutral-700 border border-neutral-200/90 shadow-neutral-900/10 dark:bg-[#18181c]/95 dark:text-neutral-200 dark:border-neutral-800/90 dark:shadow-black/50 select-none">
              {enabledActions.map((actionId, idx) => {
                const act = ACTION_ICON_MAP[actionId];
                if (!act) return null;
                const isDragging = draggedIndex === idx;
                const isOver = dragOverIndex === idx;
                return (
                  <div
                    key={`preview-${actionId}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    title={`Drag to reorder: ${act.tooltip}`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing font-sans transition-all ${
                      isDragging
                        ? 'opacity-40 scale-90 ring-2 ring-blue-500'
                        : isOver
                        ? 'bg-blue-100 dark:bg-blue-950 scale-105 ring-1 ring-blue-400'
                        : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/80'
                    }`}
                  >
                    {act.icon}
                  </div>
                );
              })}
            </div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-3 font-medium font-sans text-center">
              Cursor Floating Dock (Drag icons directly in the preview to reorder)
            </span>
          </div>

          {/* Active Order & Quick Reorder Ribbon with Drag Handles */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 font-sans">
                Active Tools Order (Drag handle or chips to rearrange)
              </span>
              <button
                onClick={handleReset}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 font-semibold cursor-pointer transition-colors self-start sm:self-auto font-sans"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {enabledActions.map((actionId, index) => {
                const meta = ALL_TOOLBAR_ACTIONS.find((a) => a.id === actionId);
                const act = ACTION_ICON_MAP[actionId];
                const isDragging = draggedIndex === index;
                const isOver = dragOverIndex === index;

                return (
                  <div
                    key={`active-chip-${actionId}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl bg-white dark:bg-neutral-900 border transition-all select-none cursor-grab active:cursor-grabbing text-xs font-sans ${
                      isDragging
                        ? 'opacity-40 scale-95 border-blue-400 shadow-md ring-2 ring-blue-500'
                        : isOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-400'
                        : 'border-neutral-200 dark:border-neutral-800 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <div className="w-5 h-5 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold shrink-0 font-sans">
                      {act?.icon}
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-white font-sans">
                      {meta?.label || actionId}
                    </span>

                    <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-neutral-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, 'left');
                        }}
                        disabled={index === 0}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, 'right');
                        }}
                        disabled={index === enabledActions.length - 1}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(actionId);
                        }}
                        disabled={enabledActions.length <= 1}
                        className="p-1 rounded text-neutral-400 hover:text-red-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Remove Tool"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Visual Formatting Tools Library */}
        <section className="space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight font-sans">
              Formatting Tools Library
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
              Select any visual formatting feature below to add or remove it from your quick dock.
            </p>
          </div>

          <div className="space-y-8">
            {categories.map((cat) => {
              const items = ALL_TOOLBAR_ACTIONS.filter((a) => a.category === cat.id);

              return (
                <div key={cat.id} className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-sans">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item) => {
                      const isEnabled = enabledActions.includes(item.id);
                      const act = ACTION_ICON_MAP[item.id];

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                            isEnabled
                              ? 'bg-neutral-50/50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 shadow-2xs'
                              : 'bg-white dark:bg-neutral-950/40 border-neutral-100 dark:border-neutral-850 hover:border-neutral-200 dark:hover:border-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white font-bold shrink-0 shadow-2xs font-sans">
                              {act?.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-neutral-950 dark:text-white font-sans">
                                  {item.description}
                                </span>
                                {item.shortcut && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium tracking-wide rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50 shadow-2xs font-sans">
                                    {item.shortcut}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-medium font-sans">
                                Syntax: {item.syntax}
                              </div>
                            </div>
                          </div>

                          {/* Toggle Action */}
                          <div className="self-end sm:self-auto shrink-0">
                            {isEnabled ? (
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                                <span>Active</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAdd(item.id)}
                                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Dock</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* System & Storage Telemetry Card */}
        <section className="mt-14 p-6 rounded-3xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">
                Local Storage &amp; Offline Sovereignty
              </div>
              <div className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Settings and tool arrangements persist instantly in your browser profile.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-neutral-500 text-[11px] font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>MD Writer v0.9.1 Beta</span>
          </div>
        </section>
      </main>

      <Footer onOpenUpdates={() => navigate('/updates')} />
    </div>
  );
};
