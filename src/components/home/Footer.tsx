import React, { useState, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePreferencesStore } from '../../stores/usePreferencesStore';

const LegalModal = React.lazy(() =>
  import('../common/LegalModal').then((m) => ({ default: m.LegalModal }))
);

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  const navigate = useNavigate();
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  return (
    <footer className="py-10 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Minimal Bar: Brand & Quick Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand + Version + License */}
          <div className="flex items-center gap-3 select-none">
            <img
              src="/logo.png"
              alt="MD Writer"
              className="w-6 h-6 rounded-md object-contain"
            />
            <span className="font-semibold text-sm tracking-tight text-neutral-950 dark:text-white">
              MD Writer
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
              v2.3.0
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
              MIT
            </span>
          </div>

          {/* Clean Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <button
              onClick={() => navigate('/editor')}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Studio
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Documents
            </button>
            <a
              href="/#pricing"
              className="hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="/#benchmarks"
              className="hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              Benchmarks
            </a>
            <button
              type="button"
              onClick={() => usePreferencesStore.getState().openPreferences()}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Preferences
            </button>
            <Link
              to="/changelog"
              className="hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              Changelog
            </Link>
            <Link
              to="/feedback"
              className="hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              Feedback
            </Link>
            <button
              type="button"
              onClick={() => setIsLegalOpen(true)}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Privacy &amp; Terms
            </button>
          </nav>
        </div>

        {/* Bottom Status & Copyright */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} MD Writer.</span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <a
              href="https://writermd.vercel.app"
              className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              writermd.vercel.app
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>All Systems Operational</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
              <a
                href="https://x.com/rahultungariya_"
                target="_blank"
                rel="noreferrer"
                title="Follow on X"
                aria-label="X (formerly Twitter)"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {isLegalOpen && (
        <Suspense fallback={null}>
          <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
        </Suspense>
      )}
    </footer>
  );
};
