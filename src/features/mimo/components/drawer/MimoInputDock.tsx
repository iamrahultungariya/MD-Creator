import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  StopCircle,
  Brain,
  Zap,
  SlidersHorizontal,
  Pin,
  ChevronUp,
  Check,
  Archive,
  Sparkles,
  ListTodo,
  Scissors,
  FileSearch,
  Terminal,
} from 'lucide-react';
import { ThinkingLevel, MimoModelChoice } from '../../types/mimoTypes';
import { useMimoStore } from '../../stores/useMimoStore';
import { MimoSettingsPopover } from './MimoSettingsPopover';
import { MimoDocPinSelector } from './MimoDocPinSelector';
import { db } from '../../../../db';
import { getMatchingSlashCommands } from '../../services/mimoSlashCommands';

export interface MimoInputDockProps {
  docId?: string;
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  activeSelection: string;
  setActiveSelection: (val: string) => void;
  isGenerating: boolean;
  isAiExcluded?: boolean;
  selectedModel: string;
  setSelectedModel: (model: MimoModelChoice) => void;
  thinkingLevel: ThinkingLevel;
  setThinkingLevel: (level: 'AUTO' | 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onSend: (customPrompt?: string) => void;
  onStop: () => void;
  onFocusTextarea?: () => void;
}

const EMPTY_PINNED_ARRAY: string[] = [];

const SLASH_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Archive,
  Sparkles,
  ListTodo,
  Scissors,
  FileSearch,
};

export const MimoInputDock: React.FC<MimoInputDockProps> = ({
  docId,
  inputPrompt,
  setInputPrompt,
  activeSelection,
  setActiveSelection,
  isGenerating,
  isAiExcluded = false,
  selectedModel,
  setSelectedModel,
  thinkingLevel,
  setThinkingLevel,
  onSend,
  onStop,
  onFocusTextarea,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isThinkingMenuOpen, setIsThinkingMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [pinnedDocsMeta, setPinnedDocsMeta] = useState<Array<{ id: string; title: string }>>([]);
  const thinkingMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Slash Commands Autocomplete State
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [isSlashMenuDismissed, setIsSlashMenuDismissed] = useState(false);

  const isSlashActive = inputPrompt.startsWith('/') && !isSlashMenuDismissed;
  const matchingSlashCommands = isSlashActive ? getMatchingSlashCommands(inputPrompt) : [];
  const showSlashMenu = isSlashActive && matchingSlashCommands.length > 0;

  useEffect(() => {
    if (inputPrompt.startsWith('/')) {
      setIsSlashMenuDismissed(false);
      setSelectedSlashIndex(0);
    }
  }, [inputPrompt]);

  // Close menus on outside click
  useEffect(() => {
    if (!isThinkingMenuOpen && !isModelMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (thinkingMenuRef.current && !thinkingMenuRef.current.contains(target)) {
        setIsThinkingMenuOpen(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(target)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isThinkingMenuOpen, isModelMenuOpen]);

  const showThinking = useMimoStore((s) => s.showThinking);
  const userApiKey = useMimoStore((s) => s.quota.userApiKey);
  const touchMimoActivity = useMimoStore((s) => s.touchMimoActivity);

  const pinnedDocIds = useMimoStore((s) =>
    docId && s.pinnedDocIdsByDoc ? s.pinnedDocIdsByDoc[docId] || EMPTY_PINNED_ARRAY : EMPTY_PINNED_ARRAY
  );
  const unpinDocument = useMimoStore((s) => s.unpinDocument);

  // Load human-readable metadata for active pinned docs
  useEffect(() => {
    if (!pinnedDocIds || pinnedDocIds.length === 0) {
      setPinnedDocsMeta((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    let cancelled = false;
    db.documents
      .where('id')
      .anyOf(pinnedDocIds)
      .toArray()
      .then((docs) => {
        if (!cancelled) {
          setPinnedDocsMeta(
            docs.map((d) => ({ id: d.id, title: d.title || 'Untitled Document' }))
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pinnedDocIds]);
  return (
    <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shrink-0 space-y-2">
      {/* Active Text Selection Indicator */}
      {activeSelection && (
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-lg text-[11px] text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">Context:</span>
            <span className="truncate italic">
              "{activeSelection.slice(0, 36).replace(/\n/g, ' ')}..."
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              ({activeSelection.split('\n').length}L)
            </span>
          </div>
          <button
            onClick={() => setActiveSelection('')}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded p-0.5 cursor-pointer ml-2 transition-colors"
            title="Clear selection context"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Controls Bar: Model & Thinking */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Model Up-Arrow Popover Selector (Matching Thinking Selector) */}
          <div className="relative" ref={modelMenuRef}>
            <button
              type="button"
              onClick={() => {
                touchMimoActivity();
                setIsModelMenuOpen(!isModelMenuOpen);
              }}
              className={`px-2 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isModelMenuOpen
                  ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                  : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              }`}
              title="Select Gemini Engine"
            >
              {selectedModel === 'gemini-3.8-flash' ? (
                <Brain className="w-3 h-3 text-indigo-500" />
              ) : (
                <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>
                {selectedModel === 'gemini-3.8-flash'
                  ? '3.8 Flash'
                  : selectedModel === 'gemini-3.5-flash'
                  ? '3.5 Flash'
                  : '3.5 Lite'}
              </span>
              <ChevronUp
                className={`w-3 h-3 text-neutral-500 transition-transform ${
                  isModelMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isModelMenuOpen && (
              <div
                className="absolute bottom-full left-0 mb-1.5 w-52 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Gemini Engine
                </div>
                {[
                  {
                    id: 'gemini-3.5-flash-lite',
                    label: '3.5 Flash-Lite',
                    desc: 'Fast Pair-Writing • 1,500 RPD',
                    icon: Zap,
                    iconColor: 'text-emerald-500',
                  },
                  {
                    id: 'gemini-3.5-flash',
                    label: '3.5 Flash',
                    desc: 'Balanced Multi-Turn • 1,500 RPD',
                    icon: Zap,
                    iconColor: 'text-neutral-500 dark:text-neutral-400',
                  },
                  {
                    id: 'gemini-3.8-flash',
                    label: '3.8 Flash',
                    desc: 'Deep Reasoning & Heavy Tasks',
                    icon: Brain,
                    iconColor: 'text-indigo-500',
                  },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = selectedModel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(item.id as any);
                        setIsModelMenuOpen(false);
                        touchMimoActivity();
                      }}
                      className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${item.iconColor}`} />
                        <div className="flex flex-col">
                          <span>{item.label}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">{item.desc}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Thinking Level Up-Arrow Popover Selector */}
          {selectedModel === 'gemini-3.8-flash' || selectedModel === 'gemini-3.5-flash' ? (
            <div className="relative" ref={thinkingMenuRef}>
              <button
                type="button"
                onClick={() => {
                  touchMimoActivity();
                  setIsThinkingMenuOpen(!isThinkingMenuOpen);
                }}
                className={`px-2 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isThinkingMenuOpen
                    ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                    : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
                title="Reasoning depth budget"
              >
                <span>Thinking: {thinkingLevel === 'MEDIUM' ? 'Med' : thinkingLevel.charAt(0) + thinkingLevel.slice(1).toLowerCase()}</span>
                <ChevronUp className={`w-3 h-3 text-neutral-500 transition-transform ${isThinkingMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isThinkingMenuOpen && (
                <div
                  className="absolute bottom-full left-0 mb-1.5 w-44 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 select-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Reasoning Depth
                  </div>
                  {[
                    { id: 'AUTO', label: 'Auto', desc: 'Adaptive budget' },
                    { id: 'LOW', label: 'Low', desc: 'Fast (~1-2s)' },
                    { id: 'MEDIUM', label: 'Medium', desc: 'Balanced (~3-5s)' },
                    { id: 'HIGH', label: 'High', desc: 'Deep reflection' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setThinkingLevel(item.id as any);
                        setIsThinkingMenuOpen(false);
                        touchMimoActivity();
                      }}
                      className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                        thinkingLevel === item.id
                          ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">{item.desc}</span>
                      </div>
                      {thinkingLevel === item.id && (
                        <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono px-1">
              High-throughput
            </span>
          )}
        </div>

        {/* Generation Settings & Vault Doc Pinning */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Pinned Docs (@doc) Anchor */}
          <button
            type="button"
            onClick={() => {
              touchMimoActivity();
              setIsPinModalOpen(true);
            }}
            className={`px-2 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all ${
              pinnedDocIds.length > 0
                ? 'border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Pin reference notes from vault (@doc context)"
          >
            <Pin className="w-3 h-3 rotate-45 text-emerald-600 dark:text-emerald-400" />
            <span>@doc</span>
            {pinnedDocIds.length > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                {pinnedDocIds.length}
              </span>
            )}
          </button>

          {/* Settings Popover Anchor */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                touchMimoActivity();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className={`px-2 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                isSettingsOpen || showThinking
                  ? 'border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Mimo Generation Settings (Thinking & Model Preferences)"
              aria-label="Generation settings"
            >
              <SlidersHorizontal className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
              <span>Settings</span>
              {(showThinking || userApiKey) && (
                <span className={`w-1.5 h-1.5 rounded-full ${userApiKey ? 'bg-emerald-500' : 'bg-blue-500 dark:bg-blue-400'}`} />
              )}
            </button>

            <MimoSettingsPopover
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Active Pinned Vault Reference Chips */}
      {pinnedDocsMeta.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap px-1 py-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
            <Pin className="w-2.5 h-2.5 rotate-45" />
            Vault Ref:
          </span>
          {pinnedDocsMeta.map((doc) => (
            <span
              key={doc.id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-800 dark:text-emerald-200 font-medium"
            >
              <span className="truncate max-w-[120px]">{doc.title}</span>
              <button
                type="button"
                onClick={() => unpinDocument(doc.id)}
                className="text-emerald-600 hover:text-emerald-950 dark:hover:text-white cursor-pointer"
                title={`Unpin "${doc.title}"`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {pinnedDocsMeta.length < 3 && (
            <button
              type="button"
              onClick={() => setIsPinModalOpen(true)}
              className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer font-medium"
            >
              + Add Ref
            </button>
          )}
        </div>
      )}

      {/* Text Area & Action */}
      <div className="relative flex items-end gap-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 focus-within:border-neutral-400 dark:focus-within:border-neutral-600 transition-colors">
        {/* Floating Slash Commands Autocomplete Menu */}
        {showSlashMenu && (
          <div
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-950/60 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-600 dark:text-neutral-400">
                <Terminal className="w-3 h-3 text-[#8257F5]" />
                <span>Mimo Slash Commands</span>
              </div>
              <span className="text-[9px] text-neutral-400 font-mono">
                ↑↓ navigate • Enter select • Esc close
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
              {matchingSlashCommands.map((cmd, idx) => {
                const IconComp = SLASH_ICON_MAP[cmd.iconName] || Sparkles;
                const isSelected = idx === selectedSlashIndex;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onMouseEnter={() => setSelectedSlashIndex(idx)}
                    onClick={() => {
                      if (cmd.id === 'compact') {
                        onSend('/compact');
                      } else {
                        setInputPrompt(`${cmd.command} `);
                      }
                      setIsSlashMenuDismissed(true);
                    }}
                    className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#8257F5]/10 text-[#8257F5]'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                          {cmd.command}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          {cmd.description}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono shrink-0 ml-2 border border-neutral-200/60 dark:border-neutral-700">
                      {cmd.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <textarea
          value={inputPrompt}
          onChange={(e) => {
            touchMimoActivity();
            setInputPrompt(e.target.value);
          }}
          onFocus={() => {
            touchMimoActivity();
            onFocusTextarea?.();
          }}
          disabled={isAiExcluded}
          onKeyDown={(e) => {
            if (showSlashMenu && matchingSlashCommands.length > 0) {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSlashIndex((prev) => (prev + 1) % matchingSlashCommands.length);
                return;
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedSlashIndex((prev) => (prev - 1 + matchingSlashCommands.length) % matchingSlashCommands.length);
                return;
              }
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const chosen = matchingSlashCommands[selectedSlashIndex];
                if (chosen) {
                  if (chosen.id === 'compact') {
                    onSend('/compact');
                  } else {
                    setInputPrompt(`${chosen.command} `);
                  }
                  setIsSlashMenuDismissed(true);
                }
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setIsSlashMenuDismissed(true);
                return;
              }
            }

            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={
            isAiExcluded
              ? 'This document is shielded from AI scanning'
              : activeSelection
              ? 'Ask about selected text or request an edit...'
              : 'Ask Mimo or type "/" for commands (/compact, /clean-md...)'
          }
          rows={2}
          className="w-full bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none resize-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {isGenerating ? (
          <button
            onClick={onStop}
            className="shrink-0 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-400 cursor-pointer transition-colors"
            title="Stop generation"
          >
            <StopCircle className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onSend()}
            disabled={!inputPrompt.trim() || isAiExcluded}
            className="shrink-0 p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white disabled:opacity-30 cursor-pointer transition-colors"
            title="Send prompt"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Pinned Reference Notes Selector Modal */}
      <MimoDocPinSelector
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentDocId={docId || ''}
      />
    </div>
  );
};
