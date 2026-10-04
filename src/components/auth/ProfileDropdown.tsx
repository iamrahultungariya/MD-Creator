import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  FolderOpen,
  SlidersHorizontal
} from 'lucide-react';
import { useAuthStore, isUserPro } from '../../stores/useAuthStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useConfirm } from '../../stores/useConfirmStore';
import { isCurrentUserAdmin } from '../../utils/adminAuth';
import { AvatarPickerModal } from './AvatarPickerModal';
import { usePreferencesStore } from '../../stores/usePreferencesStore';
import { CreateDocumentModal } from '../document/CreateDocumentModal';
import { StorageLimitRing } from '../common/StorageLimitRing';

export const ProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const hasSupabase = isSupabaseConfigured();

  useEffect(() => {
    if (user?.id) {
      isCurrentUserAdmin(user.id).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user?.id]);

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

  const handleCreateNew = () => {
    setIsOpen(false);
    setIsCreateModalOpen(true);
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
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Profile Popup Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl shadow-neutral-950/10 dark:shadow-black/50 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* User Info Header */}
          <div className="p-3 bg-neutral-50/80 dark:bg-neutral-950/50 rounded-lg mb-1.5 border border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="relative group cursor-pointer shrink-0" 
                onClick={() => {
                  setIsOpen(false);
                  setIsAvatarModalOpen(true);
                }}
                title="Change Character Avatar"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700 group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[9px] font-bold">
                  Edit
                </div>
              </div>

              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-950 dark:text-white truncate">
                    {user.displayName}
                  </span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsAvatarModalOpen(true);
                    }}
                    className="text-[10px] font-semibold text-[#8257F5] dark:text-[#a07cf8] hover:underline cursor-pointer"
                  >
                    Change Face
                  </button>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Plan / Status Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs">
              <span className="font-medium text-neutral-500 dark:text-neutral-400">
                {isUserPro(user) ? 'Pro Member' : 'Free Account'}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {hasSupabase ? 'Cloud Synced' : 'Offline Cache'}
              </span>
            </div>
          </div>

          {/* Navigation Links - Unified Monochrome Aesthetic */}
          <div className="space-y-0.5 text-xs text-neutral-700 dark:text-neutral-300">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/documents');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/70 flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <FolderOpen className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
              <span>My Documents</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/70 flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <Plus className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
              <span>New Document</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                usePreferencesStore.getState().openPreferences();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/70 flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <SlidersHorizontal className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
              <span>Preferences (Ctrl+,)</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/70 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">Admin Desk</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Panel
                </span>
              </button>
            )}
          </div>

          {/* Storage Telemetry Summary - 300 MB Soft Quota Ring */}
          <div className="my-1.5">
            <StorageLimitRing variant="card" />
          </div>

          {/* Sign Out Button */}
          <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors cursor-pointer text-xs font-semibold group"
            >
              <LogOut className="w-4 h-4 text-neutral-400 group-hover:text-rose-500 transition-colors" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}

      {/* Bespoke Character Avatar Selection Modal */}
      <AvatarPickerModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
      />

      {/* New Document & Note Creation Flow Modal */}
      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
