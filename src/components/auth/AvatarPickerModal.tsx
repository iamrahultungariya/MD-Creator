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
    // Detect if current avatarUrl matches any preset
    const current = user?.avatarUrl || '';
    const found = AVATAR_PRESETS.find((p) => current.includes(encodeURIComponent(p.svg.trim())));
    return found ? found.id : 'scribe';
  });

  if (!isOpen) return null;

  const handleApply = async () => {
    const avatarDataUrl = getPresetAvatarUrl(selectedId);
    
    // 1. Save to local storage for immediate persistence
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

    // 3. Try to sync to Supabase user metadata if available
    try {
      const { supabase } = await import('../../lib/supabase');
      if (supabase && user?.id) {
        await supabase.auth.updateUser({
          data: { avatar_url: avatarDataUrl }
        });
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 sm:pt-20 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg my-auto rounded-xl bg-white border border-neutral-200/90 shadow-2xl shadow-neutral-900/15 overflow-hidden flex flex-col text-neutral-900 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8257F5]/10 text-[#8257F5] flex items-center justify-center border border-[#8257F5]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950">
                Choose Character Avatar
              </h3>
              <p className="text-[11px] text-neutral-500">
                Distinctive MD Writer personas for your workspace profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 8-Avatar Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[min(50vh,380px)] overflow-y-auto">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = selectedId === preset.id;
            const avatarUrl = getPresetAvatarUrl(preset.id);

            return (
              <button
                key={preset.id}
                onClick={() => setSelectedId(preset.id)}
                className={`group p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-2 relative ${
                  isSelected
                    ? 'border-[#8257F5] bg-[#8257F5]/5 shadow-xs ring-1 ring-[#8257F5]'
                    : 'border-neutral-200/80 bg-neutral-50/60 hover:border-neutral-300 hover:bg-neutral-100/70 text-neutral-900'
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
                    isSelected ? 'ring-2 ring-[#8257F5] ring-offset-2 ring-offset-white' : ''
                  }`}
                />

                <div className="min-w-0">
                  <div className="text-xs font-bold text-neutral-900 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {preset.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/60 shrink-0">
          <span className="text-[11px] text-neutral-400 font-mono">
            100% Vector • Offline Stored
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
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
