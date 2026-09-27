import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { useConfirmStore } from './stores/useConfirmStore';
import { useToolbarSettingsStore } from './stores/useToolbarSettingsStore';
import { PageLoader } from './components/common/PageLoader';
import { useCommandPalette } from './hooks/useCommandPalette';
import { PageTransition } from './components/common/PageTransition';

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
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const PublicDocumentPage = React.lazy(() => import('./pages/PublicDocumentPage').then((m) => ({ default: m.PublicDocumentPage })));

// Lazy-loaded global utility modals
const GlobalConfirmDialog = React.lazy(() =>
  import('./components/common/GlobalConfirmDialog').then((m) => ({ default: m.GlobalConfirmDialog }))
);
const CommandPaletteModal = React.lazy(() =>
  import('./components/common/CommandPaletteModal').then((m) => ({ default: m.CommandPaletteModal }))
);
const BuyCoffeeModal = React.lazy(() =>
  import('./components/common/BuyCoffeeModal').then((m) => ({ default: m.BuyCoffeeModal }))
);
const ToolbarSettingsModal = React.lazy(() =>
  import('./components/editor/ToolbarSettingsModal').then((m) => ({ default: m.ToolbarSettingsModal }))
);

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');

  // STRICT REQUIREMENT: Zero animations on editor typing canvas (0ms typing latency)
  if (isEditor) {
    return (
      <Routes location={location} key="editor-routes">
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    );
  }

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
      <Route path="/documents" element={<PageTransition><DocumentsPage /></PageTransition>} />
      <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
      <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
      <Route path="/updates" element={<PageTransition><UpdatesPage /></PageTransition>} />
      <Route path="/features" element={<PageTransition><FeaturesPage /></PageTransition>} />
      <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
      <Route path="/feedback" element={<PageTransition><FeedbackPage /></PageTransition>} />
      <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
      <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
      <Route path="/p/:slug" element={<PageTransition><PublicDocumentPage /></PageTransition>} />
      <Route path="/share/:slug" element={<PageTransition><PublicDocumentPage /></PageTransition>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const { isOpen: isConfirmOpen } = useConfirmStore();
  const { isOpen: isToolbarSettingsOpen } = useToolbarSettingsStore();
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
      {/* Global Confirm Dialog */}
      {isConfirmOpen && (
        <Suspense fallback={null}>
          <GlobalConfirmDialog />
        </Suspense>
      )}

      {/* Command Palette Modal */}
      {cmd.isOpen && (
        <Suspense fallback={null}>
          <CommandPaletteModal isOpen={cmd.isOpen} onClose={cmd.closePalette} />
        </Suspense>
      )}

      {/* Buy Me a Coffee Modal */}
      {isCoffeeOpen && (
        <Suspense fallback={null}>
          <BuyCoffeeModal isOpen={isCoffeeOpen} onClose={() => setIsCoffeeOpen(false)} />
        </Suspense>
      )}

      {/* Floating Toolbar Settings Modal */}
      {isToolbarSettingsOpen && (
        <Suspense fallback={null}>
          <ToolbarSettingsModal />
        </Suspense>
      )}

      <Suspense fallback={<PageLoader />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
};
