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
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 text-neutral-100">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing backdrop accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6 mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-center text-white mb-2">
          Administrator Access Required
        </h1>
        <p className="text-sm text-neutral-400 text-center mb-6">
          This portal is reserved for MD Writer editors and administrators. You need verified role privileges to moderate blogs, reviews, and community feedback.
        </p>

        {user ? (
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 mb-6 text-xs space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Signed In As:</span>
              <span className="text-white font-medium">{user.email || user.displayName}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Role Assigned:</span>
              <span className="text-amber-400 font-semibold uppercase font-mono">Contributor / User</span>
            </div>
            <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-start gap-1.5">
              <Terminal className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-400" />
              <span>
                To grant admin privileges in Supabase, run: <br />
                <code className="text-amber-300/90 font-mono text-[10px]">
                  INSERT INTO public.user_roles (user_id, role) VALUES ('{user.id}', 'admin');
                </code>
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 mb-6 text-xs text-center text-neutral-400">
            You are currently not signed in. Please sign in with an administrator account to continue.
          </div>
        )}

        <div className="space-y-2.5">
          {!user ? (
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Admin Account</span>
            </button>
          ) : null}

          {/* Dev Bypass Button for local testing */}
          {isLocalDev && onEnableDevBypass && (
            <button
              onClick={onEnableDevBypass}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Enable Dev-Mode Test Session</span>
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-neutral-800/50 text-neutral-400 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
