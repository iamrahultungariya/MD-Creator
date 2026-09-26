import React from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { CursorPosition, ViewMode } from '../types';
import { useAuthStore, isUserPro } from '../../../stores/useAuthStore';
import { ProUpgradeModal } from '../../../components/common/ProUpgradeModal';

interface EditorStatusBarProps {
  viewMode: ViewMode;
  cursorPos: CursorPosition;
  lineCount: number;
  wordCount: number;
  charCount: number;
  readingTime: number;
  isSprintActive: boolean;
  sprintDuration: number;
  sprintSecondsRemaining: number;
  sprintStartWordCount: number;
  wordsWritten?: number;
  wpm?: number;
  progressPercent?: number;
  sprintMode?: 'time' | 'words';
  targetWords?: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  formatSprintTime: (seconds: number) => string;
  isSprintPopoverOpen: boolean;
  setIsSprintPopoverOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onStartSprint: (minutes?: number, mode?: 'time' | 'words', wordGoal?: number) => void;
  onPauseSprint: () => void;
  onResetSprint: () => void;
  onOpenUpdates?: () => void;
  onOpenSwitcher?: () => void;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = React.memo(({
  viewMode: _viewMode,
  cursorPos,
  lineCount,
  wordCount,
  charCount,
  readingTime,
  isSprintActive,
  sprintDuration,
  sprintSecondsRemaining,
  sprintStartWordCount: _sprintStartWordCount,
  wordsWritten = 0,
  wpm = 0,
  progressPercent = 0,
  sprintMode = 'time',
  targetWords = 250,
  soundEnabled = true,
  onToggleSound,
  formatSprintTime,
  isSprintPopoverOpen,
  setIsSprintPopoverOpen,
  onStartSprint,
  onPauseSprint,
  onResetSprint,
}) => {
  const { user } = useAuthStore();
  const isPro = isUserPro(user);
  const [isProModalOpen, setIsProModalOpen] = React.useState(false);
  const [selectedSprintMode, setSelectedSprintMode] = React.useState<'time' | 'words'>(sprintMode);
  const [selectedMins, setSelectedMins] = React.useState<number>(sprintDuration || 25);
  const [selectedGoal, setSelectedGoal] = React.useState<number>(targetWords || 250);

  return (
    <footer
      className="editor-status-bar h-8 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 px-4 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 select-none z-30 transition-all duration-200 no-print"
    >
      {/* Left Stats: Cursor & Document Telemetry */}
      <div className="flex items-center gap-3">
        <span className="font-mono">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
        <span>{lineCount} lines</span>
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
        <span className="hidden md:inline text-neutral-300 dark:text-neutral-700">|</span>
        <span className="hidden md:inline">~{readingTime} min read</span>
      </div>

      {/* Center Actions: Focus Sprint Companion */}
      <div className="flex items-center gap-2">

        {/* Upgraded Focus Sprint Timer Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSprintPopoverOpen((prev) => !prev)}
            className={`px-2.5 py-0.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer text-[10px] font-semibold ${
              isSprintActive
                ? 'bg-amber-500 text-white shadow-xs'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
            title="Writing Sprint: Live WPM, word targets & focus intervals"
          >
            <Timer className="w-3 h-3" />
            <span>
              {formatSprintTime(sprintSecondsRemaining)}
              {isSprintActive && (
                <>
                  <span className="ml-1 opacity-90 font-bold">
                    (+{wordsWritten}w)
                  </span>
                  {wpm > 0 && (
                    <span className="ml-1 opacity-90 hidden sm:inline">
                      • ⚡ {wpm} wpm
                    </span>
                  )}
                </>
              )}
            </span>
          </button>

          {/* Upgraded Sprint Flow Popover */}
          {isSprintPopoverOpen && (
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-[#141415] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl shadow-2xl p-3.5 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100 select-none">
              {/* Popover Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <Timer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Writing Sprint & Flow</span>
                </span>
                <button
                  onClick={() => setIsSprintPopoverOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-0.5"
                >
                  ✕
                </button>
              </div>

              {/* Live Sprint Stats if Active */}
              {isSprintActive && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      ⚡ Velocity: {wpm} WPM
                    </span>
                    <span className="font-mono text-neutral-600 dark:text-neutral-300">
                      {wordsWritten} words written
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Mode Selection Segmented Control */}
              {!isSprintActive && (
                <div className="space-y-2">
                  <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectedSprintMode('time')}
                      className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                        selectedSprintMode === 'time'
                          ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-bold'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      Time Target
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSprintMode('words')}
                      className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                        selectedSprintMode === 'words'
                          ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-bold'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      Word Goal
                    </button>
                  </div>

                  {/* Preset Options based on active mode */}
                  {selectedSprintMode === 'time' ? (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {[15, 25, 45].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setSelectedMins(mins)}
                          className={`flex-1 py-1.5 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                            selectedMins === mins
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold'
                              : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {[250, 500, 1000].map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setSelectedGoal(goal)}
                          className={`flex-1 py-1.5 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                            selectedGoal === goal
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold'
                              : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {goal}w
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {!isSprintActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      onStartSprint(selectedMins, selectedSprintMode, selectedGoal);
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm transition-all"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Start {selectedSprintMode === 'time' ? `${selectedMins}m Sprint` : `${selectedGoal}w Goal`}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onPauseSprint}
                    className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 active:scale-95 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm transition-all"
                  >
                    <Pause className="w-3 h-3 fill-current" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onResetSprint}
                  className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors"
                  title="Reset Sprint"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {onToggleSound && (
                  <button
                    type="button"
                    onClick={onToggleSound}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      soundEnabled
                        ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'
                    }`}
                    title={soundEnabled ? 'Chime Sounds: On' : 'Chime Sounds: Muted'}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Status: Clean Local & Cloud Storage Telemetry with Pro Tiering */}
      <div className="flex items-center gap-2">
        {isPro ? (
          <div className="flex items-center gap-1.5" title="Real-time multi-device cloud sync active">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              ⚡ Dexie + ☁️ Cloud Sync (Pro)
            </span>
          </div>
        ) : user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" title="Offline-first browser storage (IndexedDB)">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                ⚡ Dexie Local
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsProModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 text-[10px] font-medium hover:bg-neutral-300/70 dark:hover:bg-neutral-700 transition-all cursor-pointer"
              title="Enable multi-device cloud sync with Pro"
            >
              <span>Cloud Sync (Pro)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" title="Guest mode: documents stored in local browser cache">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                ⚡ Dexie Local (Guest)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsProModalOpen(true)}
              className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Explore Pro features"
            >
              <span>Pro</span>
            </button>
          </div>
        )}
      </div>

      {/* Pro Upgrade Modal for Status Bar */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        featureTitle="Multi-Device Cloud Sync"
        featureDescription="Real-time multi-device cloud synchronization automatically syncs and backs up your documents to Supabase PostgreSQL. Available in MD Creator Pro."
      />
    </footer>
  );
});

EditorStatusBar.displayName = 'EditorStatusBar';
