import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Clock, 
  ArrowRight, 
  ChevronRight
} from 'lucide-react';
import { Article, BlogCategory, CATEGORIES, DEFAULT_ARTICLES } from '../data/blogArticles';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'All' | BlogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>(DEFAULT_ARTICLES);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  // Fetch published community/admin articles from Supabase if connected
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const client = supabase;

    const fetchArticles = async () => {
      setIsLoadingArticles(true);
      try {
        const { data } = await client
          .from('blog_articles')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const dbArticles: Article[] = data.map((a: any) => ({
            id: a.id,
            user_id: a.user_id,
            title: a.title,
            slug: a.slug || a.id,
            excerpt: a.excerpt || '',
            category: a.category || 'Guides',
            readTime: a.read_time || '5 min read',
            date: new Date(a.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            featured: Boolean(a.featured),
            status: 'published',
            content: a.content || '',
            author: {
              name: a.author_name || 'MD Writer Team',
              role: a.author_role || 'Contributor',
              avatar: a.author_avatar || '/logo.png',
            },
          }));

          // Merge DB articles with default local articles, avoiding duplicate slugs
          const seenSlugs = new Set(dbArticles.map((a) => a.slug));
          const uniqueDefaults = DEFAULT_ARTICLES.filter((a) => !seenSlugs.has(a.slug));
          setArticles([...dbArticles, ...uniqueDefaults]);
        }
      } catch {
        // Fall back to static DEFAULT_ARTICLES
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-[#FBFAFD] dark:bg-[#0E0B14] text-neutral-900 dark:text-[#EDEAF5] font-sans transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 select-none group">
              <img src="/logo.png" alt="MD Writer" className="w-6 h-6 rounded-md object-contain" />
              <span className="font-semibold text-sm tracking-tight text-neutral-950 dark:text-white">
                MD Writer
              </span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Blog &amp; Architecture
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/pricing"
              className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white font-medium px-2 py-1"
            >
              Pricing
            </Link>
            <Link
              to="/editor"
              className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Open Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Blog Hero Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-mono text-xs mb-4">
            <span>ENGINEERING • LOCAL-FIRST • LATEX MATH</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-neutral-950 dark:text-white mb-4 leading-tight">
            Technical writing, markdown engineering, and local-first guides.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            In-depth architectural analyses, LaTeX formatting cheatsheets, Mermaid.js tutorials, and plain-text benchmarks from the MD Writer team.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors duration-150 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Featured Article Card */}
        {featuredArticle && !searchQuery && selectedCategory === 'All' && (
          <div 
            onClick={() => navigate(`/blog/${featuredArticle.slug || featuredArticle.id}`)}
            className="mb-12 p-6 sm:p-10 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-[box-shadow,border-color] duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20">
                {featuredArticle.category}
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {featuredArticle.readTime}
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500 font-mono">{featuredArticle.date}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {featuredArticle.title}
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 max-w-3xl">
              {featuredArticle.excerpt}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <img
                  src={featuredArticle.author.avatar}
                  alt={featuredArticle.author.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
                />
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {featuredArticle.author.name}
                </span>
                <span className="text-xs text-neutral-400 hidden sm:inline">
                  — {featuredArticle.author.role}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* Regular Articles Grid */}
        {filteredArticles.length === 0 && !isLoadingArticles ? (
          <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No articles found matching &quot;{searchQuery}&quot;.</p>
          </div>
        ) : isLoadingArticles ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-3 animate-pulse">
                <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-5 w-4/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                <div className="h-3 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchQuery || selectedCategory !== 'All' ? filteredArticles : regularArticles).map((article) => (
              <article
                key={article.id}
                onClick={() => navigate(`/blog/${article.slug || article.id}`)}
                className="p-6 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-[box-shadow,border-color] duration-150 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                      {article.category}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">{article.readTime}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-white mb-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[120px]">
                      {article.author.name}
                    </span>
                  </div>
                  <span className="text-neutral-400 text-[11px] font-mono">{article.date}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom Callout Banner */}
        <section className="mt-16 p-8 sm:p-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/30 text-center space-y-4">
          <h3 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Ready to draft your next technical document?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            100% local-first. No accounts required, zero telemetry, KaTeX LaTeX math, and Google Gemini 3.x BYOK.
          </p>
          <div className="pt-2">
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors duration-150 active:translate-y-[1px]"
            >
              <span>Launch Studio Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
