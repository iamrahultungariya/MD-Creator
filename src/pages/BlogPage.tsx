import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  FileEdit, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../lib/supabase';
import { 
  BlogCategory, 
  Article, 
  CATEGORIES, 
} from '../data/blogArticles';
import { BlogCreateModal } from '../components/blog/BlogCreateModal';
import { BlogReaderModal } from '../components/blog/BlogReaderModal';
import { isCurrentUserAdmin } from '../utils/adminAuth';

const isUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const MarkdownPreview = React.lazy(() =>
  import('../components/editor/MarkdownPreview').then((m) => ({ default: m.MarkdownPreview }))
);

export const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);

  // Articles state initialized with empty list, loaded authoritative from Supabase
  const [articles, setArticles] = useState<Article[]>([]);

  // Navigation & Filter state
  const [selectedCategory, setSelectedCategory] = useState<'All' | BlogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorName, setNewAuthorName] = useState(user?.displayName || '');
  const [newAuthorRole, setNewAuthorRole] = useState('Markdown Contributor');
  const [newCategory, setNewCategory] = useState<BlogCategory>('Engineering');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [formError, setFormError] = useState('');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Authoritative admin verification via Supabase database
  useEffect(() => {
    if (user?.id) {
      isCurrentUserAdmin(user.id).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user?.id]);

  // Load articles directly from Supabase tables
  const loadContent = useCallback(async () => {
    if (!supabase) return;

    try {
      const artRes = await supabase
        .from('blog_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (artRes.data && artRes.data.length > 0) {
        const fetched: Article[] = artRes.data.map((a: any) => ({
          id: a.id,
          user_id: a.user_id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          category: a.category,
          readTime: a.read_time,
          date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          author: {
            name: a.author_name,
            role: a.author_role,
            avatar: a.author_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.author_name)}`,
          },
          content: a.content,
          featured: Boolean(a.featured),
          status: a.status,
          submittedAt: a.created_at,
        }));
        setArticles(fetched);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.warn('Could not load blog articles:', err);
      setArticles([]);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Filtered published articles for public readers
  const publishedArticles = useMemo(() => {
    return articles.filter((art) => art.status === 'published');
  }, [articles]);

  const pendingArticles = useMemo(() => {
    return articles.filter((art) => art.status === 'pending');
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((art) => {
      const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [publishedArticles, selectedCategory, searchQuery]);

  // Submission handler (Direct to Supabase, generates UUID on client to avoid RLS 42501 error)
  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('Please provide both an article title and content.');
      return;
    }

    if (!supabase) {
      setFormError('Supabase is not configured.');
      return;
    }

    const wordCount = newContent.trim().split(/\s+/).length;
    const calculatedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
    const initialStatus: 'published' | 'pending' = isAdmin ? 'published' : 'pending';
    const targetSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 36) + '-' + Math.random().toString(36).substring(2, 6);

    const newId = crypto.randomUUID();
    const newArticleRecord = {
      id: newId,
      user_id: user?.id || null,
      title: newTitle.trim(),
      slug: targetSlug,
      excerpt: newExcerpt.trim() || newContent.trim().slice(0, 140) + '...',
      category: newCategory,
      content: newContent,
      author_name: newAuthorName.trim() || user?.displayName || 'Community Author',
      author_role: newAuthorRole.trim() || 'Writer',
      author_avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        newAuthorName.trim() || user?.displayName || 'Author'
      )}`,
      read_time: calculatedReadTime,
      featured: false,
      status: initialStatus,
    };

    const { error } = await supabase.from('blog_articles').insert([newArticleRecord]);

    if (error) {
      setFormError(`Failed to submit article: ${error.message}`);
      return;
    }

    const newArticle: Article = {
      id: newId,
      user_id: newArticleRecord.user_id,
      title: newArticleRecord.title,
      slug: newArticleRecord.slug,
      excerpt: newArticleRecord.excerpt,
      category: newArticleRecord.category,
      readTime: newArticleRecord.read_time,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: {
        name: newArticleRecord.author_name,
        role: newArticleRecord.author_role,
        avatar: newArticleRecord.author_avatar,
      },
      content: newArticleRecord.content,
      isUserCreated: true,
      status: newArticleRecord.status,
      submittedAt: new Date().toISOString(),
    };

    setArticles((prev) => [newArticle, ...prev]);

    // Reset Form
    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    setFormError('');
    setIsCreateModalOpen(false);

    if (isAdmin) {
      showToast('✨ Article published live to the community blog.');
      setActiveArticle(newArticle);
    } else {
      showToast('🎉 Article submitted for editorial review! It will appear once approved.');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!supabase) return;
    if (window.confirm('Delete this article record permanently?')) {
      if (isUuid(articleId)) {
        const { error } = await supabase
          .from('blog_articles')
          .delete()
          .eq('id', articleId);

        if (error) {
          showToast(`⚠️ Failed to delete article: ${error.message}`);
          return;
        }
      }

      setArticles((prev) => prev.filter((art) => art.id !== articleId));
      if (activeArticle?.id === articleId) setActiveArticle(null);
      showToast('🗑️ Article deleted.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar />

      {/* Floating Status Notification */}
      {feedbackToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      <main className="flex-1">
        {/* Admin Notification Strip */}
        {isAdmin && (
          <section className="bg-neutral-900 border-b border-neutral-800 py-3 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-bold text-white">Editorial Admin Mode:</span>
                <span className="text-neutral-300">
                  {pendingArticles.length > 0
                    ? `${pendingArticles.length} pending community article(s) waiting for moderation`
                    : 'All submitted articles are up to date'}
                </span>
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <span>Open Admin Panel</span>
                <span className="text-neutral-900 font-extrabold">→</span>
              </button>
            </div>
          </section>
        )}

        {/* Public Hero Section */}
        <section className="pt-16 pb-10 sm:pt-20 sm:pb-14 text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs font-semibold text-amber-900 dark:text-amber-300 mb-5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Community Editorial</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 dark:text-white tracking-tight mb-4 leading-tight">
            You Write, We Publish.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
            An open community publishing platform for engineering writeups, Markdown workflows, typography craft, and technical essays.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <FileEdit className="w-4 h-4" />
              <span>Submit Your Story</span>
            </button>
          </div>
        </section>

        {/* Categories & Search Controls */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
          <div className="p-3 sm:p-4 rounded-3xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
          </div>
        </section>

        {/* Article Grid or Empty State */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          {filteredArticles.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-850 flex items-center justify-center text-neutral-500 mx-auto mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white mb-2">
                The Stage Is Yours
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                No community articles published yet in this view. Share your engineering takeaways, Markdown tips, or creative workflow today!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Write the 1st Story</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-900/40">
                        {article.category}
                      </span>
                      <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-neutral-950 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                      />
                      <div>
                        <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {article.author.name}
                        </div>
                        <div className="text-[10px] text-neutral-400">{article.date}</div>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArticle(article.id);
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Article Full Reader Modal */}
      <BlogReaderModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        MarkdownPreview={MarkdownPreview}
      />

      {/* Creation Modal */}
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

      <Footer onOpenUpdates={() => {}} />
    </div>
  );
};
