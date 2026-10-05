import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { isCurrentUserAdmin } from '../utils/adminAuth';
import { AdminTab, Article } from '../types/admin';
import { BlogCategory } from '../data/blogArticles';
import { AdminHeader } from '../components/admin/AdminHeader';
import { useAdminData } from '../hooks/useAdminData';

const AdminOverviewTab = React.lazy(() =>
  import('../components/admin/AdminOverviewTab').then((m) => ({ default: m.AdminOverviewTab }))
);
const AdminBlogsTab = React.lazy(() =>
  import('../components/admin/AdminBlogsTab').then((m) => ({ default: m.AdminBlogsTab }))
);
const AdminReviewsTab = React.lazy(() =>
  import('../components/admin/AdminReviewsTab').then((m) => ({ default: m.AdminReviewsTab }))
);
const AdminFeedbackTab = React.lazy(() =>
  import('../components/admin/AdminFeedbackTab').then((m) => ({ default: m.AdminFeedbackTab }))
);
const BlogReaderModal = React.lazy(() =>
  import('../components/blog/BlogReaderModal').then((m) => ({ default: m.BlogReaderModal }))
);
const BlogCreateModal = React.lazy(() =>
  import('../components/blog/BlogCreateModal').then((m) => ({ default: m.BlogCreateModal }))
);
const AdminAccessDenied = React.lazy(() =>
  import('../components/admin/AdminAccessDenied').then((m) => ({ default: m.AdminAccessDenied }))
);

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

  // Moderate & Telemetry Data
  const {
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
  } = useAdminData({
    isAdmin,
    userId: user?.id,
    userDisplayName: user?.displayName,
    showToast,
  });

  const onSubmitCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('Please provide both title and content.');
      return;
    }

    const success = await handleCreateBlogDirect(
      newTitle,
      newContent,
      newExcerpt,
      newCategory,
      newAuthorName,
      newAuthorRole
    );

    if (success) {
      setNewTitle('');
      setNewExcerpt('');
      setNewContent('');
      setFormError('');
      setIsCreateModalOpen(false);
    }
  };

  // If unauthorized, show Access Denied
  if (!isAdmin) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">Verifying permissions...</div>}>
        <AdminAccessDenied
          isChecking={isCheckingAuth}
          onEnableDevBypass={handleEnableDevBypass}
        />
      </React.Suspense>
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
      <React.Suspense fallback={<div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-neutral-500 font-mono text-xs">Loading studio dashboard...</div>}>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <AdminOverviewTab
              stats={stats}
              articles={articles}
              reviews={reviews}
              onNavigateTab={setActiveTab}
              onOpenCreateBlog={() => setIsCreateModalOpen(true)}
              onApproveBlog={handleApproveBlog}
              onApproveReview={handleApproveReview}
            />
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
                onDelete={async (id) => {
                  await handleDeleteBlog(id);
                  if (previewArticle?.id === id) setPreviewArticle(null);
                }}
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
            onSubmit={onSubmitCreateBlog}
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
      </React.Suspense>
    </div>
  );
};
