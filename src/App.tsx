import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './stores/useAuthStore';
import { useConfirmStore } from './stores/useConfirmStore';
import { useToolbarSettingsStore } from './stores/useToolbarSettingsStore';
import { PageLoader } from './components/common/PageLoader';
import { useCommandPalette } from './hooks/useCommandPalette';
import { PageTransition } from './components/common/PageTransition';
import { WhatsNewToast } from './components/common/WhatsNewToast';
import { UpdateChangelogModal } from './components/common/UpdateChangelogModal';

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
const AdminPage = React.lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

// Lazy-loaded global utility modals
const GlobalConfirmDialog = React.lazy(() =>
  import('./components/common/GlobalConfirmDialog').then((m) => ({ default: m.GlobalConfirmDialog }))
);
const CommandPaletteModal = React.lazy(() =>
  import('./components/common/CommandPaletteModal').then((m) => ({ default: m.CommandPaletteModal }))
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
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key="editor-routes">
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Suspense fallback={<PageLoader />}><HomePage /></Suspense></PageTransition>} />
        <Route path="/documents" element={<PageTransition><Suspense fallback={<PageLoader />}><DocumentsPage /></Suspense></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Suspense fallback={<PageLoader />}><PricingPage /></Suspense></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Suspense fallback={<PageLoader />}><BlogPage /></Suspense></PageTransition>} />
        <Route path="/updates" element={<PageTransition><Suspense fallback={<PageLoader />}><UpdatesPage /></Suspense></PageTransition>} />
        <Route path="/features" element={<PageTransition><Suspense fallback={<PageLoader />}><FeaturesPage /></Suspense></PageTransition>} />
        <Route path="/about" element={<PageTransition><Suspense fallback={<PageLoader />}><AboutPage /></Suspense></PageTransition>} />
        <Route path="/feedback" element={<PageTransition><Suspense fallback={<PageLoader />}><FeedbackPage /></Suspense></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Suspense fallback={<PageLoader />}><AuthPage /></Suspense></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Suspense fallback={<PageLoader />}><SettingsPage /></Suspense></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Suspense fallback={<PageLoader />}><AdminPage /></Suspense></PageTransition>} />
        <Route path="/p/:slug" element={<PageTransition><Suspense fallback={<PageLoader />}><PublicDocumentPage /></Suspense></PageTransition>} />
        <Route path="/share/:slug" element={<PageTransition><Suspense fallback={<PageLoader />}><PublicDocumentPage /></Suspense></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const { isOpen: isConfirmOpen } = useConfirmStore();
  const { isOpen: isToolbarSettingsOpen } = useToolbarSettingsStore();
  const cmd = useCommandPalette();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

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

      {/* Floating Toolbar Settings Modal */}
      {isToolbarSettingsOpen && (
        <Suspense fallback={null}>
          <ToolbarSettingsModal />
        </Suspense>
      )}

      {/* 0.9.2 Beta What's New Toast & Modal */}
      <WhatsNewToast onOpenModal={() => setIsUpdateModalOpen(true)} />
      <UpdateChangelogModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />

      <AppRoutes />
    </BrowserRouter>
  );
};
