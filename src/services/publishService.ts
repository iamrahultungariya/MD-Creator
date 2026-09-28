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
  is_password_protected?: boolean;
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
 * Fetches current publication status for a given document (owner only)
 */
export async function getDocumentPublishStatus(docId: string): Promise<PublishedRecord | null> {
  if (!supabase) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('published_documents')
      .select('id, document_id, user_id, slug, is_public, view_count, published_at, updated_at')
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
 * Publishes or updates a document to the web.
 * Never stores client-side hashes; passwords are set via secure server-side RPC.
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

    // 4. Upsert published document record scoped to this user
    // Note: password_hash is NEVER handled or calculated client-side
    const { data: pubData, error: pubError } = await supabase.from('published_documents').upsert(
      {
        document_id: docId,
        user_id: userId,
        slug: targetSlug,
        is_public: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'document_id,user_id' }
    ).select('id').maybeSingle();

    if (pubError) {
      return { success: false, slug: '', url: '', error: pubError.message };
    }

    // 5. If password was specified, set it securely via server RPC
    const publishedId = pubData?.id;
    if (publishedId && options.password !== undefined) {
      const pwd = options.password.trim();
      const { error: pwdErr } = await supabase.rpc('set_publish_password', {
        p_published_id: publishedId,
        p_password: pwd || null,
      });
      if (pwdErr) {
        console.warn('Server set_publish_password RPC notice:', pwdErr.message);
      }
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
 * Fetches a public document by its slug for unauthenticated public viewers.
 * Strictly uses server-side RPC (get_published_document) with zero client-side password hash leakage.
 */
export async function getPublicDocumentBySlug(
  slug: string,
  providedPassword?: string
): Promise<{
  doc: PublicDocumentView | null;
  status: 'ok' | 'not_found' | 'password_required' | 'invalid_password' | 'rate_limited';
}> {
  if (!supabase) {
    return { doc: null, status: 'not_found' };
  }

  try {
    const cleanSlug = slug.trim().toLowerCase();

    // 1. Invoke server-side RPC to fetch document without exposing password hashes
    const { data, error } = await supabase.rpc('get_published_document', {
      p_slug: cleanSlug,
      p_password: providedPassword ? providedPassword.trim() : null,
    });

    if (error || !data) {
      return { doc: null, status: 'not_found' };
    }

    const status = data.status;

    if (status === 'not_found') {
      return { doc: null, status: 'not_found' };
    }

    if (status === 'password_required') {
      return { doc: null, status: 'password_required' };
    }

    if (status === 'wrong_password' || status === 'invalid_password') {
      return { doc: null, status: 'invalid_password' };
    }

    if (status === 'rate_limited') {
      return { doc: null, status: 'rate_limited' };
    }

    if (status === 'ok' && data.document) {
      const d = data.document;
      return {
        status: 'ok',
        doc: {
          slug: d.slug || cleanSlug,
          title: d.title || 'Published Document',
          content: d.content || '',
          authorName: d.author_name || d.authorName,
          publishedAt: d.published_at || d.publishedAt || new Date().toISOString(),
          updatedAt: d.updated_at || d.updatedAt || new Date().toISOString(),
          viewCount: d.view_count || d.viewCount || 1,
          isPasswordProtected: Boolean(d.is_password_protected ?? d.isPasswordProtected),
          allowCopyMarkdown: d.allow_copy_markdown ?? true,
          showReadingStats: d.show_reading_stats ?? true,
          theme: d.theme || 'default',
        },
      };
    }

    return { doc: null, status: 'not_found' };
  } catch (err) {
    console.error('Failed to fetch public document:', err);
    return { doc: null, status: 'not_found' };
  }
}
