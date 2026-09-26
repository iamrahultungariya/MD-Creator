import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface PublishOptions {
  slug?: string;
  password?: string;
  allowCopyMarkdown?: boolean;
  showReadingStats?: boolean;
  theme?: string;
}

export interface PublishedRecord {
  id: string;
  document_id: string;
  user_id: string;
  slug: string;
  is_public: boolean;
  password_hash: string | null;
  view_count: number;
  published_at: string;
  updated_at: string;
}

export interface PublicDocumentView {
  slug: string;
  title: string;
  content: string;
  authorName?: string;
  publishedAt: string;
  updatedAt: string;
  viewCount: number;
  isPasswordProtected: boolean;
  allowCopyMarkdown: boolean;
  showReadingStats: boolean;
  theme: string;
}

/**
 * Computes SHA-256 hex string for client-side password hashing
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password.trim());
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a clean URL slug from title + random token
 */
export function generateSlug(title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/\.md$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

  const randToken = Math.random().toString(36).substring(2, 8);
  return cleanTitle ? `${cleanTitle}-${randToken}` : `doc-${randToken}`;
}

/**
 * Fetches current publication status for a given document
 */
export async function getDocumentPublishStatus(docId: string): Promise<PublishedRecord | null> {
  if (!supabase) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('published_documents')
      .select('*')
      .eq('document_id', docId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error || !data) return null;
    return data as PublishedRecord;
  } catch {
    return null;
  }
}

/**
 * Publishes or updates a document to the web
 */
export async function publishDocument(
  docId: string,
  title: string,
  content: string,
  options: PublishOptions = {}
): Promise<{ success: boolean; slug: string; url: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: false,
      slug: '',
      url: '',
      error: 'Supabase is not configured. Cloud publishing requires an active Supabase project.',
    };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return {
        success: false,
        slug: '',
        url: '',
        error: 'Please sign in or create a free account to publish documents to the web.',
      };
    }

    const userId = session.user.id;

    // 1. Ensure the parent document exists in Supabase documents table
    await supabase.from('documents').upsert({
      id: docId,
      user_id: userId,
      title: title.trim() || 'Untitled Document',
      is_pinned: false,
      tags: ['Published'],
      updated_at: new Date().toISOString(),
    });

    // 2. Ensure the document content exists in Supabase document_contents table
    await supabase.from('document_contents').upsert({
      id: docId,
      content,
      updated_at: new Date().toISOString(),
    });

    // 3. Resolve slug
    let targetSlug = (options.slug || '').trim().toLowerCase();
    if (!targetSlug) {
      targetSlug = generateSlug(title);
    } else {
      // Clean custom slug
      targetSlug = targetSlug.replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    }

    // 4. Compute password hash if provided
    let passwordHash: string | null = null;
    if (options.password && options.password.trim()) {
      passwordHash = await hashPassword(options.password);
    }

    // 5. Upsert published document record
    const { error: pubError } = await supabase.from('published_documents').upsert(
      {
        document_id: docId,
        user_id: userId,
        slug: targetSlug,
        is_public: true,
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (pubError) {
      return { success: false, slug: '', url: '', error: pubError.message };
    }

    const publicUrl = `${window.location.origin}/p/${targetSlug}`;
    return { success: true, slug: targetSlug, url: publicUrl };
  } catch (err: any) {
    return { success: false, slug: '', url: '', error: err?.message || 'Failed to publish document.' };
  }
}

/**
 * Unpublishes a document (makes it private/revoked)
 */
export async function unpublishDocument(docId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { error } = await supabase
      .from('published_documents')
      .update({ is_public: false, updated_at: new Date().toISOString() })
      .eq('document_id', docId)
      .eq('user_id', session.user.id);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetches a public document by its slug for unauthenticated public viewers
 */
export async function getPublicDocumentBySlug(
  slug: string,
  providedPassword?: string
): Promise<{ doc: PublicDocumentView | null; status: 'ok' | 'not_found' | 'password_required' | 'invalid_password' }> {
  if (!supabase) {
    return { doc: null, status: 'not_found' };
  }

  try {
    // 1. Query published document record
    const { data: pubRecord, error } = await supabase
      .from('published_documents')
      .select('id, document_id, user_id, slug, is_public, password_hash, view_count, published_at, updated_at')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle();

    if (error || !pubRecord) {
      return { doc: null, status: 'not_found' };
    }

    // 2. Check password protection
    if (pubRecord.password_hash) {
      if (!providedPassword) {
        return { doc: null, status: 'password_required' };
      }
      const hashedProvided = await hashPassword(providedPassword);
      if (hashedProvided !== pubRecord.password_hash) {
        return { doc: null, status: 'invalid_password' };
      }
    }

    // 3. Fetch title and content
    const [docRes, contentRes] = await Promise.all([
      supabase.from('documents').select('title').eq('id', pubRecord.document_id).maybeSingle(),
      supabase.from('document_contents').select('content').eq('id', pubRecord.document_id).maybeSingle(),
    ]);

    const title = docRes.data?.title || 'Published Document';
    const content = contentRes.data?.content || '';

    // Asynchronously increment view count without blocking
    Promise.resolve(
      supabase
        .from('published_documents')
        .update({ view_count: (pubRecord.view_count || 0) + 1 })
        .eq('id', pubRecord.id)
    ).catch(console.warn);

    return {
      status: 'ok',
      doc: {
        slug: pubRecord.slug,
        title,
        content,
        publishedAt: pubRecord.published_at,
        updatedAt: pubRecord.updated_at,
        viewCount: (pubRecord.view_count || 0) + 1,
        isPasswordProtected: Boolean(pubRecord.password_hash),
        allowCopyMarkdown: true,
        showReadingStats: true,
        theme: 'default',
      },
    };
  } catch (err) {
    console.error('Failed to fetch public document:', err);
    return { doc: null, status: 'not_found' };
  }
}
