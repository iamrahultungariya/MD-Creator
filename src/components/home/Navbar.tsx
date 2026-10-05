import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  FolderOpen, 
  ChevronDown, 
  BookOpen, 
  MessageSquare, 
  Sliders, 
  Menu, 
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ProfileDropdown } from '../auth/ProfileDropdown';
import { PwaInstallButton } from '../common/PwaInstallButton';
import { isCurrentUserAdmin } from '../../utils/adminAuth';
import { APP_VERSION_LABEL } from '../../config/version';

import { usePreferencesStore } from '../../stores/usePreferencesStore';

interface NavbarProps {
  onOpenTemplates?: () => void;
  onOpenFeatures?: () => void;
}

interface ResourceItem {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  action: (handlers: {
    navigate: (path: string) => void;
    onOpenTemplates?: () => void;
    handleNavClick: (id: string) => void;
  }) => void;
  path?: string;
}

const RESOURCE_ITEMS: ResourceItem[] = [
  {
    id: 'templates',
    title: 'Starter Templates',
    desc: 'Curated blueprints, notes & formats',
    icon: BookOpen,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/40 dark:border-amber-900/40',
    action: ({ onOpenTemplates, navigate }) => {
      if (onOpenTemplates) {
        onOpenTemplates();
      } else {
        navigate('/?templates=open');
      }
    }
  },
  {
    id: 'feedback',
    title: 'Feedback & Ideas',
    desc: 'Report bugs or suggest features',
    icon: MessageSquare,
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/40 dark:border-rose-900/40',
    path: '/feedback',
    action: ({ navigate }) => navigate('/feedback')
  },
  {
    id: 'preferences',
    title: 'Preferences (Ctrl+,)',
    desc: 'Editor font, tab size & full backup',
    icon: Sliders,
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/40 dark:border-sky-900/40',
    action: () => usePreferencesStore.getState().openPreferences()
  }
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenTemplates, onOpenFeatures: _onOpenFeatures }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      isCurrentUserAdmin(user.id).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user?.id]);

  // Close menus on route changes
  useEffect(() => {
    setIsResourcesOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside and Esc key listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (resourcesRef.current && !resourcesRef.current.contains(target)) {
        setIsResourcesOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        const toggle = document.getElementById('navbar-mobile-toggle');
        if (!toggle?.contains(target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsResourcesOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleBrandClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    setIsResourcesOpen(false);
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

  const isResourceActive = useMemo(() => {
    return RESOURCE_ITEMS.some((item) => item.path && item.path === location.pathname);
  }, [location.pathname]);

  const triggerResource = (item: ResourceItem) => {
    setIsResourcesOpen(false);
    setIsMobileMenuOpen(false);
    item.action({
      navigate,
      onOpenTemplates,
      handleNavClick
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={handleBrandClick} 
          className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
        >
          <img 
            src="/logo.png" 
            alt="MD Writer Logo" 
            className="w-7 h-7 rounded-lg object-contain shadow-xs group-hover:scale-105 transition-transform" 
          />
          <span className="font-semibold text-sm sm:text-base text-neutral-950 dark:text-white tracking-tight">
            MD Writer
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            {APP_VERSION_LABEL}
          </span>
        </div>

        {/* Center Desktop Navigation (Clean, spacious, decluttered) */}
        <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-neutral-600 dark:text-neutral-300">
          <button 
            onClick={handleBrandClick}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              location.pathname === '/' 
                ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800/80' 
                : 'hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
            }`}
          >
            Home
          </button>

          <button 
            onClick={() => navigate('/documents')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              location.pathname === '/documents' 
                ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800/80' 
                : 'hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span>Documents</span>
          </button>

          {/* Explore Dropdown */}
          <div ref={resourcesRef} className="relative">
            <button
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              aria-expanded={isResourcesOpen}
              aria-haspopup="true"
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                isResourceActive || isResourcesOpen
                  ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800/80'
                  : 'hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
              }`}
            >
              <span>Explore</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-neutral-400 ${isResourcesOpen ? 'rotate-180 text-neutral-900 dark:text-white' : ''}`} />
            </button>

            {isResourcesOpen && (
              <div className="absolute left-0 mt-2 w-72 p-1.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl shadow-neutral-950/10 dark:shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                <div className="space-y-0.5">
                  {RESOURCE_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path === location.pathname;
                    return (
                      <button
                        key={item.id}
                        onClick={() => triggerResource(item)}
                        className={`w-full text-left p-2.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer flex items-center gap-3 group font-sans ${
                          isActive ? 'bg-neutral-100/80 dark:bg-neutral-800/70' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${item.iconBg} ${item.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded font-sans text-[9px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Utilities (Balanced breathing room) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* PWA Install Button (Compact icon on desktop, full drawer entry on mobile) */}
          <div className="hidden md:block">
            <PwaInstallButton variant="compact" />
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs font-sans"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600 transition-transform rotate-0 hover:rotate-12" />
            )}
          </button>

          {/* Admin Desk Quick Link */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer shadow-2xs font-sans"
              title="Open Admin Moderation Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Desk</span>
            </button>
          )}

          {/* Profile Dropdown OR Sign In / Open Editor */}
          {user ? (
            <ProfileDropdown />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate('/auth')}
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white px-3 py-1.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer hidden lg:block font-sans shadow-2xs"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate('/editor')}
                className="bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <span>Open Editor</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            id="navbar-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden w-8 h-8 rounded-lg border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-lg"
        >
          {/* Core Links */}
          <div className="grid grid-cols-2 gap-2 font-sans">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleBrandClick();
              }}
              className={`p-2.5 rounded-lg text-left font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer font-sans ${
                location.pathname === '/' 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs' 
                  : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/documents');
              }}
              className={`p-2.5 rounded-lg text-left font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer font-sans ${
                location.pathname === '/documents' 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs' 
                  : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Documents</span>
            </button>
          </div>

          {/* Secondary Links Section */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1 font-sans">
            <div className="text-[11px] font-semibold text-neutral-400 px-1 py-1 font-sans">
              Explore & Resources
            </div>

            {RESOURCE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={`mobile-${item.id}`}
                  onClick={() => triggerResource(item)}
                  className="w-full text-left p-2 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between cursor-pointer font-sans"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded font-sans text-[9px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/admin');
                }}
                className="w-full text-left p-2.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-2.5 cursor-pointer mt-1 font-sans shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Admin Moderation Panel</span>
              </button>
            )}
          </div>

          {/* PWA Install Button inside Mobile Drawer */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <PwaInstallButton variant="drawer" />
          </div>

          {/* Bottom Actions */}
          {!user && (
            <div className="pt-1 flex items-center gap-2 font-sans">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/auth');
                }}
                className="w-full py-2.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
