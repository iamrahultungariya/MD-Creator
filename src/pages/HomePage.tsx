import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Hero } from '../components/home/Hero';
import { BentoFeatures } from '../components/home/BentoFeatures';
import { RoadmapSection } from '../components/home/RoadmapSection';

// Code-split heavy below-the-fold sections and interactive modals on-demand
const ReviewsSection = React.lazy(() =>
  import('../components/home/ReviewsSection').then((m) => ({ default: m.ReviewsSection }))
);
const Footer = React.lazy(() =>
  import('../components/home/Footer').then((m) => ({ default: m.Footer }))
);
const TemplatesModal = React.lazy(() =>
  import('../components/home/TemplatesModal').then((m) => ({ default: m.TemplatesModal }))
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Global listener for Templates modal trigger and URL query param
  useEffect(() => {
    const handleOpenTemplates = () => setIsTemplatesOpen(true);
    window.addEventListener('open-templates-modal', handleOpenTemplates);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('templates') === 'open' || params.get('templates') === 'true') {
        setIsTemplatesOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    return () => {
      window.removeEventListener('open-templates-modal', handleOpenTemplates);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Sticky Navigation */}
      <Navbar 
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenFeatures={() => {
          const el = document.getElementById('features');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Notion-Style Centered Hero with Interactive Studio Showcase */}
        <Hero onOpenTemplates={() => setIsTemplatesOpen(true)} />

        {/* 3-Block Notion-Style Features Story */}
        <BentoFeatures 
          onExploreFeatures={() => navigate('/editor')} 
          onOpenTemplates={() => setIsTemplatesOpen(true)}
        />

        {/* Dedicated Product Roadmap & What's New */}
        <RoadmapSection />

        {/* 3-Column Minimal Verified Community Reviews */}
        <Suspense fallback={<div className="h-32" />}>
          <ReviewsSection />
        </Suspense>

        {/* Grounded & Honest Bottom Call-to-Action */}
        <section className="py-20 sm:py-24 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/30 text-center font-sans">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-white tracking-[-0.03em]">
              Ready to write focused documents?
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Your thoughts, checklists, and notes preserved cleanly in plain text. Auto-saves as you type, with direct export to PDF, Word, or Markdown.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => navigate('/editor')}
                className="w-full sm:w-auto px-7 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.01] font-sans"
              >
                <span>Open Editor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs font-sans"
              >
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <span>Browse Blueprints</span>
              </button>
            </div>

            <p className="text-xs text-neutral-400 font-mono pt-4">
              Works 100% Offline • Export to PDF, Word &amp; Markdown • Quick &apos;/&apos; Slash Commands
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Suspense fallback={<div className="h-16" />}>
        <Footer />
      </Suspense>

      {/* Interactive Templates Modal — Lazy Loaded On-Demand */}
      {isTemplatesOpen && (
        <Suspense fallback={null}>
          <TemplatesModal 
            isOpen={isTemplatesOpen} 
            onClose={() => setIsTemplatesOpen(false)} 
          />
        </Suspense>
      )}
    </div>
  );
};
