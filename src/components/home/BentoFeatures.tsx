import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BentoHeroCard } from './bento/BentoHeroCard';
import { BentoExportCard } from './bento/BentoExportCard';
import { BentoEditorCard } from './bento/BentoEditorCard';
import { BentoTemplatesCard } from './bento/BentoTemplatesCard';
import { BentoWorkflowsCard } from './bento/BentoWorkflowsCard';
import { BentoCalmerCard } from './bento/BentoCalmerCard';
import { BentoWhatsNewCard } from './bento/BentoWhatsNewCard';

interface BentoFeaturesProps {
  onExploreFeatures?: () => void;
  onOpenUpdates?: () => void;
  onOpenTemplates?: () => void;
  onExportClick?: () => void;
}

export const BentoFeatures: React.FC<BentoFeaturesProps> = ({ 
  onExploreFeatures, 
  onOpenUpdates,
  onOpenTemplates,
  onExportClick,
}) => {
  return (
    <section id="features" className="py-14 sm:py-20 relative overflow-hidden bg-neutral-50/40 dark:bg-black/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-7">
        
        {/* Row 1: Flagship Bento - 2 Columns (Hero 8 cols, Export 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">
          <BentoHeroCard onOpenTemplates={onOpenTemplates} />
          <BentoExportCard onExportClick={onExportClick || onExploreFeatures} />
        </div>

        {/* Row 2: Workflow Trio - 3 Columns (Editor, Templates, Modern Workflows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          <BentoEditorCard />
          <BentoTemplatesCard onOpenTemplates={onOpenTemplates} />
          <BentoWorkflowsCard />
        </div>

        {/* Row 3: Focus & Platform Highlights - 2 Columns (Calmer 7 cols, What's New 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">
          <BentoCalmerCard />
          <BentoWhatsNewCard onOpenUpdates={onOpenUpdates} />
        </div>

        {/* Explore All Features Deep Dive Button */}
        <div className="pt-6 flex justify-center">
          <button
            onClick={onExploreFeatures}
            className="px-6 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 text-neutral-900 dark:text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md cursor-pointer group"
          >
            <span>Explore All 25+ Features &amp; Deep Dives</span>
            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
