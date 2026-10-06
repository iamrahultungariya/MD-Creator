import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db, DocumentMetadata } from '../db';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are provided and not placeholders
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Checks if an email is registered.
 * @deprecated Removed to prevent email enumeration attacks.
 * Supabase Auth validates duplicates securely during signUp.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkEmailExists(_email: string): Promise<boolean> {
  return false;
}

/**
 * Timeout wrapper preventing hanging network calls on paused/unreachable Supabase.
 */
function withTimeout<T>(promise: Promise<T>, ms = 3500, fallback: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

let cachedSessionUserId: string | null = null;
let lastSessionCheckTime = 0;

/**
 * Returns true if the user is authenticated and can sync to cloud.
 * In MD Writer's 100% free model, all authenticated users have full cloud sync.
 */
export async function isUserProForSync(): Promise<boolean> {
  if (!supabase) return false;
  // Cache user ID for 30 seconds to prevent redundant network calls
  if (Date.now() - lastSessionCheckTime < 30000 && cachedSessionUserId !== null) {
    return Boolean(cachedSessionUserId);
  }
  return withTimeout(
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        cachedSessionUserId = session?.user?.id || null;
        lastSessionCheckTime = Date.now();
        return Boolean(session?.user);
      } catch {
        return false;
      }
    })(),
    2000,
    false
  );
}

/**
 * Pushes document metadata and full content to Supabase in the background.
 * Protected with a 3.5s timeout so it never hangs or delays app response.
 */
export async function syncDocumentToSupabase(doc: DocumentMetadata, content: string): Promise<boolean> {
  if (!supabase) return false;

  return withTimeout(
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        if (!userId) return false;

        // 1. Upsert document metadata with user_id
        const { error: metaError } = await supabase.from('documents').upsert({
          id: doc.id,
          user_id: userId,
          title: doc.title,
          snippet: doc.snippet,
          tags: doc.tags || [],
          is_pinned: doc.isPinned || false,
          is_favorite: doc.isFavorite || false,
          word_count: doc.wordCount || 0,
          size_bytes: doc.sizeBytes || 0,
          updated_at: new Date(doc.updatedAt).toISOString()
        });

        if (metaError) {
          console.warn('[Supabase Sync] Metadata error:', metaError.message);
          return false;
        }

        // 2. Upsert document full content
        const { error: contentError } = await supabase.from('document_contents').upsert({
          id: doc.id,
          content,
          updated_at: new Date(doc.updatedAt).toISOString()
        });

        if (contentError) {
          console.warn('[Supabase Sync] Content error:', contentError.message);
          return false;
        }

        return true;
      } catch (err) {
        console.warn('[Supabase Sync] Failed to sync:', err);
        return false;
      }
    })(),
    3500,
    false
  );
}

let lastPullTimestamp = 0;

/**
 * Pulls all documents belonging to the authenticated user from Supabase into Dexie.
 * Throttled to at most once per 60s, protected by 3.5s timeout and parallelized.
 */
export async function pullCloudDocuments(): Promise<number> {
  if (!supabase) return 0;
  // Throttle cloud pulls so rapid navigation doesn't trigger redundant network waterfalls
  if (Date.now() - lastPullTimestamp < 60000) {
    return 0;
  }
  lastPullTimestamp = Date.now();

  return withTimeout(
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return 0;

        const { data: cloudDocs, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false });

        if (docError || !cloudDocs || cloudDocs.length === 0) {
          return 0;
        }

        // Find which documents actually need content fetching
        const pendingDocs: typeof cloudDocs = [];
        for (const cloudDoc of cloudDocs) {
          const localDoc = await db.documents.get(cloudDoc.id);
          const cloudUpdated = new Date(cloudDoc.updated_at).getTime();
          if (!localDoc || cloudUpdated > localDoc.updatedAt) {
            pendingDocs.push(cloudDoc);
          }
        }

        if (pendingDocs.length === 0) return 0;

        // Fetch contents in parallel batches of up to 5 concurrent queries
        let pulledCount = 0;
        const BATCH_SIZE = 5;
        for (let i = 0; i < pendingDocs.length; i += BATCH_SIZE) {
          const batch = pendingDocs.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(
            batch.map(async (cloudDoc) => {
              const { data: contentData } = await supabase!
                .from('document_contents')
                .select('content')
                .eq('id', cloudDoc.id)
                .maybeSingle();

              const content = contentData?.content || '';
              const cloudUpdated = new Date(cloudDoc.updated_at).getTime();

              await db.documents.put({
                id: cloudDoc.id,
                title: cloudDoc.title,
                snippet: cloudDoc.snippet || '',
                tags: cloudDoc.tags || [],
                createdAt: new Date(cloudDoc.created_at).getTime(),
                updatedAt: cloudUpdated,
                lastOpenedAt: cloudDoc.last_opened_at ? new Date(cloudDoc.last_opened_at).getTime() : Date.now(),
                openCount: 1,
                isPinned: cloudDoc.is_pinned || false,
                isFavorite: cloudDoc.is_favorite || false,
                wordCount: cloudDoc.word_count || 0,
                sizeBytes: cloudDoc.size_bytes || 0
              });

              await db.document_cache.put({
                id: cloudDoc.id,
                content,
                cachedAt: Date.now()
              });

              pulledCount++;
            })
          );
        }

        return pulledCount;
      } catch (err) {
        console.warn('[Supabase Pull] Failed to pull documents:', err);
        return 0;
      }
    })(),
    4000,
    0
  );
}

let lastSyncAllTimestamp = 0;

/**
 * Performs bi-directional synchronization between Dexie (IndexedDB) and Supabase Cloud.
 * Throttled to once every 2 minutes, non-blocking and batched.
 */
export async function syncAllDocuments(): Promise<{ pulled: number; pushed: number }> {
  if (!supabase) return { pulled: 0, pushed: 0 };
  if (Date.now() - lastSyncAllTimestamp < 120000) {
    return { pulled: 0, pushed: 0 };
  }
  lastSyncAllTimestamp = Date.now();

  try {
    const isPro = await isUserProForSync();
    if (!isPro) return { pulled: 0, pushed: 0 };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { pulled: 0, pushed: 0 };

    // 1. Pull latest cloud documents first
    const pulled = await pullCloudDocuments();

    // 2. Push any local documents that don't exist in cloud or are newer (in parallel batches)
    const localDocs = await db.documents.toArray();
    const docsToSync = localDocs.filter(
      (d) => !(d.id === 'doc-getting-started' && d.tags?.includes('Guide'))
    );

    let pushed = 0;
    const BATCH_SIZE = 4;
    for (let i = 0; i < docsToSync.length; i += BATCH_SIZE) {
      const batch = docsToSync.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (localDoc) => {
          const cached = await db.document_cache.get(localDoc.id);
          const content = cached?.content || '';
          const synced = await syncDocumentToSupabase(localDoc, content);
          if (synced) pushed++;
        })
      );
    }

    return { pulled, pushed };
  } catch (err) {
    console.warn('[Supabase SyncAll] Sync failed:', err);
    return { pulled: 0, pushed: 0 };
  }
}

/**
 * Pulls a document from Supabase if missing locally.
 */
export async function fetchDocumentFromSupabase(id: string): Promise<{ meta: DocumentMetadata; content: string } | null> {
  if (!supabase) return null;

  try {
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !docData) return null;

    const { data: contentData } = await supabase
      .from('document_contents')
      .select('content')
      .eq('id', id)
      .single();

    const meta: DocumentMetadata = {
      id: docData.id,
      title: docData.title,
      snippet: docData.snippet || '',
      tags: docData.tags || [],
      createdAt: new Date(docData.created_at).getTime(),
      updatedAt: new Date(docData.updated_at).getTime(),
      lastOpenedAt: Date.now(),
      openCount: 1,
      isPinned: docData.is_pinned || false,
      isFavorite: docData.is_favorite || false,
      wordCount: docData.word_count || 0,
      sizeBytes: docData.size_bytes || 0
    };

    return {
      meta,
      content: contentData?.content || ''
    };
  } catch (err) {
    console.warn('[Supabase Fetch] Error:', err);
    return null;
  }
}

/**
 * Permanently deletes a document and its content from Supabase Cloud.
 */
export async function deleteDocumentFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const isPro = await isUserProForSync();
    if (!isPro) return false;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    // 1. Delete content from document_contents
    const { error: contentError } = await supabase
      .from('document_contents')
      .delete()
      .eq('id', id);

    if (contentError) {
      console.warn('[Supabase Delete] Content deletion warning:', contentError.message);
    }

    // 2. Delete metadata from documents (RLS checks user_id)
    const { error: metaError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (metaError) {
      console.warn('[Supabase Delete] Metadata deletion error:', metaError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[Supabase Delete] Failed to delete document:', err);
    return false;
  }
}
