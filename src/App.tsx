import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './stores/useAuthStore';
import { useConfirmStore } from './stores/useConfirmStore';
import { useToolbarSettingsStore } from './stores/useToolbarSettingsStore';
import { PageLoader } from './components/common/PageLoader';
import { useCommandPalette } from './hooks/useCommandPalette';
import { PageTransition } from './components/common/PageTransition';

// Lazy-loaded route chunks
const WhatsNewToast = React.lazy(() =>
  import('./components/common/WhatsNewToast').then((m) => ({ default: m.WhatsNewToast }))
);
const UpdateChangelogModal = React.lazy(() =>
  import('./components/common/UpdateChangelogModal').then((m) => ({ default: m.UpdateChangelogModal }))
);
const HomePage = React.lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const EditorPage = React.lazy(() => import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })));
const DocumentsPage = React.lazy(() => import('./pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const UpdatesPage = React.lazy(() => import('./pages/UpdatesPage').then((m) => ({ default: m.UpdatesPage })));
const FeedbackPage = React.lazy(() => import('./pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage })));
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
const PreferencesModal = React.lazy(() =>
  import('./components/common/PreferencesModal').then((m) => ({ default: m.PreferencesModal }))
);
const RecordingHud = React.lazy(() =>
  import('./features/clip-studio/components/RecordingHud').then((m) => ({ default: m.RecordingHud }))
);
const ClipStudioModal = React.lazy(() =>
  import('./features/clip-studio/components/ClipStudioModal').then((m) => ({ default: m.ClipStudioModal }))
);
import { useRecorderStore } from './features/clip-studio/stores/useRecorderStore';
import { usePreferencesStore } from './stores/usePreferencesStore';


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
        <Route path="/updates" element={<PageTransition><Suspense fallback={<PageLoader />}><UpdatesPage /></Suspense></PageTransition>} />
        <Route path="/feedback" element={<PageTransition><Suspense fallback={<PageLoader />}><FeedbackPage /></Suspense></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Suspense fallback={<PageLoader />}><AuthPage /></Suspense></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Suspense fallback={<PageLoader />}><AdminPage /></Suspense></PageTransition>} />
        <Route path="/p/:slug" element={<PageTransition><Suspense fallback={<PageLoader />}><PublicDocumentPage /></Suspense></PageTransition>} />
        <Route path="/share/:slug" element={<PageTransition><Suspense fallback={<PageLoader />}><PublicDocumentPage /></Suspense></PageTransition>} />
        {/* Graceful redirects for pruned pages */}
        <Route path="/about" element={<Navigate to="/" replace />} />
        <Route path="/pricing" element={<Navigate to="/" replace />} />
        <Route path="/blog" element={<Navigate to="/" replace />} />
        <Route path="/features" element={<Navigate to="/" replace />} />
        <Route path="/settings" element={<Navigate to="/editor" replace />} />
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
  const { isRecording, isStudioOpen, recordedClip, closeStudio } = useRecorderStore();
  const { isOpen: isPreferencesOpen, openPreferences, togglePreferences } = usePreferencesStore();

  // Global listeners for Preferences (Ctrl+, / Cmd+, and custom event)
  useEffect(() => {
    const handleOpenPref = () => openPreferences();
    window.addEventListener('open-preferences-modal', handleOpenPref);

    const handlePrefKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        togglePreferences();
      }
    };
    window.addEventListener('keydown', handlePrefKeyDown);

    return () => {
      window.removeEventListener('open-preferences-modal', handleOpenPref);
      window.removeEventListener('keydown', handlePrefKeyDown);
    };
  }, [openPreferences, togglePreferences]);

  // Global Screen Recording shortcut (Ctrl+Alt+R / Cmd+Alt+R) - Works on ANY page without document requirement!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const state = useRecorderStore.getState();
        if (state.isRecording) {
          state.stopRecording();
        } else {
          state.startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

      {/* Floating Toolbar Settings Modal */}
      {isToolbarSettingsOpen && (
        <Suspense fallback={null}>
          <ToolbarSettingsModal />
        </Suspense>
      )}

      {/* 0.9.2 Beta What's New Toast & Modal */}
      <Suspense fallback={null}>
        <WhatsNewToast onOpenModal={() => setIsUpdateModalOpen(true)} />
        {isUpdateModalOpen && (
          <UpdateChangelogModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />
        )}
      </Suspense>

      {/* Floating Screen Recording HUD */}
      {isRecording && (
        <Suspense fallback={null}>
          <RecordingHud />
        </Suspense>
      )}

      {/* Social Clip Studio Review Modal */}
      {isStudioOpen && (
        <Suspense fallback={null}>
          <ClipStudioModal
            isOpen={isStudioOpen}
            onClose={closeStudio}
            recordedClip={recordedClip}
          />
        </Suspense>
      )}

      {/* Global Preferences Modal (Ctrl+,) */}
      {isPreferencesOpen && (
        <Suspense fallback={null}>
          <PreferencesModal />
        </Suspense>
      )}

      <AppRoutes />
    </BrowserRouter>
  );
};
