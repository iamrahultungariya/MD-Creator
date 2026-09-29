import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  AdminStats,
  Article,
  UserReview,
  FeedbackItem,
  FeedbackStatus,
} from '../types/admin';
import { BlogCategory } from '../data/blogArticles';

export const isUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

interface UseAdminDataProps {
  isAdmin: boolean;
  userId?: string | null;
  userDisplayName?: string | null;
  showToast: (msg: string) => void;
}

export function useAdminData({
  isAdmin,
  userId,
  userDisplayName,
  showToast,
}: UseAdminDataProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
            .order('created_at', { ascending: false }),
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
          setArticles(dbArticles);
        } else {
          setArticles([]);
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
      console.warn('[AdminData] Error loading data from Supabase:', err);
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
    const criticalFeedback = feedbacks.filter(
      (f) => f.priority === 'critical' && f.status !== 'resolved'
    ).length;

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
    if (supabase && isUuid(articleId)) {
      const { error: rpcError } = await supabase.rpc('admin_approve_blog', {
        p_article_id: articleId,
      });

      if (rpcError) {
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
    if (supabase && isUuid(articleId)) {
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

    if (supabase && isUuid(articleId)) {
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
    showToast('🗑️ Blog article deleted.');
  };

  const handleToggleFeaturedBlog = async (articleId: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    if (supabase && isUuid(articleId)) {
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
    if (supabase && isUuid(reviewId)) {
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
    if (supabase && isUuid(reviewId)) {
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

    if (supabase && isUuid(reviewId)) {
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
    if (supabase && isUuid(reviewId)) {
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
    if (supabase && isUuid(id)) {
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

    if (supabase && isUuid(id)) {
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

  // Create Blog Article Direct
  const handleCreateBlogDirect = async (
    title: string,
    content: string,
    excerpt: string,
    category: BlogCategory,
    authorName: string,
    authorRole: string
  ): Promise<boolean> => {
    if (!title.trim() || !content.trim()) {
      return false;
    }

    const wordCount = content.trim().split(/\s+/).length;
    const calculatedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
    const targetSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 36) +
      '-' +
      Math.random().toString(36).substring(2, 6);

    const payload = {
      user_id: userId || null,
      title: title.trim(),
      slug: targetSlug,
      excerpt: excerpt.trim() || content.trim().slice(0, 140) + '...',
      category,
      content,
      author_name: authorName.trim() || userDisplayName || 'Editorial Admin',
      author_role: authorRole.trim() || 'Editor',
      author_avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        authorName.trim() || userDisplayName || 'Editor'
      )}`,
      read_time: calculatedReadTime,
      featured: false,
      status: 'published',
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('blog_articles')
        .insert([payload])
        .select()
        .single();

      if (error) {
        showToast(`Failed to save: ${error.message}`);
        return false;
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

    showToast('✨ New blog article published live to website!');
    return true;
  };

  return {
    articles,
    reviews,
    feedbacks,
    stats,
    isRefreshing,
    loadAdminData,
    handleApproveBlog,
    handleRejectBlog,
    handleDeleteBlog,
    handleToggleFeaturedBlog,
    handleApproveReview,
    handleRejectReview,
    handleDeleteReview,
    handleToggleVerifiedReview,
    handleUpdateFeedbackStatus,
    handleDeleteFeedback,
    handleCreateBlogDirect,
  };
}
