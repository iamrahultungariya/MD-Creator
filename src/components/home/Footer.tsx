import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { openBuyCoffeeModal } from '../../utils/coffeeModalEvents';
import { BmcCoffeeCupIcon } from '../common/BuyMeCoffeeButton';
import { LegalModal } from '../common/LegalModal';

interface FooterProps {
  onOpenUpdates?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenUpdates }) => {
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  return (
    <footer className="py-12 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-black text-sm">
              M
            </div>
            <div>
              <span className="font-bold text-sm text-neutral-900 dark:text-white">
                MD Writer
              </span>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Write better. Think clearer.
              </p>
            </div>
          </div>

          {/* Links & Socials */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            
            {/* Nav Links */}
            <div className="flex items-center gap-5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <Link to="/pricing" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/blog" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Blog
              </Link>
              <Link to="/feedback" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Feedback
              </Link>
              {onOpenUpdates ? (
                <button 
                  type="button" 
                  onClick={onOpenUpdates} 
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Changelog</span>
                  <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">v0.9.0 Beta</span>
                </button>
              ) : (
                <Link 
                  to="/updates" 
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Changelog</span>
                  <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">v0.9.0 Beta</span>
                </Link>
              )}
              <button
                type="button"
                onClick={openBuyCoffeeModal}
                className="hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400"
              >
                <BmcCoffeeCupIcon className="w-3.5 h-3.5" />
                <span>Buy me a coffee</span>
              </button>
              <Link to="/about" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                About
              </Link>
              <button 
                type="button"
                onClick={() => setIsLegalOpen(true)} 
                className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Privacy &amp; Terms
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.66 1.66 0 0 0-1.66-1.66z" />
                </svg>
              </a>
            </div>

          </div>

        </div>

      </div>

      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </footer>
  );
};
