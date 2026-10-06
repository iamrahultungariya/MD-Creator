import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { AVATAR_PRESETS, getPresetAvatarUrl } from './avatarPresets';
import { useAuthStore } from '../../stores/useAuthStore';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshProfile } = useAuthStore();
  const [selectedId, setSelectedId] = useState<string>(() => {
    const savedPreset = typeof window !== 'undefined' ? localStorage.getItem('md_writer_avatar_preset') : null;
    if (savedPreset && AVATAR_PRESETS.some((p) => p.id === savedPreset)) {
      return savedPreset;
    }
    const current = user?.avatarUrl || '';
    const found = AVATAR_PRESETS.find((p) => current.includes(p.id) || current.includes(encodeURIComponent(p.svg.trim())));
    return found ? found.id : 'scribe';
  });

  if (!isOpen) return null;

  const handleApply = async () => {
    const avatarDataUrl = getPresetAvatarUrl(selectedId);
    
    // 1. Save both preset ID and data URL to localStorage for instant reliable restore
    localStorage.setItem('md_writer_avatar_preset', selectedId);
    localStorage.setItem('md_writer_custom_avatar', avatarDataUrl);

    // 2. Update auth store state directly
    if (user) {
      useAuthStore.setState({
        user: {
          ...user,
          avatarUrl: avatarDataUrl
        }
      });
    }

    // 3. Sync to Supabase user metadata AND profiles table if available
    try {
      const { supabase } = await import('../../lib/supabase');
      if (supabase && user?.id) {
        await supabase.auth.updateUser({
          data: { avatar_url: avatarDataUrl, avatar_preset: selectedId }
        });
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarDataUrl })
          .eq('id', user.id);
      }
    } catch {
      // Offline fallback: already saved locally
    }

    if (refreshProfile) {
      refreshProfile().catch(() => {});
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-neutral-900 dark:text-neutral-100 font-sans animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8257F5]/10 text-[#8257F5] dark:text-[#a07cf8] flex items-center justify-center border border-[#8257F5]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                Choose Character Avatar
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Distinctive MD Writer personas for your workspace profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 8-Avatar Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = selectedId === preset.id;
            const avatarUrl = getPresetAvatarUrl(preset.id);

            return (
              <button
                key={preset.id}
                onClick={() => setSelectedId(preset.id)}
                className={`group p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-2 relative ${
                  isSelected
                    ? 'border-[#8257F5] bg-[#8257F5]/5 dark:bg-[#8257F5]/10 shadow-xs ring-1 ring-[#8257F5]'
                    : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {/* Active check pill */}
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#8257F5] text-white flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                <img
                  src={avatarUrl}
                  alt={preset.name}
                  className={`w-13 h-13 rounded-full object-cover transition-transform group-hover:scale-105 ${
                    isSelected ? 'ring-2 ring-[#8257F5] ring-offset-2 ring-offset-white dark:ring-offset-neutral-900' : ''
                  }`}
                />

                <div className="min-w-0">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                    {preset.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
            100% Vector • Offline Stored
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-[#8257F5] hover:bg-[#7245e6] text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Apply Character
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
