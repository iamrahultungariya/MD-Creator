import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ProfileDropdown } from '../auth/ProfileDropdown';
import { PwaInstallButton } from '../common/PwaInstallButton';
import { isCurrentUserAdmin } from '../../utils/adminAuth';

interface NavbarProps {
  onOpenTemplates?: () => void;
  onOpenFeatures?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTemplates, onOpenFeatures: _onOpenFeatures }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      isCurrentUserAdmin(user.id).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleBrandClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true, bubbles: true })
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left: Brand + Monospace Version */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2 text-left cursor-pointer group select-none"
            aria-label="MD Writer Home"
          >
            <img
              src="/logo.png"
              alt="MD Writer"
              className="w-6 h-6 rounded object-contain"
            />
            <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              MD Writer
            </span>
          </button>
          <button
            onClick={() => navigate('/changelog')}
            className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
            title="Release v2.3 Changelog"
          >
            v2.3
          </button>
        </div>

        {/* Center: Plain text navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => handleNavClick('features')}
            className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick('architecture')}
            className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Architecture
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => navigate('/documents')}
            className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Documents
          </button>
        </nav>

        {/* Right: Search indicator, Theme toggle, Open Studio */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick search indicator */}
          <button
            onClick={triggerCommandPalette}
            aria-label="Open command palette"
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-sans text-xs">Search</span>
            <span className="text-[10px] px-1 py-0.2 bg-neutral-200 dark:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400">
              ⌘K
            </span>
          </button>

          <div className="hidden lg:block">
            <PwaInstallButton variant="compact" />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
            >
              Admin
            </button>
          )}

          {user ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/auth')}
                className="hidden sm:inline-block text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/editor')}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3.5 py-1.5 rounded active:translate-y-[1px] transition-colors cursor-pointer"
              >
                Open Studio
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden w-8 h-8 rounded border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <button
              onClick={() => handleNavClick('features')}
              className="text-left py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('architecture')}
              className="text-left py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Architecture
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className="text-left py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/documents');
              }}
              className="text-left py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Documents
            </button>
            {onOpenTemplates && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenTemplates();
                }}
                className="text-left py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                Templates
              </button>
            )}
          </div>
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                triggerCommandPalette();
              }}
              className="text-xs font-mono text-neutral-500 flex items-center gap-1.5 py-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search (⌘K)</span>
            </button>
            {!user && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/editor');
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3 py-1.5 rounded active:translate-y-[1px]"
              >
                Open Studio
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
