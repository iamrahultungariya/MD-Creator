import React from 'react';
import { Check } from 'lucide-react';
import {
  usePreferencesStore,
  EditorFontFamily,
  EditorLineHeight,
} from '../../../stores/usePreferencesStore';
import { ToggleSwitch } from './ToggleSwitch';

export const PreferencesEditorTab: React.FC = () => {
  const {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    wordWrap,
    setWordWrap,
    tabSize,
    setTabSize,
    lineNumbers,
    setLineNumbers,
    autoCloseBrackets,
    setAutoCloseBrackets,
    typewriterMode,
    setTypewriterMode,
    focusMode,
    setFocusMode,
    keymapMode,
    setKeymapMode,
  } = usePreferencesStore();

  const fontOptions: { id: EditorFontFamily; label: string; desc: string }[] = [
    { id: 'Geist Mono', label: 'Geist Mono', desc: 'Modern geometric monospace' },
    { id: 'JetBrains Mono', label: 'JetBrains Mono', desc: 'High-legibility code font' },
    { id: 'Consolas', label: 'Consolas', desc: 'Classic programming font' },
    { id: 'monospace', label: 'System Mono', desc: 'Native OS monospace stack' },
  ];

  const fontSizeOptions = [13, 14, 15, 16, 18];
  const lineHeightOptions: { id: EditorLineHeight; label: string; value: string }[] = [
    { id: 'compact', label: 'Compact', value: '1.4' },
    { id: 'normal', label: 'Normal', value: '1.6' },
    { id: 'relaxed', label: 'Relaxed', value: '1.8' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Font Family Selection */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2">
          Editor Monospace Font
        </label>
        <div className="grid grid-cols-2 gap-2">
          {fontOptions.map((f) => {
            const isSelected = fontFamily === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFontFamily(f.id)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#8257F5] bg-[#8257F5]/5 dark:bg-[#8257F5]/10 text-neutral-950 dark:text-white shadow-xs ring-1 ring-[#8257F5]/30'
                    : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs tracking-tight text-neutral-900 dark:text-white">
                    {f.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#8257F5]" />}
                </div>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 block truncate">
                  {f.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Type Size & Line Height & Tab Size */}
      <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
        {/* Font Size */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Font Size</span>
            <p className="text-[10px] text-neutral-500">Current: {fontSize}px</p>
          </div>
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80">
            {fontSizeOptions.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz)}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                  fontSize === sz
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div className="flex items-center justify-between gap-3 text-xs pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Line Spacing</span>
            <p className="text-[10px] text-neutral-500">Vertical reading cadence</p>
          </div>
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80">
            {lineHeightOptions.map((lh) => (
              <button
                key={lh.id}
                type="button"
                onClick={() => setLineHeight(lh.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  lineHeight === lh.id
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Width */}
        <div className="flex items-center justify-between gap-3 text-xs pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Tab Indentation</span>
            <p className="text-[10px] text-neutral-500">Spaces per tab key</p>
          </div>
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80">
            {[2, 4].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setTabSize(sz as 2 | 4)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                  tabSize === sz
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {sz} spaces
              </button>
            ))}
          </div>
        </div>

        {/* Keymap Mode: Standard vs Vim */}
        <div className="flex items-center justify-between gap-3 text-xs pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">Editor Keybindings</span>
            <p className="text-[10px] text-neutral-500">Standard shortcuts vs modal Vim editing</p>
          </div>
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80">
            <button
              type="button"
              onClick={() => setKeymapMode('default')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                keymapMode === 'default'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setKeymapMode('vim')}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                keymapMode === 'vim'
                  ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Vim Mode
            </button>
          </div>
        </div>
      </div>

      {/* 3. Editor Toggles */}
      <div className="p-3.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-neutral-900 dark:text-white">Word Wrap</span>
            <p className="text-[10px] text-neutral-500">Wrap long lines to fit the editor pane width</p>
          </div>
          <ToggleSwitch checked={wordWrap} onChange={setWordWrap} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="font-medium text-neutral-900 dark:text-white">Gutter Line Numbers</span>
            <p className="text-[10px] text-neutral-500">Display discreet line numbering on the left margin</p>
          </div>
          <ToggleSwitch checked={lineNumbers} onChange={setLineNumbers} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="font-medium text-neutral-900 dark:text-white">Auto-Close Brackets &amp; Quotes</span>
            <p className="text-[10px] text-neutral-500">Automatically pair (), [], {}, &quot;&quot;, and ``</p>
          </div>
          <ToggleSwitch checked={autoCloseBrackets} onChange={setAutoCloseBrackets} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="font-medium text-neutral-900 dark:text-white">Typewriter Centering</span>
            <p className="text-[10px] text-neutral-500">Keep the active writing line centered on the screen</p>
          </div>
          <ToggleSwitch checked={typewriterMode} onChange={setTypewriterMode} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="font-medium text-neutral-900 dark:text-white">Paragraph Focus Mode</span>
            <p className="text-[10px] text-neutral-500">Dim surrounding text to isolate the current paragraph</p>
          </div>
          <ToggleSwitch checked={focusMode} onChange={setFocusMode} />
        </div>
      </div>

      {/* 4. Live Specimen Card */}
      <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 text-xs">
        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-neutral-200/50 dark:border-neutral-800/50 text-[10px] text-neutral-400 font-mono">
          <span>PREVIEW // {fontFamily}</span>
          <span>{fontSize}px • {lineHeight}</span>
        </div>
        <div
          style={{
            fontFamily: `"${fontFamily}", ui-monospace, monospace`,
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight === 'compact' ? '1.4' : lineHeight === 'relaxed' ? '1.8' : '1.6',
          }}
          className="text-neutral-800 dark:text-neutral-200 select-none"
        >
          <span className="text-[#8257F5] dark:text-[#9E7EFF] font-bold"># Focus &amp; Simplicity</span>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            A distraction-free writing environment built for clarity and speed.
          </p>
        </div>
      </div>
    </div>
  );
};
