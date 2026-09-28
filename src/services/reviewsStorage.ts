export interface UserReview {
  id: string;
  user_id?: string | null;
  name: string;
  role: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
}

export const USER_REVIEW_KEY = 'md_writer_user_submitted_review';

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
