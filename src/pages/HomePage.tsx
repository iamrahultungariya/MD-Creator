import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/home/Navbar';
import { Hero } from '../components/home/Hero';
import { FeatureStrip } from '../components/home/FeatureStrip';
import { BentoFeatures } from '../components/home/BentoFeatures';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { Footer } from '../components/home/Footer';

// Code-split heavy interactive modals on-demand
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Sticky Navigation */}
      <Navbar 
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenFeatures={() => {
          const el = document.getElementById('features');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenUpdates={() => navigate('/updates')}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Laptop Mockup */}
        <Hero onOpenTemplates={() => setIsTemplatesOpen(true)} />

        {/* 5-Item Highlights Strip */}
        <FeatureStrip />

        {/* Bento Grid Features */}
        <BentoFeatures 
          onExploreFeatures={() => navigate('/features')} 
          onOpenUpdates={() => navigate('/updates')}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
        />

        {/* Top 5 Verified Community Reviews + Review Submission */}
        <ReviewsSection />
      </main>

      {/* Footer */}
      <Footer onOpenUpdates={() => navigate('/updates')} />

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
