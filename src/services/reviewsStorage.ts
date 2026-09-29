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

export const DEFAULT_COMMUNITY_REVIEWS: UserReview[] = [
  {
    id: 'seed-rev-1',
    name: 'Elena Rostova',
    role: 'Principal Systems Architect',
    rating: 5,
    date: 'Oct 24, 2026',
    content: 'The zero millisecond typing latency is genuinely uncompromised. Drafting complex technical architecture specs with KaTeX math and instant vector PDF export without leaving the keyboard is transformative.',
    verified: true,
    status: 'approved'
  },
  {
    id: 'seed-rev-2',
    name: 'Marcus Vance',
    role: 'Staff Infrastructure Engineer',
    rating: 5,
    date: 'Oct 21, 2026',
    content: 'Local-first IndexedDB persistence that never loses a single keystroke. Clean, uncluttered UI and lightning-fast slash commands make it my daily driver for engineering RFCs.',
    verified: true,
    status: 'approved'
  },
  {
    id: 'seed-rev-3',
    name: 'Sophia Chen',
    role: 'Technical Documentation Lead',
    rating: 5,
    date: 'Oct 18, 2026',
    content: 'MD Writer is pure craftsmanship. No distracting corporate bloat, just publication-ready typography, instant Mermaid diagrams, and robust markdown standards.',
    verified: true,
    status: 'approved'
  }
];

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
