import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  FolderOpen, 
  ChevronDown, 
  Sparkles, 
  CreditCard, 
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

interface NavbarProps {
  onOpenTemplates?: () => void;
  onOpenFeatures?: () => void;
  onOpenUpdates?: () => void;
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
    onOpenUpdates?: () => void;
    handleNavClick: (id: string) => void;
  }) => void;
  path?: string;
}

const RESOURCE_ITEMS: ResourceItem[] = [
  {
    id: 'updates',
    title: 'Changelog & Updates',
    desc: 'Milestones & architectural evolution',
    badge: APP_VERSION_LABEL,
    icon: Sparkles,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/40 dark:border-indigo-900/40',
    path: '/updates',
    action: ({ navigate }) => navigate('/updates')
  },
  {
    id: 'pricing',
    title: 'Pricing',
    desc: '100% Free & Open-source plans',
    icon: CreditCard,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/40 dark:border-emerald-900/40',
    path: '/pricing',
    action: ({ navigate }) => navigate('/pricing')
  },
  {
    id: 'blog',
    title: 'Community Blog',
    desc: 'You Write, We Publish.',
    icon: BookOpen,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/40 dark:border-amber-900/40',
    path: '/blog',
    action: ({ navigate }) => navigate('/blog')
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
    id: 'settings',
    title: 'Settings & Toolbar',
    desc: 'Customize floating markdown dock & tools',
    icon: Sliders,
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/40 dark:border-sky-900/40',
    path: '/settings',
    action: ({ navigate }) => navigate('/settings')
  }
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenTemplates, onOpenFeatures: _onOpenFeatures, onOpenUpdates }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
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
      onOpenUpdates,
      handleNavClick
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0e0e11] border-b border-neutral-200 dark:border-neutral-800 shadow-2xs dark:shadow-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={handleBrandClick} 
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <img 
            src="/logo.webp" 
            alt="MD Writer Logo" 
            className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform" 
          />
          <span className="font-bold text-base sm:text-lg text-neutral-950 dark:text-white tracking-tight">
            MD Writer
          </span>
        </div>

        {/* Center Desktop Navigation (Clean, spacious, decluttered) */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <button 
            onClick={handleBrandClick}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              location.pathname === '/' 
                ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800' 
                : 'hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            Home
          </button>

          <button 
            onClick={() => navigate('/documents')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              location.pathname === '/documents' 
                ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800' 
                : 'hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span>Documents</span>
          </button>

          <button 
            onClick={() => navigate('/features')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              location.pathname === '/features' 
                ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800' 
                : 'hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            Features
          </button>

          <button 
            onClick={() => navigate('/about')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              location.pathname === '/about' 
                ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800' 
                : 'hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            About
          </button>

          {/* Explore Dropdown */}
          <div ref={resourcesRef} className="relative">
            <button
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              aria-expanded={isResourcesOpen}
              aria-haspopup="true"
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                isResourceActive || isResourcesOpen
                  ? 'text-neutral-950 dark:text-white font-semibold bg-neutral-100 dark:bg-neutral-800'
                  : 'hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              <span>Explore</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-neutral-400 ${isResourcesOpen ? 'rotate-180 text-neutral-900 dark:text-white' : ''}`} />
            </button>

            {isResourcesOpen && (
              <div className="absolute left-0 mt-2 w-72 p-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl shadow-neutral-950/10 dark:shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="space-y-0.5">
                  {RESOURCE_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path === location.pathname;
                    return (
                      <button
                        key={item.id}
                        onClick={() => triggerResource(item)}
                        className={`w-full text-left p-2.5 rounded-xl hover:bg-neutral-100/80 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer flex items-center gap-3 group ${
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
                              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
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
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer shadow-xs"
              title="Open Admin Moderation Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Desk</span>
            </button>
          )}

          {/* Profile Dropdown OR Sign In / Get Started */}
          {user ? (
            <ProfileDropdown />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate('/auth')}
                className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-2 py-1.5 transition-colors cursor-pointer hidden lg:block"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate('/auth')}
                className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-tight shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            id="navbar-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleBrandClick();
              }}
              className={`p-2.5 rounded-xl text-left font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                location.pathname === '/' 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' 
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
              className={`p-2.5 rounded-xl text-left font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                location.pathname === '/documents' 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' 
                  : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Documents</span>
            </button>
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/features');
            }}
            className={`w-full p-2.5 rounded-xl text-left font-semibold text-xs cursor-pointer ${
              location.pathname === '/features'
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold'
                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
            }`}
          >
            Features
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/about');
            }}
            className={`w-full p-2.5 rounded-xl text-left font-semibold text-xs cursor-pointer ${
              location.pathname === '/about'
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold'
                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
            }`}
          >
            About
          </button>

          {/* Secondary Links Section */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-1 py-1">
              Explore & Updates
            </div>

            {RESOURCE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={`mobile-${item.id}`}
                  onClick={() => triggerResource(item)}
                  className="w-full text-left p-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
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
                className="w-full text-left p-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-2.5 cursor-pointer mt-1"
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
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/auth');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center gap-1 cursor-pointer"
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
