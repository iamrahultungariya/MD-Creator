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
} from 'lucide-react';
import { ThinkingLevel } from '../../types/mimoTypes';
import { useMimoStore } from '../../stores/useMimoStore';
import { MimoSettingsPopover } from './MimoSettingsPopover';
import { MimoDocPinSelector } from './MimoDocPinSelector';
import { db } from '../../../../db';

export interface MimoInputDockProps {
  docId?: string;
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  activeSelection: string;
  setActiveSelection: (val: string) => void;
  isGenerating: boolean;
  isAiExcluded?: boolean;
  selectedModel: string;
  setSelectedModel: (model: 'gemini-3.8-flash' | 'gemini-3.5-flash' | 'gemini-3.5-flash-lite') => void;
  thinkingLevel: ThinkingLevel;
  setThinkingLevel: (level: 'AUTO' | 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onSend: (customPrompt?: string) => void;
  onStop: () => void;
  onFocusTextarea?: () => void;
}

const EMPTY_PINNED_ARRAY: string[] = [];

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
  const [pinnedDocsMeta, setPinnedDocsMeta] = useState<Array<{ id: string; title: string }>>([]);
  const thinkingMenuRef = useRef<HTMLDivElement>(null);

  // Close thinking menu on outside click
  useEffect(() => {
    if (!isThinkingMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (thinkingMenuRef.current && !thinkingMenuRef.current.contains(e.target as Node)) {
        setIsThinkingMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isThinkingMenuOpen]);

  const webSearchEnabled = useMimoStore((s) => s.webSearchEnabled);
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
          {/* Model Switcher Segment */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.8-flash')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Gemini 3.8 Flash (Reasoning & Deep Analysis)"
            >
              <Brain className="w-3 h-3" />
              <span>3.8 Flash</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Gemini 3.5 Flash (Balanced & High Stability)"
            >
              <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>3.5 Flash</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.5-flash-lite')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedModel === 'gemini-3.5-flash-lite'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Gemini 3.5 Flash-Lite (High Throughput Speed)"
            >
              <Zap className="w-3 h-3" />
              <span>3.5 Lite</span>
            </button>
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
                isSettingsOpen || webSearchEnabled || showThinking
                  ? 'border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Mimo Generation Settings (Web search & Thinking)"
              aria-label="Generation settings"
            >
              <SlidersHorizontal className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
              <span>Settings</span>
              {(webSearchEnabled || showThinking || userApiKey) && (
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
              : 'Ask Mimo or type in Hinglish... (Enter to send)'
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
