import React from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  BookOpen, 
  Terminal, 
  GraduationCap, 
  Briefcase, 
  Feather, 
  Sliders, 
  Check,
  Sun,
  Moon
} from 'lucide-react';
import { 
  PdfPreset, 
  FontFamily, 
  PageSize, 
  MarginSize, 
  PdfTheme,
  ACCENT_COLORS, 
  TocItem 
} from '../types';

interface PdfExportSidebarProps {
  preset: PdfPreset;
  onSelectPreset: (preset: PdfPreset) => void;
  pdfTheme: PdfTheme;
  onChangePdfTheme: (theme: PdfTheme) => void;
  fontFamily: FontFamily;
  onChangeFontFamily: (font: FontFamily) => void;
  accentColor: string;
  onChangeAccentColor: (color: string) => void;
  pageSize: PageSize;
  onChangePageSize: (size: PageSize) => void;
  margins: MarginSize;
  onChangeMargins: (margins: MarginSize) => void;
  includeCoverPage: boolean;
  onChangeIncludeCoverPage: (include: boolean) => void;
  coverSubtitle: string;
  onChangeCoverSubtitle: (subtitle: string) => void;
  coverAuthor: string;
  onChangeCoverAuthor: (author: string) => void;
  coverOrg: string;
  onChangeCoverOrg: (org: string) => void;
  includeToc: boolean;
  onChangeIncludeToc: (include: boolean) => void;
  tableOfContents: TocItem[];
  includePageNumbers: boolean;
  onChangeIncludePageNumbers: (include: boolean) => void;
  watermarkText: string;
  onChangeWatermarkText: (text: string) => void;
}

const PRESET_OPTIONS = [
  { id: 'editorial', name: 'Editorial', desc: 'Modern & Clean', icon: BookOpen },
  { id: 'technical', name: 'Technical RFC', desc: 'Monospace Spec', icon: Terminal },
  { id: 'academic', name: 'Academic', desc: 'Formal Serif & Citations', icon: GraduationCap },
  { id: 'corporate', name: 'Corporate', desc: 'Executive Brief', icon: Briefcase },
  { id: 'minimalist', name: 'Minimalist', desc: 'Pure Swiss Whitespace', icon: Feather },
] as const;

export const PdfExportSidebar: React.FC<PdfExportSidebarProps> = React.memo(({
  preset,
  onSelectPreset,
  pdfTheme,
  onChangePdfTheme,
  fontFamily,
  onChangeFontFamily,
  accentColor,
  onChangeAccentColor,
  pageSize,
  onChangePageSize,
  margins,
  onChangeMargins,
  includeCoverPage,
  onChangeIncludeCoverPage,
  coverSubtitle,
  onChangeCoverSubtitle,
  coverAuthor,
  onChangeCoverAuthor,
  coverOrg,
  onChangeCoverOrg,
  includeToc,
  onChangeIncludeToc,
  tableOfContents,
  includePageNumbers,
  onChangeIncludePageNumbers,
  watermarkText,
  onChangeWatermarkText,
}) => {
  return (
    <div
      data-pdf-studio-sidebar="true"
      className="w-full h-full min-h-0 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 overflow-y-auto pdf-studio-scroll-container p-4 sm:p-5 space-y-5 sm:space-y-6 text-xs"
    >
      {/* Section 0: Document Theme (Isolated Paper Light vs Midnight Dark) */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Document Theme</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-400 font-normal">Theme Isolation</span>
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80">
          <button
            type="button"
            onClick={() => onChangePdfTheme('light')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              pdfTheme === 'light'
                ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Paper Light</span>
          </button>
          <button
            type="button"
            onClick={() => onChangePdfTheme('dark')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              pdfTheme === 'dark'
                ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Midnight Dark</span>
          </button>
        </div>
      </div>

      {/* Section 1: Themes & Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-500" />
            <span>Design Presets</span>
          </label>
          <span className="text-[10px] text-neutral-400">Curated Styles</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRESET_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = preset === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPreset(item.id as PdfPreset)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950 shadow-md font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 opacity-80" />
                  <span className="text-xs font-bold">{item.name}</span>
                </div>
                <p className={`text-[10px] leading-tight ${isSelected ? 'opacity-80' : 'text-neutral-400'}`}>
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Typography & Colors */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/70">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-emerald-500" />
          <span>Typography & Accents</span>
        </label>

        {/* Font Family */}
        <div className="space-y-1.5">
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">Font Family</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'sans', label: 'Sans-Serif' },
              { id: 'serif', label: 'Serif' },
              { id: 'mono', label: 'Mono' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeFontFamily(f.id as FontFamily)}
                className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  fontFamily === f.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color Picker */}
        <div className="space-y-1.5">
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">Brand Accent Color</span>
          <div className="flex items-center gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChangeAccentColor(c.hex)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                  accentColor === c.hex ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {accentColor === c.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Paper & Layout */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/70">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-amber-500" />
          <span>Paper & Margins</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">Paper Format</span>
            <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 bg-neutral-100 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => onChangePageSize('a4')}
                className={`flex-1 py-1 rounded-md text-center font-semibold cursor-pointer ${
                  pageSize === 'a4' ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs' : 'text-neutral-500'
                }`}
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => onChangePageSize('letter')}
                className={`flex-1 py-1 rounded-md text-center font-semibold cursor-pointer ${
                  pageSize === 'letter' ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs' : 'text-neutral-500'
                }`}
              >
                US Letter
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">Page Margins</span>
            <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 bg-neutral-100 dark:bg-neutral-800">
              {(['compact', 'normal', 'wide'] as MarginSize[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChangeMargins(m)}
                  className={`flex-1 py-1 rounded-md text-center capitalize font-semibold cursor-pointer ${
                    margins === m ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs' : 'text-neutral-500'
                  }`}
                >
                  {m[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Document Structure Elements */}
      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/70">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-500" />
          <span>Structure & Branding</span>
        </label>

        {/* Cover Page Toggle */}
        <div className="space-y-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Standalone Cover Page
            </span>
            <input
              type="checkbox"
              checked={includeCoverPage}
              onChange={(e) => onChangeIncludeCoverPage(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
          </div>
          {includeCoverPage && (
            <div className="pt-2 space-y-2 border-t border-neutral-200 dark:border-neutral-700 animate-in fade-in duration-100">
              <input
                type="text"
                value={coverSubtitle}
                onChange={(e) => onChangeCoverSubtitle(e.target.value)}
                placeholder="Subtitle or Document Phase"
                className="w-full px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={coverAuthor}
                  onChange={(e) => onChangeCoverAuthor(e.target.value)}
                  placeholder="Author"
                  className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <input
                  type="text"
                  value={coverOrg}
                  onChange={(e) => onChangeCoverOrg(e.target.value)}
                  placeholder="Company / Org"
                  className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Auto Table of Contents */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
              Table of Contents (TOC)
            </span>
            <span className="text-[10px] text-neutral-400">
              Auto-generated from H1/H2/H3 headings ({tableOfContents.length} found)
            </span>
          </div>
          <input
            type="checkbox"
            checked={includeToc}
            onChange={(e) => onChangeIncludeToc(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>

        {/* Running Header & Footers */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
              Page Numbers & Header
            </span>
            <span className="text-[10px] text-neutral-400">
              Document title and running footer
            </span>
          </div>
          <input
            type="checkbox"
            checked={includePageNumbers}
            onChange={(e) => onChangeIncludePageNumbers(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>

        {/* Watermark */}
        <div className="space-y-1.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
            Document Watermark
          </span>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => onChangeWatermarkText(e.target.value)}
            placeholder="e.g. DRAFT, CONFIDENTIAL"
            className="w-full px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 uppercase font-mono text-[11px]"
          />
        </div>
      </div>
    </div>
  );
});

PdfExportSidebar.displayName = 'PdfExportSidebar';
