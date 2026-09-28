import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../lib/supabase';
import { isCurrentUserAdmin } from '../utils/adminAuth';
import { 
  AdminTab, 
  AdminStats, 
  FeedbackItem, 
  FeedbackStatus,
  Article, 
  UserReview 
} from '../types/admin';
import { BlogCategory, DEFAULT_ARTICLES } from '../data/blogArticles';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminStatsCards } from '../components/admin/AdminStatsCards';
import { AdminBlogsTab } from '../components/admin/AdminBlogsTab';
import { AdminReviewsTab } from '../components/admin/AdminReviewsTab';
import { AdminFeedbackTab } from '../components/admin/AdminFeedbackTab';
import { AdminAccessDenied } from '../components/admin/AdminAccessDenied';
import { BlogReaderModal } from '../components/blog/BlogReaderModal';
import { BlogCreateModal } from '../components/blog/BlogCreateModal';

const MarkdownPreview = React.lazy(() =>
  import('../components/editor/MarkdownPreview').then((m) => ({ default: m.MarkdownPreview }))
);

const DEV_BYPASS_KEY = 'md_writer_admin_dev_bypass';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();

  // Access State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isDevBypass, setIsDevBypass] = useState<boolean>(() => {
    return localStorage.getItem(DEV_BYPASS_KEY) === 'true';
  });

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [articles, setArticles] = useState<Article[]>(DEFAULT_ARTICLES);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorName, setNewAuthorName] = useState(user?.displayName || '');
  const [newAuthorRole, setNewAuthorRole] = useState('Editor');
  const [newCategory, setNewCategory] = useState<BlogCategory>('Engineering');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [formError, setFormError] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Authorize User
  useEffect(() => {
    let isMounted = true;
    const checkRole = async () => {
      setIsCheckingAuth(true);
      if (isDevBypass) {
        if (isMounted) {
          setIsAdmin(true);
          setIsCheckingAuth(false);
        }
        return;
      }

      if (!user?.id) {
        if (isMounted) {
          setIsAdmin(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const adminStatus = await isCurrentUserAdmin(user.id);
        if (isMounted) {
          setIsAdmin(adminStatus);
          setIsCheckingAuth(false);
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
          setIsCheckingAuth(false);
        }
      }
    };

    checkRole();
    return () => {
      isMounted = false;
    };
  }, [user?.id, isDevBypass]);

  const handleEnableDevBypass = () => {
    localStorage.setItem(DEV_BYPASS_KEY, 'true');
    setIsDevBypass(true);
    setIsAdmin(true);
    showToast('🔑 Dev-Mode Admin Session Activated');
  };

  const handleDisableDevBypass = () => {
    localStorage.removeItem(DEV_BYPASS_KEY);
    setIsDevBypass(false);
    if (user?.id) {
      isCurrentUserAdmin(user.id).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
    showToast('Dev-Mode Session Deactivated');
  };

  // Load All Admin Data (Blogs, Reviews, Feedbacks)
  const loadAdminData = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (supabase) {
        const [artRes, revRes, fbRes] = await Promise.all([
          supabase
            .from('blog_articles')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('community_reviews')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('feedbacks')
            .select('*')
            .order('created_at', { ascending: false })
        ]);

        if (artRes?.data && artRes.data.length > 0) {
          const dbArticles: Article[] = artRes.data.map((a: any) => ({
            id: a.id,
            user_id: a.user_id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt,
            category: a.category,
            readTime: a.read_time,
            date: new Date(a.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            author: {
              name: a.author_name,
              role: a.author_role,
              avatar:
                a.author_avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.author_name)}`,
            },
            content: a.content,
            featured: Boolean(a.featured),
            status: a.status,
            submittedAt: a.created_at,
          }));
          const dbIds = new Set(dbArticles.map((d) => d.id));
          setArticles([...dbArticles, ...DEFAULT_ARTICLES.filter((d) => !dbIds.has(d.id))]);
        } else {
          setArticles(DEFAULT_ARTICLES);
        }

        if (revRes?.data) {
          setReviews(
            revRes.data.map((r: any) => ({
              id: r.id,
              user_id: r.user_id,
              name: r.name,
              role: r.role,
              rating: r.rating,
              date: new Date(r.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              content: r.content,
              verified: Boolean(r.verified),
              status: r.status,
              submittedAt: r.created_at,
            }))
          );
        }

        if (fbRes?.data) {
          setFeedbacks(
            fbRes.data.map((f: any) => ({
              id: f.id,
              user_id: f.user_id,
              category: f.category,
              sentiment: f.sentiment,
              subject: f.subject,
              message: f.message,
              user_name: f.user_name,
              user_email: f.user_email,
              priority: f.priority,
              willingness_to_pay: f.willingness_to_pay,
              paid_feature_request: f.paid_feature_request,
              system_info: f.system_info,
              status: f.status,
              admin_notes: f.admin_notes,
              created_at: f.created_at,
            }))
          );
        }
      }
    } catch (err) {
      console.warn('[AdminPage] Error loading data from Supabase:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  // Derived Stats
  const stats: AdminStats = useMemo(() => {
    const pendingBlogs = articles.filter((a) => a.status === 'pending').length;
    const publishedBlogs = articles.filter((a) => a.status === 'published').length;
    const pendingReviews = reviews.filter((r) => r.status === 'pending').length;
    const approvedReviews = reviews.filter((r) => r.status === 'approved').length;
    const newFeedback = feedbacks.filter((f) => f.status === 'new').length;
    const criticalFeedback = feedbacks.filter((f) => f.priority === 'critical' && f.status !== 'resolved').length;

    return {
      totalBlogs: articles.length,
      pendingBlogs,
      publishedBlogs,
      totalReviews: reviews.length,
      pendingReviews,
      approvedReviews,
      totalFeedback: feedbacks.length,
      newFeedback,
      criticalFeedback,
    };
  }, [articles, reviews, feedbacks]);

  // Blog Moderation Handlers
  const handleApproveBlog = async (articleId: string) => {
    if (supabase) {
      // Try direct RPC first (SECURITY DEFINER, instant 1-click execution)
      const { error: rpcError } = await supabase.rpc('admin_approve_blog', {
        p_article_id: articleId,
      });

      if (rpcError) {
        // Fallback to direct table update
        const { error } = await supabase
          .from('blog_articles')
          .update({ status: 'published' })
          .eq('id', articleId);

        if (error) {
          showToast(`⚠️ Failed to approve blog: ${error.message}`);
          return;
        }
      }
    }

    setArticles((prev) =>
      prev.map((art) => (art.id === articleId ? { ...art, status: 'published' as const } : art))
    );
    showToast('✨ Blog article approved & published live to website!');
  };

  const handleRejectBlog = async (articleId: string) => {
    if (supabase) {
      const { error: rpcError } = await supabase.rpc('admin_reject_blog', {
        p_article_id: articleId,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('blog_articles')
          .update({ status: 'rejected' })
          .eq('id', articleId);

        if (error) {
          showToast(`⚠️ Failed to reject blog: ${error.message}`);
          return;
        }
      }
    }

    setArticles((prev) =>
      prev.map((art) => (art.id === articleId ? { ...art, status: 'rejected' as const } : art))
    );
    showToast('⚠️ Blog marked as rejected.');
  };

  const handleDeleteBlog = async (articleId: string) => {
    if (!window.confirm('Delete this article record permanently? This cannot be undone.')) {
      return;
    }

    if (supabase) {
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
    if (previewArticle?.id === articleId) setPreviewArticle(null);
    showToast('🗑️ Blog article deleted.');
  };

  const handleToggleFeaturedBlog = async (articleId: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    if (supabase) {
      const { error } = await supabase
        .from('blog_articles')
        .update({ featured: nextFeatured })
        .eq('id', articleId);

      if (error) {
        showToast(`⚠️ Error toggling featured: ${error.message}`);
        return;
      }
    }

    setArticles((prev) =>
      prev.map((art) => (art.id === articleId ? { ...art, featured: nextFeatured } : art))
    );
    showToast(nextFeatured ? '⭐ Marked as Featured Hero' : 'Removed from Featured');
  };

  // Review Moderation Handlers
  const handleApproveReview = async (reviewId: string) => {
    if (supabase) {
      const { error: rpcError } = await supabase.rpc('admin_approve_review', {
        p_review_id: reviewId,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('community_reviews')
          .update({ status: 'approved' })
          .eq('id', reviewId);

        if (error) {
          showToast(`⚠️ Failed to approve review: ${error.message}`);
          return;
        }
      }
    }

    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, status: 'approved' as const } : rev))
    );
    showToast('✅ Review approved for live homepage display!');
  };

  const handleRejectReview = async (reviewId: string) => {
    if (supabase) {
      const { error: rpcError } = await supabase.rpc('admin_reject_review', {
        p_review_id: reviewId,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('community_reviews')
          .update({ status: 'rejected' })
          .eq('id', reviewId);

        if (error) {
          showToast(`⚠️ Failed to reject review: ${error.message}`);
          return;
        }
      }
    }

    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, status: 'rejected' as const } : rev))
    );
    showToast('⚠️ Review marked as rejected.');
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this user review record permanently?')) {
      return;
    }

    if (supabase) {
      const { error } = await supabase
        .from('community_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        showToast(`⚠️ Failed to delete review: ${error.message}`);
        return;
      }
    }

    setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
    showToast('🗑️ Review deleted.');
  };

  const handleToggleVerifiedReview = async (reviewId: string, currentVerified: boolean) => {
    const nextVerified = !currentVerified;
    if (supabase) {
      const { error } = await supabase
        .from('community_reviews')
        .update({ verified: nextVerified })
        .eq('id', reviewId);

      if (error) {
        showToast(`⚠️ Error: ${error.message}`);
        return;
      }
    }

    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, verified: nextVerified } : rev))
    );
    showToast(nextVerified ? '🛡️ Marked as Verified Writer' : 'Unverified');
  };

  // Feedback Handlers
  const handleUpdateFeedbackStatus = async (id: string, newStatus: FeedbackStatus) => {
    if (supabase) {
      const { error: rpcError } = await supabase.rpc('admin_update_feedback_status', {
        p_feedback_id: id,
        p_status: newStatus,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('feedbacks')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          showToast(`⚠️ Error updating feedback: ${error.message}`);
          return;
        }
      }
    }

    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, status: newStatus } : fb))
    );
    showToast(`Feedback status updated to ${newStatus}`);
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Delete this feedback entry?')) {
      return;
    }

    if (supabase) {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', id);

      if (error) {
        showToast(`⚠️ Failed to delete feedback: ${error.message}`);
        return;
      }
    }

    setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
    showToast('🗑️ Feedback entry deleted.');
  };

  // Direct Admin Blog Creation Handler
  const handleCreateBlogDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('Please provide both title and content.');
      return;
    }

    const wordCount = newContent.trim().split(/\s+/).length;
    const calculatedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
    const targetSlug =
      newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 36) +
      '-' +
      Math.random().toString(36).substring(2, 6);

    const payload = {
      user_id: user?.id || null,
      title: newTitle.trim(),
      slug: targetSlug,
      excerpt: newExcerpt.trim() || newContent.trim().slice(0, 140) + '...',
      category: newCategory,
      content: newContent,
      author_name: newAuthorName.trim() || user?.displayName || 'Editorial Admin',
      author_role: newAuthorRole.trim() || 'Editor',
      author_avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        newAuthorName.trim() || user?.displayName || 'Editor'
      )}`,
      read_time: calculatedReadTime,
      featured: false,
      status: 'published', // Admin direct posts are published immediately!
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('blog_articles')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setFormError(`Failed to save: ${error.message}`);
        return;
      }

      if (data) {
        const newArt: Article = {
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          category: data.category,
          readTime: data.read_time,
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          author: {
            name: data.author_name,
            role: data.author_role,
            avatar: data.author_avatar,
          },
          content: data.content,
          featured: false,
          status: 'published',
        };
        setArticles((prev) => [newArt, ...prev]);
      }
    }

    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    setFormError('');
    setIsCreateModalOpen(false);
    showToast('✨ New blog article published live to website!');
  };

  // If unauthorized, show Access Denied
  if (!isAdmin) {
    return (
      <AdminAccessDenied
        isChecking={isCheckingAuth}
        onEnableDevBypass={handleEnableDevBypass}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white text-neutral-950 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 border border-neutral-200 animate-in fade-in slide-in-from-top-3 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <AdminHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        isRefreshing={isRefreshing}
        onRefresh={loadAdminData}
        isDevBypass={isDevBypass}
        onDisableDevBypass={handleDisableDevBypass}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight mb-1">
                Moderation Command Center
              </h2>
              <p className="text-xs text-neutral-400">
                Live telemetry and pending editorial queues across MD Writer community.
              </p>
            </div>

            <AdminStatsCards
              stats={stats}
              onNavigateTab={setActiveTab}
              onOpenCreateBlog={() => setIsCreateModalOpen(true)}
            />

            {/* Quick Activity Previews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              {/* Pending Articles Quick List */}
              <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Pending Blog Submissions</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('blogs')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    View All ({stats.pendingBlogs}) →
                  </button>
                </div>

                {articles.filter((a) => a.status === 'pending').slice(0, 3).length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">
                    ✨ No blog submissions waiting for review.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {articles
                      .filter((a) => a.status === 'pending')
                      .slice(0, 3)
                      .map((art) => (
                        <div
                          key={art.id}
                          className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{art.title}</h4>
                            <p className="text-[11px] text-neutral-400">
                              By {art.author.name} • {art.category}
                            </p>
                          </div>
                          <button
                            onClick={() => handleApproveBlog(art.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold cursor-pointer shrink-0"
                          >
                            Approve
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Pending Reviews Quick List */}
              <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Pending User Reviews</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    View All ({stats.pendingReviews}) →
                  </button>
                </div>

                {reviews.filter((r) => r.status === 'pending').slice(0, 3).length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">
                    ✨ No pending reviews waiting for moderation.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {reviews
                      .filter((r) => r.status === 'pending')
                      .slice(0, 3)
                      .map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">
                              {rev.name} ({rev.rating}★)
                            </h4>
                            <p className="text-[11px] text-neutral-400 line-clamp-1 italic">
                              "{rev.content}"
                            </p>
                          </div>
                          <button
                            onClick={() => handleApproveReview(rev.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold cursor-pointer shrink-0"
                          >
                            Approve
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Blogs Management */}
        {activeTab === 'blogs' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight mb-1">
                Blog Articles Moderation
              </h2>
              <p className="text-xs text-neutral-400">
                Review community submissions and approve them to make them live on the public website.
              </p>
            </div>

            <AdminBlogsTab
              articles={articles}
              onApprove={handleApproveBlog}
              onReject={handleRejectBlog}
              onDelete={handleDeleteBlog}
              onToggleFeatured={handleToggleFeaturedBlog}
              onPreview={(art) => setPreviewArticle(art)}
              onOpenCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Reviews Management */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight mb-1">
                Community Reviews Moderation
              </h2>
              <p className="text-xs text-neutral-400">
                Approve verified writer reviews to surface them in the homepage testimonials carousel.
              </p>
            </div>

            <AdminReviewsTab
              reviews={reviews}
              onApprove={handleApproveReview}
              onReject={handleRejectReview}
              onDelete={handleDeleteReview}
              onToggleVerified={handleToggleVerifiedReview}
            />
          </div>
        )}

        {/* Tab 4: Feedback & Bug Tracker */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight mb-1">
                User Feedback &amp; Bug Tracker
              </h2>
              <p className="text-xs text-neutral-400">
                Inspect bug reports, feature suggestions, willingness to pay, and device telemetry.
              </p>
            </div>

            <AdminFeedbackTab
              feedbacks={feedbacks}
              onUpdateStatus={handleUpdateFeedbackStatus}
              onDelete={handleDeleteFeedback}
            />
          </div>
        )}

      </main>

      {/* Reader Preview Modal */}
      {previewArticle && (
        <BlogReaderModal
          article={previewArticle}
          onClose={() => setPreviewArticle(null)}
          MarkdownPreview={MarkdownPreview}
        />
      )}

      {/* Blog Creation Modal */}
      {isCreateModalOpen && (
        <BlogCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateBlogDirect}
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
      )}
    </div>
  );
};
