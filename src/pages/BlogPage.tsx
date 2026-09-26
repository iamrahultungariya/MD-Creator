import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  X, 
  Send, 
  CheckCircle2,
  FileEdit,
  Plus,
  Trash2
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { useAuthStore } from '../stores/useAuthStore';
import { 
  BlogCategory, 
  Article, 
  DEFAULT_ARTICLES, 
  CATEGORIES, 
  LOCAL_STORAGE_KEY 
} from '../data/blogArticles';
import { BlogCreateModal } from '../components/blog/BlogCreateModal';

const MarkdownPreview = React.lazy(() =>
  import('../components/editor/MarkdownPreview').then((m) => ({ default: m.MarkdownPreview }))
);

export const BlogPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [customArticles, setCustomArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<'All' | BlogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  // Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorName, setNewAuthorName] = useState(user?.displayName || 'Community Author');
  const [newAuthorRole, setNewAuthorRole] = useState('Markdown Practitioner');
  const [newCategory, setNewCategory] = useState<BlogCategory>('Engineering');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [formError, setFormError] = useState('');

  // Combined list with custom articles first
  const allArticles = [...customArticles, ...DEFAULT_ARTICLES];

  const filteredArticles = allArticles.filter(art => {
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = allArticles.find(art => art.featured) || allArticles[0];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setEmailSubscribed(true);
      setEmailInput('');
      setTimeout(() => setEmailSubscribed(false), 4000);
    }
  };

  const handlePublishArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('Please provide both a title and article content.');
      return;
    }

    const wordCount = newContent.trim().split(/\s+/).length;
    const calculatedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

    const articleToSave: Article = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      excerpt: newExcerpt.trim() || newContent.trim().slice(0, 140) + '...',
      category: newCategory,
      readTime: calculatedReadTime,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: {
        name: newAuthorName.trim() || 'Community Contributor',
        role: newAuthorRole.trim() || 'Writer',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newAuthorName.trim() || 'Author')}`
      },
      content: newContent,
      isUserCreated: true
    };

    const updated = [articleToSave, ...customArticles];
    setCustomArticles(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save article locally:', err);
    }

    // Reset Form
    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    setFormError('');
    setIsCreateModalOpen(false);

    // Open reading modal for new article
    setActiveArticle(articleToSave);
  };

  const handleDeleteCustomArticle = (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this article from your browser?')) {
      const updated = customArticles.filter(a => a.id !== articleId);
      setCustomArticles(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update localStorage:', err);
      }
      if (activeArticle?.id === articleId) {
        setActiveArticle(null);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar />

      <main className="flex-1">
        
        {/* Header Hero Section */}
        <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-5 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>MD Writer Blog</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 dark:text-white tracking-tight mb-5 leading-tight">
            Writing, Engineering &amp;<br />Productivity Insights.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Explorations into offline-first software architecture, Markdown workflows, typography craft, and distraction-free creative tooling.
          </p>

          {/* Search Bar & Write Button */}
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles and guides..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-2xs transition-all"
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Write Article</span>
            </button>
          </div>
        </section>

        {/* Featured Article Card (Only when no search query and 'All' category) */}
        {!searchQuery && selectedCategory === 'All' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
            <div 
              onClick={() => setActiveArticle(featuredArticle)}
              className="relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 p-8 sm:p-12 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-2.5 py-1 rounded-full">
                  Featured Story
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {featuredArticle.category}
                </span>
                {featuredArticle.isUserCreated && (
                  <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    Community
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 dark:text-white tracking-tight mb-4 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                {featuredArticle.title}
              </h2>

              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed mb-8">
                {featuredArticle.excerpt}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredArticle.author.avatar}
                    alt={featuredArticle.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      {featuredArticle.author.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {featuredArticle.date} • {featuredArticle.readTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 dark:text-white group-hover:translate-x-1 transition-transform">
                  <span>Read full story</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category Filter Pills */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs font-bold'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-850 dark:hover:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {filteredArticles.length === 0 ? (
            <div className="p-16 text-center text-sm text-neutral-400">
              No articles found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-7 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                >
                  <div>
                    {/* Category & Time */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg">
                          {article.category}
                        </span>
                        {article.isUserCreated && (
                          <span className="text-[9px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                            Your Post
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                        {article.isUserCreated && (
                          <button
                            onClick={(e) => handleDeleteCustomArticle(e, article.id)}
                            className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3 mb-6">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Author & Footer */}
                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                      />
                      <div>
                        <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                          {article.author.name}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {article.date}
                        </div>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter Subscription Strip */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 p-8 sm:p-10 text-center">
            <h3 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
              Stay in the writing flow.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
              Subscribe to get notified about new markdown guides, architecture deep dives, and editor feature updates.
            </p>

            {emailSubscribed ? (
              <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Thank you for subscribing! Check your inbox for confirmation.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email..."
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe</span>
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      <Footer />

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:px-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-2.5 py-1 rounded-lg">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-neutral-400">
                  {activeArticle.readTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const snippet = activeArticle.content;
                    const encoded = encodeURIComponent(snippet);
                    setActiveArticle(null);
                    navigate(`/editor?content=${encoded}`);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open this article in the editor"
                >
                  <FileEdit className="w-3.5 h-3.5 text-blue-500" />
                  <span className="hidden sm:inline">Open in Editor</span>
                </button>

                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Article Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <img
                  src={activeArticle.author.avatar}
                  alt={activeArticle.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
                />
                <div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">
                    {activeArticle.author.name}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {activeArticle.author.role} • {activeArticle.date}
                  </div>
                </div>
              </div>

              {/* Rendered Markdown Article */}
              <div className="prose dark:prose-invert max-w-none">
                <React.Suspense fallback={
                  <div className="space-y-4 py-4 animate-pulse">
                    <div className="h-8 bg-neutral-200/50 dark:bg-neutral-800/60 rounded-lg w-2/3" />
                    <div className="h-4 bg-neutral-200/40 dark:bg-neutral-800/50 rounded w-full" />
                    <div className="h-4 bg-neutral-200/40 dark:bg-neutral-800/50 rounded w-5/6" />
                    <div className="h-4 bg-neutral-200/40 dark:bg-neutral-800/50 rounded w-4/5" />
                    <div className="h-28 bg-neutral-200/30 dark:bg-neutral-800/40 rounded-xl mt-6" />
                  </div>
                }>
                  <MarkdownPreview content={activeArticle.content} />
                </React.Suspense>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Published by MD Writer Blog. Free to read and share.</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="font-semibold text-neutral-800 dark:text-neutral-200 hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Article Modal */}
      <BlogCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handlePublishArticle}
        formError={formError}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newAuthorName={newAuthorName}
        setNewAuthorName={setNewAuthorName}
        newAuthorRole={newAuthorRole}
        setNewAuthorRole={setNewAuthorRole}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newExcerpt={newExcerpt}
        setNewExcerpt={setNewExcerpt}
        newContent={newContent}
        setNewContent={setNewContent}
      />

    </div>
  );
};
