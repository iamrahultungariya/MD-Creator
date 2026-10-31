import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Loader2,
  FileText, 
  Copy, 
  Check, 
  Download, 
  Clock, 
  Eye, 
  Calendar, 
  Lock, 
  ShieldAlert, 
  Sparkles,
  PenTool,
  Edit3,
  Layers,
  Send,
  Bold,
  Italic,
  Heading2,
  List,
  CheckSquare,
  Code,
  CheckCircle2,
  FolderOpen,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { 
  getPublicDocumentBySlug, 
  getPublishedBundle, 
  submitPublicDocumentEdit, 
  PublicDocumentView,
  PublishedBundleView 
} from '../services/publishService';
import { MarkdownPreview } from '../components/editor/MarkdownPreview';
import { PageLoader } from '../components/common/PageLoader';
import { DiffViewer } from '../components/common/DiffViewer';

const SocialCardGeneratorModal = React.lazy(() =>
  import('../components/share/SocialCardGeneratorModal').then((m) => ({ default: m.SocialCardGeneratorModal }))
);

export const PublicDocumentPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const location = useLocation();
  const effectiveSlug = location.pathname.includes('/bundle/')
    ? (slug.startsWith('bundle-') ? slug : `bundle-${slug}`)
    : slug;

  const [doc, setDoc] = useState<PublicDocumentView | null>(null);
  const [bundle, setBundle] = useState<PublishedBundleView | null>(null);
  const [activeBundleDocId, setActiveBundleDocId] = useState<string>('');

  const [status, setStatus] = useState<'loading' | 'ok' | 'not_found' | 'password_required' | 'invalid_password' | 'rate_limited'>('loading');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isCopied, setIsCopied] = useState(false);
  const [isSocialCardOpen, setIsSocialCardOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // View-Edit Interactive State
  const [editableContent, setEditableContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!effectiveSlug) {
      setStatus('not_found');
      return;
    }

    setStatus('loading');

    // Check if this is a bundle route (slug begins with 'bundle-')
    if (effectiveSlug.startsWith('bundle-')) {
      const bundleSlug = effectiveSlug.replace(/^bundle-/, '');
      getPublishedBundle(bundleSlug)
        .then((res) => {
          if (res.bundle && res.bundle.documents.length > 0) {
            setBundle(res.bundle);
            const first = res.bundle.documents[0];
            setActiveBundleDocId(first.id);
            const docView: PublicDocumentView = {
              slug: first.slug,
              title: first.title,
              content: first.content,
              publishedAt: res.bundle.publishedAt,
              updatedAt: res.bundle.publishedAt,
              viewCount: 1,
              isPasswordProtected: res.bundle.isPasswordProtected,
              permissionMode: res.bundle.permissionMode,
              allowCopyMarkdown: true,
              showReadingStats: true,
              theme: 'default',
            };
            setDoc(docView);
            setEditableContent(first.content);
            setOriginalContent(first.content);
            setStatus('ok');
          } else {
            // Fallback to normal doc lookup
            loadSingleDoc(effectiveSlug);
          }
        })
        .catch(() => loadSingleDoc(effectiveSlug));
    } else {
      loadSingleDoc(effectiveSlug);
    }
  }, [effectiveSlug]);

  const loadSingleDoc = (targetSlug: string, pwd?: string) => {
    getPublicDocumentBySlug(targetSlug, pwd)
      .then((res) => {
        setStatus(res.status);
        if (res.doc) {
          setDoc(res.doc);
          setEditableContent(res.doc.content);
          setOriginalContent(res.doc.content);
        }
      })
      .catch(() => {
        setStatus('not_found');
      });
  };

  // Switch between documents in a multi-document bundle
  const handleSelectBundleDoc = (docId: string) => {
    if (!bundle) return;
    const target = bundle.documents.find((d) => d.id === docId);
    if (target) {
      setActiveBundleDocId(docId);
      const docView: PublicDocumentView = {
        slug: target.slug,
        title: target.title,
        content: target.content,
        publishedAt: bundle.publishedAt,
        updatedAt: bundle.publishedAt,
        viewCount: 1,
        isPasswordProtected: bundle.isPasswordProtected,
        permissionMode: target.permissionMode || bundle.permissionMode,
        allowCopyMarkdown: true,
        showReadingStats: true,
        theme: 'default',
      };
      setDoc(docView);
      setEditableContent(target.content);
      setOriginalContent(target.content);
      setSubmitSuccess(false);
    }
  };

  // Dynamic Open Graph and Twitter card meta tags
  useEffect(() => {
    if (!doc) return;
    const originalTitle = document.title;
    const pageTitle = `${doc.title || 'Published Document'} • MD Writer`;
    document.title = pageTitle;

    const setMeta = (name: string, content: string, isProp = false) => {
      const attr = isProp ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const plainExcerpt = doc.content.replace(/[#*`_~[\]()-]/g, '').trim().slice(0, 160) || 'An expressive, distraction-free document published with MD Writer.';
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', plainExcerpt, true);
    setMeta('og:type', 'article', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', plainExcerpt);

    return () => {
      document.title = originalTitle;
    };
  }, [doc]);

  // Window scroll reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setReadingProgress(100);
        return;
      }
      const current = window.scrollY;
      setReadingProgress(Math.min(100, Math.max(0, (current / total) * 100)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
if (!password.trim() || isVerifyingPassword) return;

    setIsVerifyingPassword(true);
    getPublicDocumentBySlug(slug, password)
      .then((res) => {
        setStatus(res.status);
        if (res.doc) {
          setDoc(res.doc);
          setEditableContent(res.doc.content);
          setOriginalContent(res.doc.content);
        }
      })
      .catch(() => {
        setStatus('not_found');
      })
      .finally(() => {
        setIsVerifyingPassword(false);
      });
  };

  const handleCopyMarkdown = () => {
    const textToCopy = doc?.permissionMode === 'edit' ? editableContent : doc?.content;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = doc?.permissionMode === 'edit' ? editableContent : doc?.content;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc?.slug || slug || 'document'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Submit proposed edits (Protected by automatic pre-edit snapshot)
  const handleSubmitEdits = async () => {
    if (!doc) return;
    setIsSubmittingEdit(true);
    setSubmitError(null);

    const res = await submitPublicDocumentEdit(doc.slug, editableContent);
    setIsSubmittingEdit(false);

    if (res.success) {
      setSubmitSuccess(true);
      setOriginalContent(editableContent);
      setDoc({ ...doc, content: editableContent });
    } else {
      setSubmitError(res.error || 'Failed to submit changes.');
    }
  };

  // Formatting helpers for mobile editor
  const insertFormatting = (prefix: string, suffix = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = editableContent.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;
    const next = editableContent.substring(0, start) + replacement + editableContent.substring(end);
    setEditableContent(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 20);
  };

  // Theme palettes: Minimal clean Light vs Dark
  const themeClasses: Record<'light' | 'dark', { bg: string; text: string; headerBg: string; border: string }> = {
    light: {
      bg: 'bg-white',
      text: 'text-neutral-900',
      headerBg: 'bg-white/90',
      border: 'border-neutral-200/80',
    },
    dark: {
      bg: 'bg-[#0e0d14]',
      text: 'text-neutral-100',
      headerBg: 'bg-[#0e0d14]/90',
      border: 'border-neutral-800/80',
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;
  const wordCount = (doc?.permissionMode === 'edit' ? editableContent : doc?.content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // 1. Loading State
  if (status === 'loading') {
    return <PageLoader />;
  }

  // 2. Password Prompt
  if (status === 'password_required' || status === 'invalid_password' || status === 'rate_limited') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-[#0e0e11] text-neutral-800 dark:text-neutral-200 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl space-y-6 font-sans">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
              Protected Document
            </h1>
            <p className="text-xs text-neutral-500">
              The author has protected this page with a passphrase.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passphrase..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            {status === 'invalid_password' && (
              <div className="flex items-center gap-2 text-rose-500 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Incorrect passphrase. Please try again.</span>
              </div>
            )}

            {status === 'rate_limited' && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Too many attempts. Please wait 10 minutes before retrying.</span>
              </div>
            )}

            <button
              type="submit"
disabled={isVerifyingPassword}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
            >
              {isVerifyingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Passphrase...</span>
                </>
              ) : (
                <span>Unlock Page</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. 404 / Private Notice
  if (status === 'not_found' || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-50 dark:bg-[#0e0e11] text-neutral-800 dark:text-neutral-200 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl text-center space-y-5 font-sans">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center border border-neutral-200/60 dark:border-neutral-700/60">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
              Document Not Available
            </h1>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This document does not exist, has been unpublished by the author, or the link has expired.
            </p>
          </div>
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <PenTool className="w-4 h-4" />
            <span>Open MD Writer</span>
          </Link>
        </div>
      </div>
    );
  }

  // 4. View & Edit Mode (Receiver Experience with Minimal Modern Layout on Mobile)
  const isEditMode = doc.permissionMode === 'edit';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8257F5] to-indigo-500 z-50 transition-all duration-75 pointer-events-none"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Header Bar */}
      <header
        className={`sticky top-0 z-30 h-14 border-b backdrop-blur-md px-3 sm:px-6 flex items-center justify-between select-none transition-colors ${currentTheme.headerBg} ${currentTheme.border}`}
      >
        {/* Brand & Document Context */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white hover:opacity-80 transition-opacity shrink-0"
          >
            <img 
              src="/logo.png" 
              alt="MD Writer" 
              className="w-6 h-6 rounded-lg object-contain shadow-xs" 
            />
            <span className="hidden sm:inline font-bold tracking-tight">MD Writer</span>
          </Link>

          <span className="text-neutral-400 hidden sm:inline">/</span>

          <span className="text-xs font-semibold truncate max-w-[140px] sm:max-w-xs">
            {doc.title}
          </span>

          {isEditMode ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              <span>View & Edit</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              Read Only
            </span>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Edit / Preview Toggle in Edit Mode */}
          {isEditMode && (
            <div className="inline-flex rounded-lg bg-neutral-200/80 dark:bg-neutral-800 p-0.5 text-xs font-medium shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab('edit')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs ${
                  mobileTab === 'edit'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs ${
                  mobileTab === 'preview'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>
          )}

                    {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-current/15 hover:bg-current/5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-neutral-600" />
                <span className="hidden md:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          {/* Social Card Button */}
          <button
            onClick={() => setIsSocialCardOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            title="Social Card"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden md:inline">Share</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-current/15 hover:bg-current/5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Copy Markdown"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
            <span className="hidden md:inline">{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-current/15 hover:bg-current/5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download .md"
          >
            <Download className="w-3.5 h-3.5 opacity-70" />
            <span className="hidden md:inline">Download</span>
          </button>
        </div>
      </header>

      {/* Multi-Document Bundle Navigation Bar (if viewing a bundle) */}
      {bundle && bundle.documents.length > 1 && (
        <div className="bg-neutral-100/90 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-sans">
          <span className="text-[11px] font-bold text-neutral-400 shrink-0 flex items-center gap-1">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Bundle:</span>
          </span>
          {bundle.documents.map((bDoc) => (
            <button
              key={bDoc.id}
              onClick={() => handleSelectBundleDoc(bDoc.id)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer text-xs font-medium ${
                activeBundleDocId === bDoc.id
                  ? 'bg-brand-600 text-white font-bold shadow-2xs'
                  : 'bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {bDoc.title}
            </button>
          ))}
        </div>
      )}

      {/* Success Notice if Edits were Submitted */}
      {submitSuccess && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-sans">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Changes Submitted!</strong> A safety snapshot of the previous version was automatically archived.
            </span>
          </div>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="text-emerald-600 hover:underline text-[11px] font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notice */}
      {submitError && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 font-sans">
          <span>{submitError}</span>
          <button onClick={() => setSubmitError(null)} className="text-rose-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main View Area */}
      {isEditMode ? (
        /* Minimal Modern Layout for View & Edit */
        <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-3 font-sans">
          {/* Mobile/Desktop Edit Toolbar */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800/80 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('## ')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Heading"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- [ ] ')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Task Box"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('`', '`')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Diff & Submit Action Cluster */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsDiffModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Preview only changed lines"
              >
                <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span className="hidden xs:inline">Diff Preview</span>
              </button>

              <button
                type="button"
                disabled={isSubmittingEdit || editableContent === originalContent}
                onClick={handleSubmitEdits}
                className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingEdit ? 'Submitting...' : 'Submit Changes'}</span>
              </button>
            </div>
          </div>

          {/* Split / Segmented Editor Body */}
          <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-[60vh]">
            {/* Editor Canvas (Visible when edit tab is selected or desktop) */}
            <div
              className={`flex-1 flex flex-col rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#15141c] overflow-hidden shadow-xs ${
                mobileTab === 'edit' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <textarea
                ref={textareaRef}
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                placeholder="Type your suggested edits in Markdown..."
                className="flex-1 w-full p-4 sm:p-6 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
              />
              <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>{wordCount} words • {editableContent.length} chars</span>
                <span>Auto-snapshot protection on submit</span>
              </div>
            </div>

            {/* Live Markdown Preview (Visible when preview tab is selected or desktop) */}
            <div
              className={`flex-1 flex flex-col rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#15141c] overflow-hidden shadow-xs ${
                mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed">
                <MarkdownPreview content={editableContent} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Clean Read-Only Reader Canvas */
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-12 md:px-16 pt-12 pb-24 space-y-8 font-sans">
          {/* Editorial Header */}
          <div className="space-y-4 pb-6 border-b border-current/15">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {doc.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs opacity-75 font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-60" />
                <span>{new Date(doc.publishedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 opacity-60" />
                <span>{readingTime} min read ({wordCount.toLocaleString()} words)</span>
              </span>

              {doc.viewCount > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 opacity-60" />
                    <span>{doc.viewCount} views</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Document Markdown Body */}
          <article className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed break-words">
            <MarkdownPreview content={doc.content} />
          </article>
        </main>
      )}

      {/* Reader Footer */}
      <footer className={`py-8 text-center text-xs opacity-60 border-t ${currentTheme.border} font-mono select-none`}>
        <p>Published with MD Writer • Fast, offline-first Markdown workstation</p>
      </footer>

      {/* Difference Preview Modal in View-Edit */}
      {isDiffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-sans">
          <div
            className="relative w-full max-w-3xl bg-white dark:bg-[#121118] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>Only Difference Change Preview</span>
              </h3>
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <DiffViewer
                original={originalContent}
                modified={editableContent}
                defaultOnlyDiffs={true}
                className="flex-1"
              />
            </div>

            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-400 font-mono">
                Green = Additions • Red = Deletions
              </span>
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branded Social Card Generator Modal */}
      {isSocialCardOpen && (
        <React.Suspense fallback={null}>
          <SocialCardGeneratorModal
            isOpen={isSocialCardOpen}
            onClose={() => setIsSocialCardOpen(false)}
            title={doc.title}
            content={isEditMode ? editableContent : doc.content}
            slug={doc.slug}
            authorName="MD Writer Author"
          />
        </React.Suspense>
      )}
    </div>
  );
};
