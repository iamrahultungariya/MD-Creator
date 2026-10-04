import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { signIn, signUp, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    // Enforce minimum password length with a clear message
    if (mode === 'signup' && password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (mode === 'signin') {
      const res = await signIn(email, password);
      if (res.success) {
        navigate('/documents');
      } else {
        setFormError(res.error || 'Failed to sign in.');
      }
    } else {
      const res = await signUp(email, password, name);
      if (res.success) {
        navigate('/documents');
      } else {
        setFormError(res.error || 'Failed to sign up.');
      }
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 transition-colors">
      
      {/* Back to Home button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-8 sm:p-10 shadow-xl animate-in fade-in zoom-in-95 duration-200 font-sans">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img 
            src="/logo.png" 
            alt="MD Writer Logo" 
            className="w-12 h-12 rounded-xl object-contain mb-3 shadow-md" 
          />
          <h2 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white font-sans">
            {mode === 'signin' ? 'Welcome back to MD Writer' : 'Create your MD Writer account'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
            {mode === 'signin' 
              ? 'Sign in to access your synchronized documents and settings' 
              : 'Start writing with distraction-free markdown and cloud sync'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex p-1 bg-neutral-100/80 dark:bg-neutral-800/80 rounded-lg mb-6 text-xs font-semibold font-sans border border-neutral-200/60 dark:border-neutral-700/60">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setFormError(null);
            }}
            className={`flex-1 py-2 rounded-md transition-all cursor-pointer font-sans font-semibold ${
              mode === 'signin'
                ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setFormError(null);
            }}
            className={`flex-1 py-2 rounded-md transition-all cursor-pointer font-sans font-semibold ${
              mode === 'signup'
                ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 font-sans">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 text-xs font-sans text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 font-sans">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 text-xs font-sans text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 font-sans">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 text-xs font-sans text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-sans font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
