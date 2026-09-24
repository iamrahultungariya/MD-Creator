import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Search, 
  ArrowRight, 
  Download 
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { MILESTONES, UpdateCategory } from '../data/productUpdates';
import { renderWithRichIcons, RichIcon } from '../utils/richIcons';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { PwaInstallModal } from '../components/common/PwaInstallModal';

export const UpdatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isInstalled } = usePwaInstall();
  const [activeCategory, setActiveCategory] = useState<UpdateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  const filteredMilestones = useMemo(() => {
    return MILESTONES.filter(m => {
      const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        m.version.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.highlights.some(h => h.text.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const getBadgeStyle = (type: 'new' | 'improved' | 'perf' | 'fix') => {
    switch (type) {
      case 'new':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80';
      case 'perf':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/80';
      case 'improved':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/80';
      case 'fix':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/80';
    }
  };

  const getBadgeLabel = (type: 'new' | 'improved' | 'perf' | 'fix') => {
    switch (type) {
      case 'new': return 'New';
      case 'perf': return '60FPS Perf';
      case 'improved': return 'Improved';
      case 'fix': return 'Resolved';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-5 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-mono uppercase tracking-wider text-[11px]">Product Evolution &amp; Changelog</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-neutral-900 dark:text-neutral-100 font-bold">v0.8.0 Beta Live</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.08] mb-5">
            Crafted for speed. <br className="hidden sm:inline" />
            <span className="text-blue-600 dark:text-blue-500">Refined for focus.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-8">
            Explore every architectural upgrade, performance milestone, and new feature designed to make Markdown writing distraction-free.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-left">
            <div className="p-3">
              <div className="text-xs text-neutral-400 font-medium">Initial Bundle</div>
              <div className="text-lg font-black text-neutral-950 dark:text-white mt-0.5">31.9 kB</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">-98.8% reduction</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-neutral-400 font-medium">Image Studio</div>
              <div className="text-lg font-black text-neutral-950 dark:text-white mt-0.5">WebP Engine</div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">Paste &amp; compress</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-neutral-400 font-medium">KaTeX Studio</div>
              <div className="text-lg font-black text-neutral-950 dark:text-white mt-0.5">20+ Formulas</div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">1-click insert</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-neutral-400 font-medium">Universal Style</div>
              <div className="text-lg font-black text-neutral-950 dark:text-white mt-0.5 flex items-center gap-1.5">
                <span>Rich Icons</span>
                <RichIcon icon="🚀" size={18} />
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">All operating systems</div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-10 pb-4 border-b border-neutral-100 dark:border-neutral-850">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'All Releases' },
              { id: 'engine', label: '⚡ Engine & 60FPS' },
              { id: 'publishing', label: '📄 PDF Studio' },
              { id: 'ux', label: '✨ UI & Carets' },
              { id: 'sync', label: '☁️ Cloud Sync' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as UpdateCategory)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {renderWithRichIcons(cat.label)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search updates..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
            />
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="relative border-l-2 border-neutral-200/80 dark:border-neutral-800 ml-4 sm:ml-8 space-y-12 pl-6 sm:pl-10">
          {filteredMilestones.map((milestone) => {
            const Icon = milestone.icon;
            return (
              <div key={milestone.version} className="relative group">
                {/* Timeline Node Badge */}
                <div className={`absolute -left-[37px] sm:-left-[53px] top-0 w-9 h-9 rounded-full border-2 border-white dark:border-neutral-950 flex items-center justify-center shadow-md ${milestone.iconBg} ${milestone.iconColor}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>

                {/* Milestone Container Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs">
                        {milestone.version}
                      </span>
                      {milestone.isLatest && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Current Flagship
                        </span>
                      )}
                      <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                        • {milestone.categoryLabel}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                      {milestone.date}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white mb-2.5 leading-snug tracking-tight">
                    {renderWithRichIcons(milestone.title)}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                    {renderWithRichIcons(milestone.summary)}
                  </p>

                  {/* Highlights Grid */}
                  <div className="space-y-2.5 pt-4 border-t border-neutral-200/70 dark:border-neutral-800">
                    {milestone.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border mt-0.5 ${getBadgeStyle(h.type)}`}>
                          {getBadgeLabel(h.type)}
                        </span>
                        <span className="leading-relaxed">{renderWithRichIcons(h.text)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick CTAs for Flagship */}
                  {milestone.isLatest && (
                    <div className="mt-6 pt-5 border-t border-neutral-200/70 dark:border-neutral-800 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => navigate('/editor')}
                        className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <span>Open Editor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {!isInstalled && (
                        <button
                          onClick={() => setIsPwaModalOpen(true)}
                          className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-500" />
                          <span>Install PWA</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />

      {/* PWA Install Modal */}
      <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
    </div>
  );
};
