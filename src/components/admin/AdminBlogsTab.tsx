import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  RotateCcw
} from 'lucide-react';
import { Article, BlogCategory, CATEGORIES } from '../../data/blogArticles';

interface AdminBlogsTabProps {
  articles: Article[];
  onApprove: (articleId: string) => Promise<void>;
  onReject: (articleId: string) => Promise<void>;
  onDelete: (articleId: string) => Promise<void>;
  onToggleFeatured?: (articleId: string, currentFeatured: boolean) => Promise<void>;
  onPreview: (article: Article) => void;
  onOpenCreate?: () => void;
}

export const AdminBlogsTab: React.FC<AdminBlogsTabProps> = ({
  articles,
  onApprove,
  onReject,
  onDelete,
  onToggleFeatured,
  onPreview,
  onOpenCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'All' | BlogCategory>('All');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingCount = articles.filter((a) => a.status === 'pending').length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const rejectedCount = articles.filter((a) => a.status === 'rejected').length;

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || art.category === categoryFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        art.title.toLowerCase().includes(query) ||
        art.excerpt.toLowerCase().includes(query) ||
        art.author.name.toLowerCase().includes(query);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [articles, statusFilter, categoryFilter, searchQuery]);

  const handleAction = async (action: () => Promise<void>, id: string) => {
    try {
      setProcessingId(id);
      await action();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-neutral-900 border border-neutral-800">
        
        {/* Left: Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search articles by title, author, or excerpt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-amber-500/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Category and Create Action */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Write Blog</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'all'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          All Articles ({articles.length})
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
              : 'bg-neutral-900 text-amber-400 hover:text-amber-300 border border-neutral-800'
          }`}
        >
          <span>Pending Approval ({pendingCount})</span>
          {pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          )}
        </button>

        <button
          onClick={() => setStatusFilter('published')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'published'
              ? 'bg-emerald-500 text-neutral-950 font-bold shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Live Published ({publishedCount})
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
            statusFilter === 'rejected'
              ? 'bg-rose-500 text-white font-bold shadow-xs'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Articles Feed */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400">
          <BookOpen className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No articles found</h3>
          <p className="text-xs text-neutral-500">
            {statusFilter === 'pending'
              ? 'All blog submissions have been reviewed and published!'
              : 'No articles match your current search or category filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => {
            const isBusy = processingId === article.id;
            const isPending = article.status === 'pending';
            const isPublished = article.status === 'published';
            const isRejected = article.status === 'rejected';

            return (
              <div
                key={article.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isPending
                    ? 'bg-neutral-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Status Badge */}
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {isPublished && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Live on Website
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}

                      {/* Category Badge */}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-800 text-neutral-300 font-mono">
                        {article.category}
                      </span>

                      {/* Featured Indicator */}
                      {article.featured && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Featured Hero
                        </span>
                      )}

                      <span className="text-xs text-neutral-500">•</span>
                      <span className="text-xs text-neutral-400">{article.date}</span>
                      <span className="text-xs text-neutral-500">•</span>
                      <span className="text-xs text-neutral-400">{article.readTime}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>

                    {/* Author Meta */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-neutral-700"
                      />
                      <span className="text-xs font-semibold text-neutral-200">
                        {article.author.name}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        ({article.author.role})
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-800 shrink-0">
                    
                    {/* Preview Button */}
                    <button
                      onClick={() => onPreview(article)}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60"
                      title="Preview rendered markdown article"
                    >
                      <Eye className="w-4 h-4 text-neutral-400" />
                      <span>Preview</span>
                    </button>

                    {/* 1-Click Approve Button (If pending or rejected) */}
                    {!isPublished && (
                      <button
                        onClick={() => handleAction(() => onApprove(article.id), article.id)}
                        disabled={isBusy}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                        title="Approve article and make it live on the community blog immediately"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isBusy ? 'Publishing...' : 'Approve & Publish Live'}</span>
                      </button>
                    )}

                    {/* Reject Button (If pending) */}
                    {isPending && (
                      <button
                        onClick={() => handleAction(() => onReject(article.id), article.id)}
                        disabled={isBusy}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-neutral-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
                        title="Reject submission"
                      >
                        <X className="w-4 h-4 text-neutral-400 hover:text-rose-400" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Unpublish Button (If already published) */}
                    {isPublished && (
                      <button
                        onClick={() => handleAction(() => onReject(article.id), article.id)}
                        disabled={isBusy}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-amber-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
                        title="Unpublish from live blog"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Unpublish</span>
                      </button>
                    )}

                    {/* Toggle Featured */}
                    {onToggleFeatured && isPublished && (
                      <button
                        onClick={() => onToggleFeatured(article.id, Boolean(article.featured))}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          article.featured
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-neutral-800 text-neutral-400 hover:text-amber-400 border-neutral-700/60'
                        }`}
                        title={article.featured ? 'Remove from Featured' : 'Mark as Featured Hero'}
                      >
                        <Star className={`w-4 h-4 ${article.featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleAction(() => onDelete(article.id), article.id)}
                      disabled={isBusy}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer border border-neutral-700/60 disabled:opacity-50"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
