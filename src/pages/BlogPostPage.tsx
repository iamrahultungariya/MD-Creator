import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  Check, 
  ChevronRight, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Article, DEFAULT_ARTICLES } from '../data/blogArticles';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MarkdownPreview } from '../components/editor/MarkdownPreview';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // 1. Check local static default articles first (instant response)
    const localMatch = DEFAULT_ARTICLES.find(
      (a) => a.slug === slug || a.id === slug
    );

    if (localMatch) {
      setArticle(localMatch);
      setIsLoading(false);
      return;
    }

    // 2. Fall back to Supabase query
    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      setIsLoading(true);
      const fetchArticle = async () => {
        try {
          const { data } = await client
            .from('blog_articles')
            .select('*')
            .or(`slug.eq.${slug},id.eq.${slug}`)
            .maybeSingle();

          if (data) {
            setArticle({
              id: data.id,
              user_id: data.user_id,
              title: data.title,
              slug: data.slug || data.id,
              excerpt: data.excerpt || '',
              category: data.category || 'Guides',
              readTime: data.read_time || '5 min read',
              date: new Date(data.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              status: 'published',
              content: data.content || '',
              author: {
                name: data.author_name || 'MD Writer Team',
                role: data.author_role || 'Contributor',
                avatar: data.author_avatar || '/logo.png',
              },
            });
          }
        } catch {
          // Fall back gracefully
        } finally {
          setIsLoading(false);
        }
      };

      fetchArticle();
    } else {
      setIsLoading(false);
    }
  }, [slug]);

  // Dynamic SEO & Schema.org Article Injection
  useEffect(() => {
    if (!article) return;

    const pageTitle = `${article.title} • MD Writer Blog`;
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

    setMeta('description', article.excerpt);
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', article.excerpt, true);
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', article.excerpt);

    // Dynamic Article Schema.org (AEO & Google Article Rich Results)
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'article-structured-data';
    schemaScript.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.date,
      author: {
        '@type': 'Person',
        name: article.author.name,
        jobTitle: article.author.role,
      },
      publisher: {
        '@type': 'Organization',
        name: 'MD Writer',
        logo: 'https://writermd.vercel.app/logo.png',
      },
      mainEntityOfPage: `https://writermd.vercel.app/blog/${article.slug || article.id}`,
    });
    document.head.appendChild(schemaScript);

    return () => {
      const existing = document.getElementById('article-structured-data');
      if (existing) existing.remove();
    };
  }, [article]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFAFD] dark:bg-[#0E0B14] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500 font-mono">Loading publication...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FBFAFD] dark:bg-[#0E0B14] flex items-center justify-center font-sans text-neutral-900 dark:text-neutral-100">
        <div className="text-center max-w-md p-6 space-y-4">
          <BookOpen className="w-12 h-12 text-neutral-400 mx-auto" />
          <h1 className="text-2xl font-bold">Article Not Found</h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The article you are looking for may have been updated or moved.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAFD] dark:bg-[#0E0B14] text-neutral-900 dark:text-[#EDEAF5] font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Articles</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-[200px] sm:max-w-xs">
              {article.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 font-medium transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
            <Link
              to="/editor"
              className="px-3.5 py-1.5 rounded-lg bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Open Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Article Meta Header */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20">
              {article.category}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-500 font-mono">{article.date}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.18]">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
            {article.excerpt}
          </p>

          {/* Author Badge */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
            />
            <div>
              <div className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">
                {article.author.name}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {article.author.role}
              </div>
            </div>
          </div>
        </div>

        {/* Article Markdown Body */}
        <article className="prose prose-neutral dark:prose-invert max-w-none pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <MarkdownPreview content={article.content} />
        </article>

        {/* Bottom CTA Box */}
        <div className="mt-16 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
            Write focused technical documents with MD Writer
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            100% offline persistence, native KaTeX LaTeX equations, Mermaid diagrams, and direct Google Gemini 3.x BYOK.
          </p>
          <div className="pt-2">
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              Open Studio Editor
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
