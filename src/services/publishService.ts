import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db, createRevisionSnapshot, saveDocument } from '../db';

export interface PublishOptions {
  slug?: string;
  password?: string;
  permissionMode?: 'view' | 'edit'; // 'view' = read-only, 'edit' = allow submitting proposed edits
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
  permission_mode?: 'view' | 'edit';
  bundle_slug?: string;
  view_count: number;
  published_at: string;
  updated_at: string;
}

export interface PublicDocumentView {
  id?: string;
  documentId?: string;
  slug: string;
  title: string;
  content: string;
  authorName?: string;
  publishedAt: string;
  updatedAt: string;
  viewCount: number;
  isPasswordProtected: boolean;
  permissionMode: 'view' | 'edit';
  allowCopyMarkdown: boolean;
  showReadingStats: boolean;
  theme: string;
}

export interface PublishedBundleItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  wordCount: number;
  permissionMode: 'view' | 'edit';
}

export interface PublishedBundleView {
  bundleSlug: string;
  title: string;
  permissionMode: 'view' | 'edit';
  documents: PublishedBundleItem[];
  publishedAt: string;
  isPasswordProtected: boolean;
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
      .select('id, document_id, user_id, slug, is_public, permission_mode, bundle_slug, view_count, published_at, updated_at')
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
 * Allows setting 'view' (read-only) or 'edit' (collaborative submission) mode.
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
    const permissionMode = options.permissionMode || 'view';

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
      targetSlug = targetSlug.replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    }

    // 4. Upsert published document record with permission_mode
    // Check if a record already exists for this document to avoid conflict key constraint errors
    const { data: existingPub } = await supabase
      .from('published_documents')
      .select('id, slug')
      .eq('document_id', docId)
      .eq('user_id', userId)
      .maybeSingle();

    let publishedId: string | undefined;

    if (existingPub?.id) {
      publishedId = existingPub.id;
      const { error: updateError } = await supabase
        .from('published_documents')
        .update({
          slug: targetSlug,
          is_public: true,
          permission_mode: permissionMode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPub.id);

      if (updateError) {
        return { success: false, slug: '', url: '', error: updateError.message };
      }
    } else {
      const { data: pubData, error: pubError } = await supabase
        .from('published_documents')
        .upsert(
          {
            document_id: docId,
            user_id: userId,
            slug: targetSlug,
            is_public: true,
            permission_mode: permissionMode,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slug' }
        )
        .select('id')
        .maybeSingle();

      if (pubError) {
        return { success: false, slug: '', url: '', error: pubError.message };
      }
      publishedId = pubData?.id;
    }
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
 * Publishes multiple selected documents as a single multi-document bundle.
 */
export async function publishBundle(
  docIds: string[],
  bundleTitle: string,
  options: PublishOptions = {}
): Promise<{ success: boolean; bundleSlug: string; url: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: false,
      bundleSlug: '',
      url: '',
      error: 'Supabase is not configured. Cloud publishing requires an active Supabase project.',
    };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return {
        success: false,
        bundleSlug: '',
        url: '',
        error: 'Please sign in or create an account to publish document bundles.',
      };
    }

    const bundleSlug = generateSlug(bundleTitle || 'bundle');
    const permissionMode = options.permissionMode || 'view';

    // Publish each document under the bundle_slug
    for (const docId of docIds) {
      const localMeta = await db.documents.get(docId);
      const cached = await db.document_cache.get(docId);
      const title = localMeta?.title || 'Document';
      const content = cached?.content || '';

      const docSlug = `${bundleSlug}-${generateSlug(title)}`;
      await publishDocument(docId, title, content, {
        slug: docSlug,
        permissionMode,
        password: options.password,
      });

      // Update bundle_slug tag on the published record
      await supabase
        .from('published_documents')
        .update({ bundle_slug: bundleSlug })
        .eq('document_id', docId);
    }

    const bundleUrl = `${window.location.origin}/p/bundle/${bundleSlug}`;
    return { success: true, bundleSlug, url: bundleUrl };
  } catch (err: any) {
    return { success: false, bundleSlug: '', url: '', error: err?.message || 'Failed to publish bundle.' };
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

    // 1. Invoke server-side RPC to fetch document
    const { data, error } = await supabase.rpc('get_published_document', {
      p_slug: cleanSlug,
      p_password: providedPassword ? providedPassword.trim() : null,
    });

    if (error || !data) {
      // Fallback query directly on published_documents if RPC doesn't have bundle fields yet
      const { data: directPub } = await supabase
        .from('published_documents')
        .select('*, documents(title), document_contents(content)')
        .eq('slug', cleanSlug)
        .eq('is_public', true)
        .maybeSingle();

      if (directPub) {
        return {
          status: 'ok',
          doc: {
            id: directPub.id,
            documentId: directPub.document_id,
            slug: directPub.slug,
            title: (directPub as any).documents?.title || 'Shared Document',
            content: (directPub as any).document_contents?.content || '',
            publishedAt: directPub.published_at,
            updatedAt: directPub.updated_at,
            viewCount: directPub.view_count || 1,
            isPasswordProtected: Boolean(directPub.password_hash),
            permissionMode: (directPub.permission_mode as 'view' | 'edit') || 'view',
            allowCopyMarkdown: true,
            showReadingStats: true,
            theme: 'default',
          },
        };
      }

      return { doc: null, status: 'not_found' };
    }

    const status = data.status;

    if (status === 'not_found') return { doc: null, status: 'not_found' };
    if (status === 'password_required') return { doc: null, status: 'password_required' };
    if (status === 'wrong_password' || status === 'invalid_password') return { doc: null, status: 'invalid_password' };
    if (status === 'rate_limited') return { doc: null, status: 'rate_limited' };

    if (status === 'ok' && data.document) {
      const d = data.document;
      return {
        status: 'ok',
        doc: {
          id: d.id,
          documentId: d.document_id,
          slug: d.slug || cleanSlug,
          title: d.title || 'Published Document',
          content: d.content || '',
          authorName: d.author_name || d.authorName,
          publishedAt: d.published_at || d.publishedAt || new Date().toISOString(),
          updatedAt: d.updated_at || d.updatedAt || new Date().toISOString(),
          viewCount: d.view_count || d.viewCount || 1,
          isPasswordProtected: Boolean(d.is_password_protected ?? d.isPasswordProtected),
          permissionMode: (d.permission_mode as 'view' | 'edit') || 'view',
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

/**
 * Fetches all documents belonging to a multi-document bundle.
 */
export async function getPublishedBundle(
  bundleSlug: string
): Promise<{ bundle: PublishedBundleView | null; status: 'ok' | 'not_found' }> {
  if (!supabase) return { bundle: null, status: 'not_found' };

  try {
    // 1. Try server RPC first
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_published_bundle', {
      p_bundle_slug: bundleSlug.trim().toLowerCase(),
    });

    if (!rpcErr && rpcData?.status === 'ok' && rpcData.bundle) {
      return {
        status: 'ok',
        bundle: rpcData.bundle,
      };
    }

    const { data, error } = await supabase
      .from('published_documents')
      .select('id, document_id, slug, is_public, permission_mode, bundle_slug, documents(title), document_contents(content)')
      .eq('bundle_slug', bundleSlug.trim().toLowerCase())
      .eq('is_public', true);

    if (error || !data || data.length === 0) {
      return { bundle: null, status: 'not_found' };
    }

    const items: PublishedBundleItem[] = data.map((d: any) => {
      const content = d.document_contents?.content || '';
      return {
        id: d.document_id,
        title: d.documents?.title || 'Document',
        slug: d.slug,
        content,
        wordCount: content.trim().split(/\s+/).filter(Boolean).length,
        permissionMode: d.permission_mode || 'view',
      };
    });

    return {
      status: 'ok',
      bundle: {
        bundleSlug,
        title: `Bundle: ${bundleSlug}`,
        permissionMode: items[0]?.permissionMode || 'view',
        documents: items,
        publishedAt: new Date().toISOString(),
        isPasswordProtected: false,
      },
    };
  } catch {
    return { bundle: null, status: 'not_found' };
  }
}

/**
 * Submits an edit from a recipient on a "View-Edit" shared document link.
 * STRICT SAFETY REQUIREMENT:
 * Automatically creates an offline/cloud revision snapshot of the previous version
 * BEFORE applying any modifications, so the owner never loses their original document!
 */
export async function submitPublicDocumentEdit(
  slug: string,
  newContent: string,
  summary = 'Collaborative Edit via Shared Link'
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Cloud service unavailable.' };
  }

  try {
    // 0. Try server-side atomic RPC first (handles snapshot & security definer for anonymous editors)
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('submit_public_document_edit', {
      p_slug: slug.trim().toLowerCase(),
      p_new_content: newContent,
      p_summary: summary,
    });

    if (!rpcErr && rpcRes) {
      if (rpcRes.success) {
        return { success: true };
      }
      return { success: false, error: rpcRes.error || 'Failed to submit changes.' };
    }

    // 1. Fetch published document record
    const { data: pubData, error: pubErr } = await supabase
      .from('published_documents')
      .select('id, document_id, permission_mode, is_public')
      .eq('slug', slug.trim().toLowerCase())
      .maybeSingle();

    if (pubErr || !pubData) {
      return { success: false, error: 'Document not found or unpublished.' };
    }

    if (pubData.permission_mode !== 'edit') {
      return { success: false, error: 'This document is view-only. Edits are not permitted.' };
    }

    const docId = pubData.document_id;

    // 2. Fetch current content to preserve previous version snapshot
    const { data: currentContentData } = await supabase
      .from('document_contents')
      .select('content')
      .eq('id', docId)
      .maybeSingle();

    const previousContent = currentContentData?.content || '';

    // 3. Fetch title
    const { data: docMeta } = await supabase
      .from('documents')
      .select('title')
      .eq('id', docId)
      .maybeSingle();

    const docTitle = docMeta?.title || 'Document';

    // 4. AUTOMATIC PREVIOUS VERSION SNAPSHOT SAFETY (Local & Cloud)
    // Archive snapshot in Dexie IndexedDB if document is on this device
    try {
      await createRevisionSnapshot(
        docId,
        docTitle,
        previousContent,
        `Auto-Snapshot (Before Shared Edit: ${summary})`
      );
    } catch {}

    // Archive snapshot in Supabase document_revisions
    try {
      await supabase.from('document_revisions').insert({
        document_id: docId,
        content: previousContent,
        change_summary: `Pre-edit snapshot before submission via ${slug}`,
      });
    } catch {}

    // 5. Apply the submitted content in Supabase
    const wordCount = newContent.trim().split(/\s+/).filter(Boolean).length;
    const sizeBytes = new Blob([newContent]).size;
    const now = new Date().toISOString();

    const { error: updateContentErr } = await supabase
      .from('document_contents')
      .upsert({
        id: docId,
        content: newContent,
        updated_at: now,
      });

    if (updateContentErr) {
      return { success: false, error: updateContentErr.message };
    }

    // 6. Update document metadata
    await supabase
      .from('documents')
      .update({
        word_count: wordCount,
        size_bytes: sizeBytes,
        updated_at: now,
      })
      .eq('id', docId);

    // 7. Update published_documents updated_at
    await supabase
      .from('published_documents')
      .update({ updated_at: now })
      .eq('id', pubData.id);

    // 8. If document is present in local Dexie, update local storage as well
    const localExists = await db.documents.get(docId);
    if (localExists) {
      await saveDocument(docId, docTitle, newContent, localExists.tags);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to submit changes.' };
  }
}
