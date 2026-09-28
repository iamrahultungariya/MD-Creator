import { Article } from '../data/blogArticles';
import { UserReview } from '../services/reviewsStorage';

export type AdminTab = 'overview' | 'blogs' | 'reviews' | 'feedback';

export type FeedbackCategory = 'bug' | 'feature' | 'praise' | 'question';
export type FeedbackSentiment = 'terrible' | 'bad' | 'okay' | 'good' | 'amazing';
export type FeedbackPriority = 'low' | 'normal' | 'high' | 'critical';
export type FeedbackStatus = 'new' | 'in_review' | 'resolved' | 'archived';

export interface FeedbackItem {
  id: string;
  user_id?: string | null;
  category: FeedbackCategory;
  sentiment: FeedbackSentiment;
  subject: string;
  message: string;
  user_name?: string | null;
  user_email?: string | null;
  priority: FeedbackPriority;
  willingness_to_pay?: string | null;
  paid_feature_request?: string | null;
  system_info?: {
    userAgent?: string;
    screenResolution?: string;
    appVersion?: string;
    language?: string;
    platform?: string;
    [key: string]: any;
  } | null;
  status: FeedbackStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AdminStats {
  totalBlogs: number;
  pendingBlogs: number;
  publishedBlogs: number;
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  totalFeedback: number;
  newFeedback: number;
  criticalFeedback: number;
}

export interface AdminFilterState {
  searchQuery: string;
  statusFilter: string;
  categoryFilter?: string;
  priorityFilter?: string;
}

export type { Article, UserReview };
