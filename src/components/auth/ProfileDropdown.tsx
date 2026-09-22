import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  LogOut, 
  Database, 
  Cloud, 
  ChevronDown, 
  ShieldCheck,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import { useAuthStore, isUserPro, isLifetimeProEmail } from '../../stores/useAuthStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { createNewDocument } from '../../db';
import { useConfirm } from '../../stores/useConfirmStore';

export const ProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const hasSupabase = isSupabaseConfigured();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleCreateNew = async () => {
    setIsOpen(false);
    const id = await createNewDocument('Untitled Document.md');
    navigate(`/editor/${id}`);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    const ok = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your MD Writer account?',
      description: 'Your offline documents and cached drafts are safely preserved locally on your device in Dexie IndexedDB.',
      confirmText: 'Sign Out',
      cancelText: 'Stay Signed In',
      variant: 'danger',
      icon: 'logout'
    });
    if (ok) {
      await signOut();
      navigate('/');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button in Navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700 select-none group"
      >
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-600"
        />
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 max-w-[100px] truncate hidden sm:inline">
          {user.displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors" />
      </button>

      {/* Floating Profile Popup Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* User Info Header */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950/60 rounded-xl mb-1.5 border border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
              />
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                  {user.displayName}
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Plan / Status Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px]">
              {isUserPro(user) ? (
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {isLifetimeProEmail(user.email) ? 'Pro Lifetime' : 'Pro (Free 2026 Pass)'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.isDemoUser ? 'Demo Account' : 'Free Writer'}
                </span>
              )}
              <span className="text-[10px] text-neutral-400">
                {hasSupabase ? 'Cloud Synced' : 'Offline Cache'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 text-xs text-neutral-700 dark:text-neutral-300">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/documents');
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-neutral-500" />
              <span>My Documents</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-500" />
              <span>New Document</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/editor');
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Open Editor</span>
            </button>
          </div>

          {/* Storage Telemetry Summary */}
          <div className="my-1.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-500" /> Dexie Cache
              </span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Instant</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Cloud className="w-3 h-3 text-sky-500" /> Supabase Cloud
              </span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {hasSupabase ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
