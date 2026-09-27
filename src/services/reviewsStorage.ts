export interface UserReview {
  id: string;
  name: string;
  role: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
}

export const REVIEWS_STORAGE_KEY = 'md_writer_community_reviews';
export const USER_REVIEW_KEY = 'md_writer_user_submitted_review';

export const getStoredReviews = (): UserReview[] => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback
  }
  return [];
};

export const saveStoredReviews = (reviews: UserReview[]): void => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // Ignore quota errors
  }
};

export const getUserSubmittedReview = (): UserReview | null => {
  try {
    const raw = localStorage.getItem(USER_REVIEW_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return null;
};

export const saveUserSubmittedReview = (review: UserReview | null): void => {
  try {
    if (review) {
      localStorage.setItem(USER_REVIEW_KEY, JSON.stringify(review));
    } else {
      localStorage.removeItem(USER_REVIEW_KEY);
    }
  } catch {
    // Ignore
  }
};
