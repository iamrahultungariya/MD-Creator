import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  MessageSquare, 
  Bug, 
  BarChart3, 
  RefreshCw, 
  ExternalLink
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
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  isRefreshing,
  onRefresh,
  isDevBypass,
  onDisableDevBypass,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
    },
    {
      id: 'blogs',
      label: 'Blog Moderation',
      icon: BookOpen,
      badge: stats.pendingBlogs,
      badgeColor: 'bg-amber-500 text-black',
    },
    {
      id: 'reviews',
      label: 'Reviews Desk',
      icon: MessageSquare,
      badge: stats.pendingReviews,
      badgeColor: 'bg-amber-500 text-black',
    },
    {
      id: 'feedback',
      label: 'Feedback & Bugs',
      icon: Bug,
      badge: stats.newFeedback,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  return (
    <header className="bg-neutral-900 border-b border-neutral-800 text-neutral-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">MD Writer</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 font-mono font-bold border border-neutral-700">
                Admin Panel
              </span>
              {isDevBypass && (
                <button
                  onClick={onDisableDevBypass}
                  title="Click to disable dev bypass"
                  className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold cursor-pointer hover:bg-purple-500/30"
                >
                  Dev Mode Active ✕
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              Community Moderation Desk: Blogs, Reviews &amp; Feedback Tracker
            </p>
          </div>
        </div>

        {/* Right Tools & User Info */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* View Website Button */}
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {/* User pill */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-800">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Admin'}
              alt={user?.displayName || 'Admin'}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-700"
            />
            <div className="text-left text-xs leading-tight">
              <div className="font-semibold text-white max-w-[120px] truncate">
                {user?.displayName || 'Admin User'}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">Administrator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Admin Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor || 'bg-amber-500 text-black'}`}>
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
