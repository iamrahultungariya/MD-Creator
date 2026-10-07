import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  ArrowRight, 
  Cloud, 
  ShieldCheck, 
  Wifi, 
  Globe2, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Loader2 
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { telemetryService } from '../services/telemetryService';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { signIn, signUp, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signin') {
      const res = await signIn(cleanEmail, password);
      if (res.success) {
        telemetryService.bindSurveyToEmail(cleanEmail);
        navigate('/documents');
      } else {
        setFormError(res.error || 'Failed to sign in.');
      }
    } else {
      const res = await signUp(cleanEmail, password, name.trim());
      if (res.success) {
        telemetryService.bindSurveyToEmail(cleanEmail);
        navigate('/documents');
      } else {
        setFormError(res.error || 'Failed to create account.');
      }
    }
  };

  const benefits = [
    { icon: Cloud, title: 'Instant Cloud Sync', desc: 'Syncs notes between your laptop, tablet, and phone automatically.' },
    { icon: ShieldCheck, title: 'Immunity to Cache Wipes', desc: 'Your notes are protected if browser cookies or history are cleared.' },
    { icon: Wifi, title: '100% Offline Capable', desc: 'All notes still load and save offline, syncing seamlessly when online.' },
    { icon: Globe2, title: 'Claim Public Links', desc: 'Publish, edit, and manage read-only web documents with your account.' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 transition-colors font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Two-Column Auth Container */}
      <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* ── LEFT COLUMN: Brand & Benefits Showcase ──────────────────────── */}
        <div className="hidden md:flex md:col-span-2 p-8 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white flex-col justify-between border-r border-neutral-800/80 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="MD Writer" 
                className="w-11 h-11 rounded-xl object-contain shadow-md ring-1 ring-white/10" 
              />
              <div>
                <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>MD Writer</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">Distraction-free workspace</p>
              </div>
            </div>

            <div className="space-y-4 pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Why create an account?
              </div>

              {benefits.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 text-brand-400 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-700/60">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-100">{b.title}</div>
                      <div className="text-[11px] text-neutral-400 leading-snug mt-0.5">{b.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800/80 relative z-10 flex items-center gap-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero lock-in. Full ownership of your markdown.</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Form ─────────────────────────────────────────── */}
        <div className="md:col-span-3 p-8 sm:p-9 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Header Titles */}
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{mode === 'signup' ? 'Get Started' : 'Welcome Back'}</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
                {mode === 'signup' ? 'Create your account' : 'Sign in to MD Writer'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {mode === 'signup'
                  ? 'Enable cloud backup to preserve and sync your writing anywhere.'
                  : 'Sign in to access your synchronized documents and settings.'}
              </p>
            </div>

            {/* Segmented Mode Toggle Tabs */}
            <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setFormError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-bold'
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
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Error Alert */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {mode === 'signup' && (
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Full Name (optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>{mode === 'signup' ? 'Create Account & Enable Sync' : 'Sign In'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <button
              onClick={() => navigate('/editor')}
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              Continue without an account? <span className="underline font-bold">Open Offline Editor &rarr;</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
