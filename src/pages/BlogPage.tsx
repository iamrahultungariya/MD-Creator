import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  FileEdit, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle,
  Eye,
  Star,
  MessageSquare
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
import { UserReview } from '../components/home/ReviewsSection';
import { BlogCreateModal } from '../components/blog/BlogCreateModal';
import { BlogReaderModal } from '../components/blog/BlogReaderModal';
import { isCurrentUserAdmin } from '../utils/adminAuth';

const MarkdownPreview = React.lazy(() =>
  import('../components/editor/MarkdownPreview').then((m) => ({ default: m.MarkdownPreview }))
);

export const BlogPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);

  // Articles & Reviews state loaded directly from Supabase
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);

  // Navigation & Filter state
  const [selectedCategory, setSelectedCategory] = useState<'All' | BlogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [adminTab, setAdminTab] = useState<'articles' | 'reviews'>('articles');
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

  // Load articles and reviews directly from Supabase tables
  const loadContent = useCallback(async () => {
    if (!supabase) return;

    try {
      const [artRes, revRes] = await Promise.all([
        supabase
          .from('blog_articles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('community_reviews')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (artRes.data) {
        setArticles(artRes.data.map((a: any) => ({
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
        })));
      }

      if (revRes.data) {
        setReviews(revRes.data.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          name: r.name,
          role: r.role,
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          content: r.content,
          verified: Boolean(r.verified),
          status: r.status,
          submittedAt: r.created_at,
        })));
      }
    } catch (err) {
      console.warn('Could not load blog/reviews data:', err);
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

  const pendingReviews = useMemo(() => {
    return reviews.filter((rev) => rev.status === 'pending');
  }, [reviews]);

  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((art) => {
      const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [publishedArticles, selectedCategory, searchQuery]);

  // Submission handler (Direct to Supabase, fails loudly)
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
    const initialStatus = isAdmin ? 'published' : 'pending';
    const targetSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 36) + '-' + Math.random().toString(36).substring(2, 6);

    const { data, error } = await supabase.from('blog_articles').insert([
      {
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
      }
    ]).select().single();

    if (error) {
      setFormError(`Failed to submit article: ${error.message}`);
      return;
    }

    const newArticle: Article = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      category: data.category,
      readTime: data.read_time,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: {
        name: data.author_name,
        role: data.author_role,
        avatar: data.author_avatar,
      },
      content: data.content,
      isUserCreated: true,
      status: data.status,
      submittedAt: data.created_at,
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

  // Moderation Handlers: Articles (Supabase DB updates)
  const handleApproveArticle = async (articleId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('blog_articles')
      .update({ status: 'published' })
      .eq('id', articleId);

    if (error) {
      showToast(`⚠️ Failed to approve article: ${error.message}`);
      return;
    }

    setArticles((prev) =>
      prev.map((art) => (art.id === articleId ? { ...art, status: 'published' as const } : art))
    );
    showToast('✅ Article approved and published live.');
  };

  const handleRejectArticle = async (articleId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('blog_articles')
      .update({ status: 'rejected' })
      .eq('id', articleId);

    if (error) {
      showToast(`⚠️ Failed to reject article: ${error.message}`);
      return;
    }

    setArticles((prev) =>
      prev.map((art) => (art.id === articleId ? { ...art, status: 'rejected' as const } : art))
    );
    showToast('⚠️ Article marked as rejected.');
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!supabase) return;
    if (window.confirm('Delete this article record permanently?')) {
      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', articleId);

      if (error) {
        showToast(`⚠️ Failed to delete article: ${error.message}`);
        return;
      }

      setArticles((prev) => prev.filter((art) => art.id !== articleId));
      if (activeArticle?.id === articleId) setActiveArticle(null);
      showToast('🗑️ Article deleted.');
    }
  };

  // Moderation Handlers: Reviews (Supabase DB updates)
  const handleApproveReview = async (reviewId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('community_reviews')
      .update({ status: 'approved' })
      .eq('id', reviewId);

    if (error) {
      showToast(`⚠️ Failed to approve review: ${error.message}`);
      return;
    }

    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, status: 'approved' as const } : rev))
    );
    showToast('✅ Community review approved for homepage display.');
  };

  const handleRejectReview = async (reviewId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('community_reviews')
      .update({ status: 'rejected' })
      .eq('id', reviewId);

    if (error) {
      showToast(`⚠️ Failed to reject review: ${error.message}`);
      return;
    }

    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, status: 'rejected' as const } : rev))
    );
    showToast('⚠️ Community review marked as rejected.');
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!supabase) return;
    if (window.confirm('Delete this review record permanently?')) {
      const { error } = await supabase
        .from('community_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        showToast(`⚠️ Failed to delete review: ${error.message}`);
        return;
      }

      setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
      showToast('🗑️ Review deleted.');
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
        {/* Admin Moderation Panel (Exclusive to authenticated Admin) */}
        {isAdmin && (
          <section className="bg-neutral-900 text-white border-b border-neutral-800 py-6 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Editorial &amp; Moderation Desk
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Admin Session
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Manage community submissions before they are surfaced to the public.
                    </p>
                  </div>
                </div>

                {/* Desk Switcher */}
                <div className="flex items-center gap-2 bg-neutral-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setAdminTab('articles')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      adminTab === 'articles'
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Blog Articles</span>
                    {pendingArticles.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                        {pendingArticles.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setAdminTab('reviews')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      adminTab === 'reviews'
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>User Reviews</span>
                    {pendingReviews.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                        {pendingReviews.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Submissions Panel Body */}
              {adminTab === 'articles' ? (
                <div>
                  {pendingArticles.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400">
                      ✨ No pending blog submissions waiting for review.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingArticles.map((art) => (
                        <div
                          key={art.id}
                          className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-700 text-neutral-300 font-mono">
                                {art.category}
                              </span>
                              <span className="text-xs text-neutral-400">{art.date}</span>
                              <span className="text-neutral-500">•</span>
                              <span className="text-xs text-neutral-300 font-medium">
                                By {art.author.name} ({art.author.role})
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white truncate">{art.title}</h4>
                            <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{art.excerpt}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setActiveArticle(art)}
                              className="px-3 py-1.5 rounded-xl border border-neutral-700 hover:bg-neutral-700 text-xs text-neutral-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => handleApproveArticle(art.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </button>
                            <button
                              onClick={() => handleRejectArticle(art.id)}
                              className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-1.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-neutral-700/60 transition-colors cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {pendingReviews.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400">
                      ✨ No pending community reviews waiting for moderation.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex text-amber-400">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-white">{rev.name}</span>
                              <span className="text-neutral-500">•</span>
                              <span className="text-xs text-neutral-400">{rev.role}</span>
                              <span className="text-neutral-500">•</span>
                              <span className="text-xs text-neutral-500">{rev.date}</span>
                            </div>
                            <p className="text-xs text-neutral-300 italic">&ldquo;{rev.content}&rdquo;</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveReview(rev.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectReview(rev.id)}
                              className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-neutral-700/60 transition-colors cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
