import React, { useState, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_VERSION } from '../../config/version';
import { usePreferencesStore } from '../../stores/usePreferencesStore';

const LegalModal = React.lazy(() =>
  import('../common/LegalModal').then((m) => ({ default: m.LegalModal }))
);

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  const navigate = useNavigate();
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  return (
    <footer className="py-12 sm:py-16 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 4-Column Technical Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & License */}
          <div className="space-y-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 select-none">
              <img
                src="/logo.png"
                alt="MD Writer"
                className="w-6 h-6 rounded-md object-contain"
              />
              <span className="font-semibold text-sm tracking-tight text-neutral-950 dark:text-white">
                MD Writer
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
              The plain text studio built for focused writing, KaTeX mathematics, and direct BYOK artificial intelligence.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span className="px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                MIT License
              </span>
              <span>Open Source</span>
            </div>
          </div>

          {/* Column 2: Studio Navigation */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold">
              Product
            </div>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <button
                  onClick={() => navigate('/editor')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Studio Editor
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/documents')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Saved Documents
                </button>
              </li>
              <li>
                <a
                  href="/#pricing"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Pricing Matrix
                </a>
              </li>
              <li>
                <a
                  href="/#benchmarks"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Benchmarks
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Tools */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold">
              Resources
            </div>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link
                  to="/changelog"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Changelog (v{APP_VERSION})
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => usePreferencesStore.getState().openPreferences()}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Studio Preferences
                </button>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Feedback &amp; Ideas
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsLegalOpen(true)}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Privacy &amp; Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: System Metadata */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold">
              System
            </div>
            <div className="space-y-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All Systems Operational</span>
              </div>
              <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Production Release: <strong className="text-neutral-800 dark:text-neutral-200">v2.3.0</strong>
              </div>
              <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                Domain: <span className="underline">writermd.vercel.app</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-3 text-neutral-400 dark:text-neutral-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
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
                title="Follow @rahultungariya_ on X"
                aria-label="X (formerly Twitter)"
                className="hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Hairline & Trademark */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} MD Writer. All rights reserved. Built with craft &amp; zero-slop protocol.
          </div>
          <div>
            IndexedDB • WebWorker • KaTeX • Dexie
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
