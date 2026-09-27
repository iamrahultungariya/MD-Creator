export type BlogCategory = 'Engineering' | 'Productivity' | 'Guides' | 'Architecture' | 'Design';

export interface Article {
  id: string;
  title: string;
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

export const LOCAL_STORAGE_KEY = 'md_writer_community_blog_articles_v1';

export const getStoredArticles = (): Article[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load stored articles', e);
    return [];
  }
};

export const saveStoredArticles = (articles: Article[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn('Failed to save stored articles', e);
  }
};
