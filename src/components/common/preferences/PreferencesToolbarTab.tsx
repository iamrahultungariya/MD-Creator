import React from 'react';
import { RotateCcw, Check, Sparkles } from 'lucide-react';
import {
  useToolbarSettingsStore,
  ALL_TOOLBAR_ACTIONS,
} from '../../../stores/useToolbarSettingsStore';
import { ACTION_ICON_MAP } from '../../../features/editor/components/FloatingFormattingDock';

export const PreferencesToolbarTab: React.FC = () => {
  const {
    enabledActions,
    enableAction,
    disableAction,
    resetDefaults: resetToolbarDefaults,
  } = useToolbarSettingsStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-neutral-900 dark:text-white">
            Selection Formatting Bar
          </span>
          <p className="text-[10px] text-neutral-500">
            Choose which quick actions appear when you select text in the editor
          </p>
        </div>
        <button
          type="button"
          onClick={resetToolbarDefaults}
          className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ALL_TOOLBAR_ACTIONS.map((action) => {
          const isEnabled = enabledActions.includes(action.id);
          const actionMeta = ACTION_ICON_MAP[action.id];

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                if (isEnabled) {
                  if (enabledActions.length > 2) disableAction(action.id);
                } else {
                  enableAction(action.id);
                }
              }}
              className={`p-2.5 rounded-lg border flex items-center justify-between text-left transition-all cursor-pointer ${
                isEnabled
                  ? 'border-[#8257F5] bg-[#8257F5]/5 dark:bg-[#8257F5]/10 text-neutral-950 dark:text-white shadow-xs font-medium'
                  : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 h-4 flex items-center justify-center shrink-0 text-neutral-700 dark:text-neutral-300">
                  {actionMeta?.icon || <Sparkles className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs truncate">{action.label}</span>
              </div>
              {isEnabled && <Check className="w-3.5 h-3.5 text-[#8257F5] shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
