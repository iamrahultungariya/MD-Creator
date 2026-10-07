import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  UserCheck,
  Wifi,
  Globe2
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { telemetryService } from '../../services/telemetryService';
import { APP_VERSION_LABEL } from '../../config/version';

interface QuickAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickAuthModal: React.FC<QuickAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { signIn, signUp, isLoading } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      const res = await signUp(cleanEmail, password, name.trim());
      if (res.success) {
        telemetryService.bindSurveyToEmail(cleanEmail);
        setSuccessMsg('Account created. Backing up your documents to cloud sync...');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setFormError(res.error || 'Failed to create account.');
      }
    } else {
      const res = await signIn(cleanEmail, password);
      if (res.success) {
        telemetryService.bindSurveyToEmail(cleanEmail);
        setSuccessMsg('Signed in. Syncing your documents...');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setFormError(res.error || 'Failed to sign in.');
      }
    }
  };

  const benefits = [
    { icon: Cloud, title: 'Continuous Cloud Backup', desc: 'Syncs documents safely between your laptop and mobile devices.' },
    { icon: ShieldCheck, title: 'Immunity to Cache Wipes', desc: 'Protects against loss when browser cache or storage is cleared.' },
    { icon: Wifi, title: '100% Offline Capable', desc: 'Full offline writing preserved; changes sync automatically when online.' },
    { icon: Globe2, title: 'Public Document Links', desc: 'Publish clean, read-only web documents with your verified account.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md select-none font-sans animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#121118] border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-[0_24px_70px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh] text-neutral-900 dark:text-neutral-100 font-sans"
        role="dialog"
        aria-modal="true"
        aria-label="Account & Cloud Sync"
      >
        {/* Subtle Violet Sheen */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-500/80 to-transparent shrink-0" />

        {/* Window Titlebar Header (Follows App Design Language) */}
        <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-[#181620] shrink-0">
          <div className="flex items-center gap-2.5">
            {/* macOS Window Controls */}
            <div className="flex items-center gap-1.5 mr-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-2xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-2xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-2xs" />
            </div>

            {/* Official App Logo & Title */}
            <div className="flex items-center gap-2 pl-1 border-l border-neutral-200/60 dark:border-neutral-800">
              <img 
                src="/logo.png" 
                alt="MD Writer" 
                className="w-5 h-5 rounded-md object-contain shadow-2xs" 
              />
              <span className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white tracking-tight">
                MD Writer Cloud
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {APP_VERSION_LABEL}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 overflow-hidden">
          
          {/* ── LEFT COLUMN: Brand & Benefits Showcase (Theme Follows) ─────────────── */}
          <div className="hidden md:flex md:col-span-2 p-6 bg-neutral-50/90 dark:bg-[#15131c] text-neutral-900 dark:text-white flex-col justify-between border-r border-neutral-200/80 dark:border-neutral-800/80 relative overflow-hidden">
            <div className="space-y-5 relative z-10">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Cloud Workspace
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">
                  Why enable cloud backup?
                </h4>
              </div>

              <div className="space-y-3.5">
                {benefits.map((b, idx) => {
                  const Icon = b.icon;
                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5 border border-brand-500/20">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{b.title}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5">{b.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Trust Badge */}
            <div className="pt-4 border-t border-neutral-200/70 dark:border-neutral-800/80 relative z-10 flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Full ownership. Export to Markdown anytime.</span>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Interactive Form ──────────────────────────────── */}
          <div className="md:col-span-3 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto bg-white dark:bg-[#121118]">
            <div className="space-y-4">
              
              {/* Header Titles */}
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 mb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white">
                  {mode === 'signup' ? 'Enable Cloud Sync' : 'Sign in to Account'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {mode === 'signup'
                    ? 'All local documents in this browser will be safely backed up.'
                    : 'Access your synchronized documents and preferences anywhere.'}
                </p>
              </div>

              {/* Segmented Mode Switcher */}
              <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setFormError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setFormError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Alerts */}
              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                
                {mode === 'signup' && (
                  <div>
                    <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Your Name (optional)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 text-neutral-950 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 text-neutral-950 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 text-neutral-950 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || Boolean(successMsg)}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Syncing Account...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>{mode === 'signup' ? 'Create Account & Enable Sync' : 'Sign In & Sync'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Offline Escape */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-center mt-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
              >
                Prefer local writing? <span className="underline font-semibold">Continue as Guest / Offline &rarr;</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
