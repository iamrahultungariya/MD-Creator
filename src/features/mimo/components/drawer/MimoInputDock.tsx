import React from 'react';
import {
  X,
  Send,
  StopCircle,
  Wand2,
  Brain,
  Zap,
} from 'lucide-react';
import { ThinkingLevel } from '../../types/mimoTypes';

export interface MimoInputDockProps {
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  activeSelection: string;
  setActiveSelection: (val: string) => void;
  isGenerating: boolean;
  isAiExcluded?: boolean;
  selectedModel: string;
  setSelectedModel: (model: 'gemini-3.8-flash' | 'gemini-3.5-flash-lite') => void;
  thinkingLevel: ThinkingLevel;
  setThinkingLevel: (level: 'AUTO' | 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onSend: (customPrompt?: string) => void;
  onStop: () => void;
  onEnhance: () => void;
  onFocusTextarea?: () => void;
}

export const MimoInputDock: React.FC<MimoInputDockProps> = ({
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
  onEnhance,
  onFocusTextarea,
}) => {
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
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 cursor-pointer ml-2"
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
              onClick={() => setSelectedModel('gemini-3.5-flash-lite')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedModel === 'gemini-3.5-flash-lite'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Gemini 3.5 Flash-Lite (High Throughput)"
            >
              <Zap className="w-3 h-3" />
              <span>3.5 Lite</span>
            </button>
          </div>

          {/* Thinking Level Pills */}
          {selectedModel === 'gemini-3.8-flash' ? (
            <div className="inline-flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-[10px]">
              {(['AUTO', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setThinkingLevel(lvl)}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    thinkingLevel === lvl
                      ? 'bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-950 font-medium shadow-2xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {lvl === 'MEDIUM' ? 'Med' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono px-1">
              High-throughput
            </span>
          )}
        </div>

        {/* Prompt Enhancer */}
        <button
          onClick={onEnhance}
          disabled={isGenerating || !inputPrompt.trim() || isAiExcluded}
          className="px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ml-auto shrink-0"
          title="Enhance prompt structure"
        >
          <Wand2 className="w-3 h-3 text-neutral-500" />
          <span>Enhance</span>
        </button>
      </div>

      {/* Text Area & Action */}
      <div className="relative flex items-end gap-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 focus-within:border-neutral-400 dark:focus-within:border-neutral-600 transition-colors">
        <textarea
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onFocus={onFocusTextarea}
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
    </div>
  );
};
