import React from 'react';
import { ShieldAlert, LogIn, ArrowLeft, Terminal, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

interface AdminAccessDeniedProps {
  onEnableDevBypass?: () => void;
  isChecking?: boolean;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ 
  onEnableDevBypass,
  isChecking = false 
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isLocalDev = import.meta.env.DEV && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm font-medium">Verifying Administrative Privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 text-neutral-100 font-sans">
      <div className="max-w-md w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 mb-4 mx-auto">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>

        <h1 className="text-base font-bold text-center text-white mb-1.5 tracking-tight">
          Administrator Access Required
        </h1>
        <p className="text-xs text-neutral-400 text-center mb-5 leading-relaxed">
          This portal is reserved for MD Writer editors and administrators. You need verified role privileges to moderate blogs, reviews, and community feedback.
        </p>

        {user ? (
          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5 mb-5 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-sans">Signed In As:</span>
              <span className="text-white font-medium">{user.email || user.displayName}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-sans">Role Assigned:</span>
              <span className="text-amber-400 font-semibold uppercase">Contributor</span>
            </div>
            {isLocalDev && (
              <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-start gap-1.5 font-sans">
                <Terminal className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-400" />
                <span>
                  Local Development: Admin privileges can be granted via Supabase Dashboard roles or by setting <code className="text-neutral-300 font-mono text-[10px]">VITE_OWNER_EMAIL</code> in <code className="text-neutral-300 font-mono text-[10px]">.env</code>.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5 mb-5 text-xs text-center text-neutral-400">
            You are currently not signed in. Please sign in with an administrator account to continue.
          </div>
        )}

        <div className="space-y-2">
          {!user ? (
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-2 px-4 rounded-lg bg-neutral-100 hover:bg-white text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Admin Account</span>
            </button>
          ) : null}

          {/* Dev Bypass Button strictly for local dev testing */}
          {isLocalDev && onEnableDevBypass && (
            <button
              onClick={onEnableDevBypass}
              className="w-full py-2 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Enable Dev-Mode Test Session</span>
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 rounded-lg bg-transparent hover:bg-neutral-800/50 text-neutral-400 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
