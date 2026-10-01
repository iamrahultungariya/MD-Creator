import React from 'react';
import { 
  FolderSearch, 
  ArrowRight, 
  BookOpen, 
  User, 
  FileCode2, 
  Calendar, 
  PenTool, 
  FileText 
} from 'lucide-react';

interface BentoTemplatesCardProps {
  onOpenTemplates?: () => void;
}

export const BentoTemplatesCard: React.FC<BentoTemplatesCardProps> = ({ onOpenTemplates }) => {
  const templates = [
    {
      name: 'Project Brief',
      icon: BookOpen,
      iconColor: 'text-brand-500',
      bgColor: 'bg-brand-50 dark:bg-brand-950/50 border-brand-100 dark:border-brand-900/40',
    },
    {
      name: 'Project README',
      icon: FileText,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/40',
    },
    {
      name: 'API Reference',
      icon: FileCode2,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/40',
    },
    {
      name: 'Meeting Notes',
      icon: Calendar,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/40',
    },
    {
      name: 'Changelog',
      icon: PenTool,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/40',
    },
    {
      name: 'Daily Journal',
      icon: User,
      iconColor: 'text-neutral-600 dark:text-neutral-400',
      bgColor: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700/60',
    },
  ];

  return (
    <div id="templates" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_30px_-6px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between transition-all group">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
            <FolderSearch className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Templates for Everything
          </span>
        </div>

        <h3 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
          Start Faster
        </h3>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2 mb-6">
          Choose from beautifully crafted templates for notes, reports, resumes, documentation and more.
        </p>
      </div>

      {/* 2x3 Grid of Template Chips */}
      <div className="grid grid-cols-2 gap-2.5 my-auto">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.name}
              onClick={onOpenTemplates}
              className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all cursor-pointer group/item"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${tpl.bgColor}`}>
                <Icon className={`w-3.5 h-3.5 ${tpl.iconColor}`} />
              </div>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate group-hover/item:text-neutral-950 dark:group-hover/item:white">
                {tpl.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Link */}
      <div className="pt-6">
        <button
          onClick={onOpenTemplates}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer group/link"
        >
          <span>View All Templates</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
