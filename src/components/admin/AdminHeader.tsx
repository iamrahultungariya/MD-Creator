import React, { useRef } from 'react';
import { 
  RefreshCw, 
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminTab, AdminStats } from '../../types/admin';
import { useAuthStore } from '../../stores/useAuthStore';

interface AdminHeaderProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  stats: AdminStats;
  isRefreshing: boolean;
  onRefresh: () => void;
  isDevBypass: boolean;
  onDisableDevBypass?: () => void;
  lastRefreshedAt?: Date | null;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  isRefreshing,
  onRefresh,
  isDevBypass,
  onDisableDevBypass,
  lastRefreshedAt,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs: { id: AdminTab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics & Telemetry' },
    { id: 'blogs', label: 'Blog Moderation', badge: stats.pendingBlogs },
    { id: 'reviews', label: 'Reviews Desk', badge: stats.pendingReviews },
    { id: 'feedback', label: 'Feedback & Bugs', badge: stats.newFeedback },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      setActiveTab(tabs[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <header className="bg-neutral-950 border-b border-neutral-800/80 text-neutral-100 sticky top-0 z-40 font-sans">
      {/* Top Bar (Mimo Drawer Header Standard) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800/60">
        
        {/* Brand & Context */}
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-sm text-neutral-100 tracking-tight">MD Writer</span>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
            Admin
          </span>
          {isDevBypass && (
            <button
              onClick={onDisableDevBypass}
              title="Click to disable dev bypass"
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/80 cursor-pointer hover:bg-purple-900/60 transition-colors"
            >
              Dev Active ✕
            </button>
          )}
          <span className="text-neutral-600 text-xs hidden sm:inline">•</span>
          <span className="text-xs text-neutral-400 hidden sm:inline tracking-tight">
            Moderation desk and anonymous user telemetry
          </span>
        </div>

        {/* Right Tools & User Info */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs font-sans">
          {lastRefreshedAt && (
            <span className="text-[11px] text-neutral-500 font-mono hidden lg:inline">
              Synced {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/70 border border-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neutral-200' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/70 border border-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-800">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Admin'}
              alt={user?.displayName || 'Admin'}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-neutral-800"
            />
            <span className="text-xs font-medium text-neutral-300 max-w-[110px] truncate">
              {user?.displayName || 'Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Row (Mimo Segmented Minimalist Nav) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex space-x-1 overflow-x-auto py-2 scrollbar-none"
          role="tablist"
          aria-label="Admin Navigation Tabs"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                id={`admin-tab-${tab.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-neutral-800/90 text-white border-neutral-700/80 shadow-2xs font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-neutral-900 text-neutral-300 border border-neutral-700/80">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
