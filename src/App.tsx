import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { useConfirmStore } from './stores/useConfirmStore';
import { PageLoader } from './components/common/PageLoader';
import { useCommandPalette } from './hooks/useCommandPalette';

// Lazy-loaded route chunks
const HomePage = React.lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const EditorPage = React.lazy(() => import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })));
const DocumentsPage = React.lazy(() => import('./pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const PricingPage = React.lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const BlogPage = React.lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const UpdatesPage = React.lazy(() => import('./pages/UpdatesPage').then((m) => ({ default: m.UpdatesPage })));
const FeedbackPage = React.lazy(() => import('./pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage })));
const FeaturesPage = React.lazy(() => import('./pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const PublicDocumentPage = React.lazy(() => import('./pages/PublicDocumentPage').then((m) => ({ default: m.PublicDocumentPage })));

// Lazy-loaded global utility modals (zero impact on initial critical render)
const GlobalConfirmDialog = React.lazy(() =>
  import('./components/common/GlobalConfirmDialog').then((m) => ({ default: m.GlobalConfirmDialog }))
);
const CommandPaletteModal = React.lazy(() =>
  import('./components/common/CommandPaletteModal').then((m) => ({ default: m.CommandPaletteModal }))
);
const BuyCoffeeModal = React.lazy(() =>
  import('./components/common/BuyCoffeeModal').then((m) => ({ default: m.BuyCoffeeModal }))
);

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const { isOpen: isConfirmOpen } = useConfirmStore();
  const cmd = useCommandPalette();
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);

  // Global listener for Buy Me a Coffee modal trigger
  useEffect(() => {
    const handleOpenCoffee = () => setIsCoffeeOpen(true);
    window.addEventListener('open-buy-coffee', handleOpenCoffee);
    return () => window.removeEventListener('open-buy-coffee', handleOpenCoffee);
  }, []);

  // Defer non-critical storage initialization and session checks until idle
  useEffect(() => {
    const initAppServices = () => {
      import('./db/seed')
        .then((m) => m.seedInitialDocuments())
        .catch(console.error);
      checkAuth().catch(console.error);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(initAppServices, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(initAppServices, 50);
      return () => clearTimeout(timer);
    }
  }, [checkAuth]);

  return (
    <BrowserRouter>
      {/* Global Confirm Dialog — Lazy Loaded strictly when triggered */}
      {isConfirmOpen && (
        <Suspense fallback={null}>
          <GlobalConfirmDialog />
        </Suspense>
      )}

      {/* Command Palette Modal — Lazy Loaded when triggered */}
      {cmd.isOpen && (
        <Suspense fallback={null}>
          <CommandPaletteModal isOpen={cmd.isOpen} onClose={cmd.closePalette} />
        </Suspense>
      )}

      {/* Buy Me a Coffee Modal — Lazy Loaded on-demand */}
      {isCoffeeOpen && (
        <Suspense fallback={null}>
          <BuyCoffeeModal isOpen={isCoffeeOpen} onClose={() => setIsCoffeeOpen(false)} />
        </Suspense>
      )}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/p/:slug" element={<PublicDocumentPage />} />
          <Route path="/share/:slug" element={<PublicDocumentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
