import React, { useState } from 'react';
import { 
  PenLine, 
  Check, 
  Bold, 
  Italic, 
  Link2, 
  Image as ImageIcon, 
  List, 
  Sparkles,
  Quote as QuoteIcon
} from 'lucide-react';

type FormatType = 'h1' | 'bold' | 'italic' | 'quote' | 'code' | 'list' | 'image' | 'link';

export const BentoEditorCard: React.FC = () => {
  // 1. Interactive Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'Live Preview': true,
    'Auto Save': true,
    'Keyboard Shortcuts': true,
    'Word Count': true,
    'Full Screen Mode': false,
  });

  // 2. Interactive Active Format
  const [activeFormat, setActiveFormat] = useState<FormatType>('h1');

  // 3. Image Presets for the Image Choice Feature
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const imagePresets = [
    {
      label: 'Desk',
      title: 'Minimal Desk',
      url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Nature',
      title: 'Alpine Peak',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Studio',
      title: 'Writing Studio',
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const menuItems: { id: FormatType; prefix: string; label: string }[] = [
    { id: 'h1', prefix: 'H1', label: 'Heading 1' },
    { id: 'bold', prefix: 'B', label: 'Bold Text' },
    { id: 'italic', prefix: 'I', label: 'Italic Text' },
    { id: 'quote', prefix: '""', label: 'Blockquote' },
    { id: 'code', prefix: 'Code', label: 'Code Block' },
    { id: 'list', prefix: 'List', label: 'Bulleted List' },
    { id: 'image', prefix: 'Img', label: 'Image Embed' },
    { id: 'link', prefix: 'Link', label: 'Insert Link' },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_30px_-6px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between relative overflow-hidden transition-all group">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
            <PenLine className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Rich Editing Experience
          </span>
        </div>

        <h3 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
          Focus on Your Ideas
        </h3>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2 mb-4">
          Syntax highlighting, live preview, shortcuts, and a clean interface — made for deep work.
        </p>
      </div>

      {/* Middle Interactive Section: Checklist & Formatting Mockup */}
      <div className="grid grid-cols-12 gap-3 my-2 items-start">
        {/* Left Column: Interactive Checklist */}
        <div className="col-span-5 space-y-1.5 pt-1">
          {Object.keys(checkedItems).map((item) => {
            const isChecked = checkedItems[item];
            return (
              <button
                key={item}
                onClick={() => toggleCheck(item)}
                className={`w-full flex items-center gap-2 text-left text-xs font-medium transition-all py-1 px-1.5 rounded-lg cursor-pointer ${
                  isChecked
                    ? 'text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60'
                    : 'text-neutral-400 dark:text-neutral-500 line-through hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
                title={`Click to toggle ${item}`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isChecked
                      ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-2xs'
                      : 'border border-neutral-300 dark:border-neutral-700 bg-transparent'
                  }`}
                >
                  {isChecked && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                </div>
                <span className="truncate text-[11px]">{item}</span>
              </button>
            );
          })}

          {/* Quick Commands Badge */}
          <div className="pt-2">
            <button
              onClick={() => {
                // Cycle format on click
                const order: FormatType[] = ['h1', 'bold', 'image', 'quote', 'code'];
                const nextIdx = (order.indexOf(activeFormat) + 1) % order.length;
                setActiveFormat(order[nextIdx]);
              }}
              className="inline-flex items-center gap-1.5 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Click to cycle formatting mode"
            >
              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 text-[10px] font-mono font-bold text-neutral-800 dark:text-neutral-200 shadow-2xs">
                Ctrl
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 text-[10px] font-mono font-bold text-neutral-800 dark:text-neutral-200 shadow-2xs">
                /
              </span>
            </button>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium flex items-center gap-1">
              <span>Quick Commands</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-spin" />
            </div>
          </div>
        </div>

        {/* Right Column: Floating Slash Menu & Interactive Toolbar */}
        <div className="col-span-7">
          <div className="rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-md p-2 text-xs select-none">
            {/* Horizontal Mini Toolbar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800/80 text-neutral-500 dark:text-neutral-400 text-[10px]">
              <button
                onClick={() => setActiveFormat('h1')}
                className={`px-1 py-0.5 rounded transition-colors cursor-pointer font-bold ${
                  activeFormat === 'h1' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' : 'hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                onClick={() => setActiveFormat('bold')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  activeFormat === 'bold' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' : 'hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Bold"
              >
                <Bold className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveFormat('italic')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  activeFormat === 'italic' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' : 'hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Italic"
              >
                <Italic className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveFormat('link')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  activeFormat === 'link' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' : 'hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Link"
              >
                <Link2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveFormat('image')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  activeFormat === 'image' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' : 'hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Image Embed"
              >
                <ImageIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveFormat('list')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  activeFormat === 'list' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' : 'hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="List"
              >
                <List className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveFormat('quote')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  activeFormat === 'quote' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' : 'hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Quote"
              >
                <QuoteIcon className="w-3 h-3" />
              </button>
            </div>

            {/* Vertical Menu Items with Click Interaction */}
            <div className="space-y-0.5 max-h-[140px] overflow-hidden text-[10.5px]">
              {menuItems.slice(0, 5).map((menu) => {
                const isSelected = activeFormat === menu.id;
                return (
                  <button
                    key={menu.label}
                    onClick={() => setActiveFormat(menu.id)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9.5px] w-5 text-left ${
                        isSelected ? 'text-white/80 dark:text-neutral-800' : 'text-neutral-400'
                      }`}>
                        {menu.prefix}
                      </span>
                      <span className="truncate">{menu.label}</span>
                    </div>
                    {isSelected && <Check className="w-2.5 h-2.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Result Sandbox Area (Changes dynamically on choice!) */}
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold">
            Live Output Preview
          </span>
          <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900">
            {activeFormat.toUpperCase()}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800 min-h-[60px] flex items-center transition-all">
          {/* Format 1: Heading */}
          {activeFormat === 'h1' && (
            <div className="w-full animate-in fade-in duration-200">
              <h4 className="text-sm font-black text-neutral-950 dark:text-white tracking-tight">
                # Focus on Deep Work
              </h4>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Clarity of thought begins with distraction-free writing.
              </p>
            </div>
          )}

          {/* Format 2: Bold Text */}
          {activeFormat === 'bold' && (
            <div className="w-full animate-in fade-in duration-200">
              <p className="text-xs text-neutral-900 dark:text-white leading-relaxed">
                <strong>Eliminate cognitive noise</strong> to produce real craft with zero friction.
              </p>
            </div>
          )}

          {/* Format 3: Italic Text */}
          {activeFormat === 'italic' && (
            <div className="w-full animate-in fade-in duration-200">
              <p className="text-xs italic text-neutral-700 dark:text-neutral-300 leading-relaxed">
                &ldquo;Focus is saying no to a hundred other good ideas.&rdquo;
              </p>
            </div>
          )}

          {/* Format 4: Blockquote */}
          {activeFormat === 'quote' && (
            <div className="w-full pl-2 border-l-2 border-amber-500 text-[11px] text-neutral-600 dark:text-neutral-300 italic animate-in fade-in duration-200">
              &gt; Progress over perfection. Small steps create big changes.
            </div>
          )}

          {/* Format 5: Code Block */}
          {activeFormat === 'code' && (
            <div className="w-full font-mono text-[10px] bg-neutral-900 text-emerald-400 p-2 rounded-lg overflow-x-auto animate-in fade-in duration-200">
              <code>const state = &#123; isFocused: true, mode: &apos;local-first&apos; &#125;;</code>
            </div>
          )}

          {/* Format 6: Bulleted List */}
          {activeFormat === 'list' && (
            <ul className="w-full list-disc pl-4 space-y-0.5 text-[10.5px] text-neutral-700 dark:text-neutral-300 animate-in fade-in duration-200">
              <li>Outline thoughts clearly</li>
              <li>Type with 0ms visual latency</li>
              <li>Export to publication PDF</li>
            </ul>
          )}

          {/* Format 7: Image Embed with Chooser! */}
          {activeFormat === 'image' && (
            <div className="w-full flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <img
                  src={imagePresets[selectedImageIndex].url}
                  alt={imagePresets[selectedImageIndex].title}
                  className="w-12 h-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                />
                <div>
                  <div className="text-[11px] font-bold text-neutral-900 dark:text-white">
                    ![{imagePresets[selectedImageIndex].title}]
                  </div>
                  <div className="text-[9.5px] text-neutral-400 font-mono">
                    image/{imagePresets[selectedImageIndex].label.toLowerCase()}.jpg
                  </div>
                </div>
              </div>

              {/* Image Preset Picker Buttons */}
              <div className="flex items-center gap-1">
                {imagePresets.map((preset, idx) => (
                  <button
                    key={preset.label}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-semibold transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                        : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Format 8: Insert Link */}
          {activeFormat === 'link' && (
            <div className="w-full flex items-center gap-2 text-xs animate-in fade-in duration-200">
              <Link2 className="w-3.5 h-3.5 text-blue-500" />
              <a
                href="#features"
                onClick={(e) => e.preventDefault()}
                className="text-blue-600 dark:text-blue-400 underline font-medium text-[11px]"
              >
                [MD Writer Documentation](https://mdwriter.app/docs)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
