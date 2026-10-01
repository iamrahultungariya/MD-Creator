import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, ArrowRight, Check, FileText, Code2 } from 'lucide-react';

interface BentoExportCardProps {
  onExportClick?: () => void;
}

export const BentoExportCard: React.FC<BentoExportCardProps> = ({ onExportClick }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onExportClick) {
      onExportClick();
    } else {
      navigate('/editor');
    }
  };

  return (
    <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_30px_-6px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between relative overflow-hidden transition-all group">
      {/* Top Content Area */}
      <div>
        {/* Export Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
            <Share2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Export Anywhere
          </span>
        </div>

        {/* Heading */}
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug text-neutral-950 dark:text-white">
          From Markdown to <br />
          Beautiful Documents
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2.5 max-w-xs">
          Export to PDF, HTML, DOCX and more with a single click. Clean formatting, zero hassle.
        </p>

        {/* Action Button */}
        <button
          onClick={handleAction}
          className="mt-4 px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer group/btn"
        >
          <span>Export Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Center 3D Floating Document Cards Visualization */}
      <div className="relative h-44 my-4 flex items-center justify-center select-none pointer-events-none">
        {/* PDF Card (Featured Front) */}
        <div className="absolute z-30 left-14 sm:left-20 w-24 h-32 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700 shadow-xl p-3 flex flex-col items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300">
          <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xs text-red-600 tracking-wider">PDF</span>
          <div className="w-12 h-1 bg-neutral-100 dark:bg-neutral-700 rounded-full mt-2.5" />
          <div className="w-8 h-1 bg-neutral-100 dark:bg-neutral-700 rounded-full mt-1" />
        </div>

        {/* Word / DOCX Card (Right Top) */}
        <div className="absolute z-20 right-10 sm:right-16 top-4 w-22 h-28 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-lg p-2.5 flex flex-col items-center justify-center transform rotate-12">
          <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-2xs">
            W
          </div>
          <div className="w-10 h-1 bg-neutral-100 dark:bg-neutral-700 rounded-full mt-2" />
        </div>

        {/* HTML Card (Right Middle) */}
        <div className="absolute z-10 right-4 sm:right-8 top-12 w-22 h-28 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 shadow-md p-2.5 flex flex-col items-center justify-center transform rotate-6">
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center mb-1">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-sky-500 font-mono">HTML</span>
        </div>

        {/* Plain Text Card (Back Base) */}
        <div className="absolute z-0 right-16 sm:right-24 bottom-2 w-20 h-24 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800 shadow-xs p-2 flex flex-col items-center justify-center transform -rotate-12">
          <div className="w-8 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mb-1" />
          <div className="w-6 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mb-1" />
          <div className="w-7 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
        </div>
      </div>

      {/* Bottom Checklist Format Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {['PDF', 'DOCX', 'HTML', 'Text'].map((format) => (
          <div
            key={format}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white dark:text-neutral-200 text-[11px] font-semibold shadow-2xs"
          >
            <Check className="w-3 h-3 text-white dark:text-neutral-300" strokeWidth={3} />
            <span>{format}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
