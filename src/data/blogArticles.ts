export type BlogCategory = 'Engineering' | 'Productivity' | 'Guides' | 'Architecture' | 'Design';

export interface Article {
  id: string;
  user_id?: string | null;
  title: string;
  slug?: string;
  excerpt: string;
  category: BlogCategory;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featured?: boolean;
  content: string;
  isUserCreated?: boolean;
  status: 'pending' | 'published' | 'rejected';
  submittedAt?: string;
  userEmail?: string;
}

export const DEFAULT_ARTICLES: Article[] = [];

export const CATEGORIES: ('All' | BlogCategory)[] = [
  'All',
  'Engineering',
  'Productivity',
  'Guides',
  'Architecture',
  'Design'
];
