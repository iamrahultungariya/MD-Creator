import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
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
  Loader2,
  PenTool
} from 'lucide-react';
import { getPublicDocumentBySlug, PublicDocumentView } from '../services/publishService';
import { MarkdownPreview } from '../components/editor/MarkdownPreview';

export const PublicDocumentPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();

  const [doc, setDoc] = useState<PublicDocumentView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'not_found' | 'password_required' | 'invalid_password'>('loading');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState<'default' | 'paper' | 'sepia' | 'nordic' | 'dark'>('default');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!slug) {
      setStatus('not_found');
      return;
    }

    setStatus('loading');
    getPublicDocumentBySlug(slug)
      .then((res) => {
        setStatus(res.status);
        if (res.doc) {
          setDoc(res.doc);
        }
      })
      .catch(() => {
        setStatus('not_found');
      });
  }, [slug]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setStatus('loading');
    getPublicDocumentBySlug(slug, password)
      .then((res) => {
        setStatus(res.status);
        if (res.doc) {
          setDoc(res.doc);
        }
      })
      .catch(() => {
        setStatus('not_found');
      });
  };

  const handleCopyMarkdown = () => {
    if (!doc?.content) return;
    navigator.clipboard.writeText(doc.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!doc) return;
    const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug || 'document'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Theme palettes
  const themeClasses: Record<string, { bg: string; text: string; headerBg: string; border: string }> = {
    default: {
      bg: 'bg-white dark:bg-[#111114]',
      text: 'text-neutral-900 dark:text-neutral-100',
      headerBg: 'bg-white/85 dark:bg-[#111114]/85',
      border: 'border-neutral-200/80 dark:border-neutral-800/80',
    },
    paper: {
      bg: 'bg-[#faf8f5]',
      text: 'text-[#1c1917]',
      headerBg: 'bg-[#faf8f5]/85',
      border: 'border-[#e7e5e4]',
    },
    sepia: {
      bg: 'bg-[#fbf0d9]',
      text: 'text-[#382618]',
      headerBg: 'bg-[#fbf0d9]/85',
      border: 'border-[#eedfc3]',
    },
    nordic: {
      bg: 'bg-[#181d24]',
      text: 'text-[#d8dee9]',
      headerBg: 'bg-[#181d24]/85',
      border: 'border-[#27303d]',
    },
    dark: {
      bg: 'bg-[#090a0d]',
      text: 'text-[#f3f4f6]',
      headerBg: 'bg-[#090a0d]/85',
      border: 'border-neutral-800',
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.default;
  const wordCount = doc ? doc.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // 1. Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#111114] text-neutral-600 dark:text-neutral-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-mono">Loading published page...</p>
      </div>
    );
  }

  // 2. Password Prompt
  if (status === 'password_required' || status === 'invalid_password') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-[#0e0e11] text-neutral-800 dark:text-neutral-200">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
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
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {status === 'invalid_password' && (
              <div className="flex items-center gap-2 text-rose-500 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Incorrect passphrase. Please try again.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
            >
              Unlock Page
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. 404 / Private Notice
  if (status === 'not_found' || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-50 dark:bg-[#0e0e11] text-neutral-800 dark:text-neutral-200">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <PenTool className="w-4 h-4" />
            <span>Open MD-Creator</span>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Clean Read-Only Reader Canvas
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Sticky Reader Header */}
      <header
        className={`sticky top-0 z-30 h-14 border-b backdrop-blur-md px-4 sm:px-8 flex items-center justify-between select-none transition-colors ${currentTheme.headerBg} ${currentTheme.border}`}
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold text-xs font-mono shadow-xs">
            MD
          </div>
          <span className="hidden sm:inline font-mono tracking-tight">MD-Creator</span>
        </Link>

        {/* Reader Theme Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Palette Dots */}
          <div className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-full border border-current/15">
            {(['default', 'paper', 'sepia', 'nordic', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                  t === 'default' ? 'bg-neutral-500 border-neutral-400' :
                  t === 'paper' ? 'bg-[#faf8f5] border-neutral-300' :
                  t === 'sepia' ? 'bg-[#fbf0d9] border-amber-300' :
                  t === 'nordic' ? 'bg-[#181d24] border-blue-400' :
                  'bg-[#090a0d] border-neutral-700'
                } ${theme === t ? 'ring-2 ring-blue-500 scale-110' : 'opacity-60 hover:opacity-100'}`}
                title={`Reader theme: ${t}`}
              />
            ))}
          </div>

          {/* Copy Markdown Button */}
          <button
            onClick={handleCopyMarkdown}
            className="px-2.5 py-1.5 rounded-xl border border-current/15 hover:bg-current/5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Copy Raw Markdown"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Markdown'}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-current/15 hover:bg-current/5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download .md file"
          >
            <Download className="w-3.5 h-3.5 opacity-70" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Create Own */}
          <Link
            to="/editor"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write in MD</span>
          </Link>
        </div>
      </header>

      {/* Main Reader Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-12 md:px-16 pt-12 pb-24 space-y-8">
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

      {/* Reader Footer */}
      <footer className={`py-8 text-center text-xs opacity-60 border-t ${currentTheme.border} font-mono select-none`}>
        <p>Published with MD-Creator • Fast, offline-first Markdown workstation</p>
      </footer>
    </div>
  );
};
