import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db, DocumentMetadata, notifyDocumentStoreChanged, getPendingDeletions, queuePendingDeletion, removePendingDeletion } from '../db';
import {
  useCrossDeviceConflictStore,
  isTombstoneResolved,
  isDocumentLocalOnly,
  type RemoteDeletionConflict
} from '../stores/useCrossDeviceConflictStore';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

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

        // 1. Check if document metadata already exists in cloud
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id, updated_at')
          .eq('id', doc.id)
          .maybeSingle();

        const targetUpdatedAt = new Date(doc.updatedAt).toISOString();
        const safeInitialUpdatedAt = existingDoc?.updated_at || targetUpdatedAt;

        // Upsert document metadata with user_id
        // Preserve prior updated_at if updating an existing record until content succeeds
        const { error: metaError } = await supabase.from('documents').upsert({
          id: doc.id,
          user_id: userId,
          title: doc.title,
          snippet: doc.snippet,
          tags: doc.tags || [],
          is_pinned: doc.isPinned || false,
          is_favorite: doc.isFavorite || false,
          is_ai_excluded: Boolean(doc.isAiExcluded),
          is_deleted: doc.isDeleted || false,
          deleted_at: doc.deletedAt ? new Date(doc.deletedAt).toISOString() : null,
          word_count: doc.wordCount || 0,
          size_bytes: doc.sizeBytes || 0,
          updated_at: safeInitialUpdatedAt
        });

        if (metaError) {
          console.warn('[Supabase Sync] Metadata error:', metaError.message);
          return false;
        }

        // 2. Upsert document full content
        const { error: contentError } = await supabase.from('document_contents').upsert({
          id: doc.id,
          content,
          updated_at: targetUpdatedAt
        });

        if (contentError) {
          console.warn('[Supabase Sync] Content error:', contentError.message);
          return false;
        }

        // 3. Content committed cleanly: finalize updated_at on documents metadata
        if (safeInitialUpdatedAt !== targetUpdatedAt) {
          await supabase
            .from('documents')
            .update({ updated_at: targetUpdatedAt })
            .eq('id', doc.id);
        }

        await db.documents.update(doc.id, { cloudSynced: true }).catch(() => {});
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

/**
 * Synchronizes document pin state to Supabase.
 */
export async function syncDocumentPinToSupabase(id: string, isPinned: boolean): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { error } = await supabase
      .from('documents')
      .update({
        is_pinned: isPinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Synchronizes soft trash/restore deletion state to Supabase.
 */
export async function syncDocumentTrashToSupabase(id: string, isDeleted: boolean): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { error } = await supabase
      .from('documents')
      .update({
        is_deleted: isDeleted,
        deleted_at: isDeleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id);

    return !error;
  } catch {
    return false;
  }
}

const LAST_PULL_KEY = 'md_writer_last_cloud_pull_ts';
const LAST_SYNC_KEY = 'md_writer_last_cloud_sync_ts';

export function getLastCloudPullTime(): number {
  try {
    const val = localStorage.getItem(LAST_PULL_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setLastCloudPullTime(ts: number): void {
  try {
    localStorage.setItem(LAST_PULL_KEY, String(ts));
  } catch {}
}

export function getLastCloudSyncTime(): number {
  try {
    const val = localStorage.getItem(LAST_SYNC_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setLastCloudSyncTime(ts: number): void {
  try {
    localStorage.setItem(LAST_SYNC_KEY, String(ts));
  } catch {}
}

/**
 * Pulls all documents belonging to the authenticated user from Supabase into Dexie.
 * Throttled to at most once per 15s (unless forced), protected by 4.5s timeout and parallelized.
 */
export async function pullCloudDocuments(force = false): Promise<number> {
  if (!supabase) return 0;
  // Throttle cloud pulls so rapid navigation doesn't trigger redundant network waterfalls
  const lastPull = getLastCloudPullTime();
  if (!force && Date.now() - lastPull < 15000) {
    return 0;
  }
  setLastCloudPullTime(Date.now());

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

        if (docError) {
          return 0;
        }

        const cloudDocsList = cloudDocs || [];
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        // 1. Separate active cloud documents from deletion tombstones
        const tombstoneDocs = cloudDocsList.filter((d: any) => {
          if (!d.is_deleted) return false;
          const delTime = d.deleted_at ? new Date(d.deleted_at).getTime() : 0;
          return now - delTime < THIRTY_DAYS_MS;
        });
        const tombstoneMap = new Map<string, any>(tombstoneDocs.map((d: any) => [d.id, d]));

        // Check local documents for remote deletion conflicts
        const localDocs = await db.documents.toArray();
        const pendingConflicts: RemoteDeletionConflict[] = [];

        for (const localDoc of localDocs) {
          if (localDoc.id === 'doc-getting-started' && localDoc.tags?.includes('Guide')) continue;
          if (isDocumentLocalOnly(localDoc.id)) continue;

          const tomb = tombstoneMap.get(localDoc.id);
          if (tomb) {
            const delTime = tomb.deleted_at ? new Date(tomb.deleted_at).getTime() : now;
            if (!isTombstoneResolved(localDoc.id, delTime)) {
              pendingConflicts.push({
                id: localDoc.id,
                title: localDoc.title,
                deletedAt: delTime,
                localUpdatedAt: localDoc.updatedAt,
                snippet: localDoc.snippet,
                wordCount: localDoc.wordCount,
              });
            }
          }
        }

        if (pendingConflicts.length > 0) {
          useCrossDeviceConflictStore.getState().addConflicts(pendingConflicts);
        }

        const conflictingIds = new Set(pendingConflicts.map((c) => c.id));
        let remoteChangesCount = 0;

        if (cloudDocsList.length === 0) {
          return 0;
        }

        // 2. Identify active documents requiring content pull
        const pendingDocs: typeof cloudDocs = [];
        for (const cloudDoc of cloudDocsList) {
          if (cloudDoc.is_deleted) continue; // Tombstones handled via reconciliation
          if (conflictingIds.has(cloudDoc.id)) continue;

          const localDoc = await db.documents.get(cloudDoc.id);
          const cloudUpdated = new Date(cloudDoc.updated_at).getTime();

          // Active document: pull if missing locally or newer in cloud
          if (!localDoc || cloudUpdated > localDoc.updatedAt + 1000) {
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
                isPinned: Boolean(cloudDoc.is_pinned),
                isFavorite: Boolean(cloudDoc.is_favorite),
                isAiExcluded: Boolean(cloudDoc.is_ai_excluded),
                isDeleted: Boolean(cloudDoc.is_deleted),
                deletedAt: cloudDoc.deleted_at ? new Date(cloudDoc.deleted_at).getTime() : undefined,
                wordCount: cloudDoc.word_count || 0,
                sizeBytes: cloudDoc.size_bytes || 0,
                cloudSynced: true
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

        if (pulledCount > 0 || remoteChangesCount > 0) {
          notifyDocumentStoreChanged();
        }

        return pulledCount;
      } catch (err) {
        console.warn('[Supabase Pull] Failed to pull documents:', err);
        return 0;
      }
    })(),
    6500,
    0
  );
}

/**
 * Lightweight delta sync: fetches only documents modified in Supabase since last sync time.
 * Executes in <100ms and syncs metadata and contents into Dexie.
 */
export async function pullLatestCloudChanges(force = false): Promise<number> {
  if (!supabase) return 0;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return 0;

    const lastSyncTime = getLastCloudPullTime();
    // Throttle non-forced checks to once per 3s
    if (!force && Date.now() - lastSyncTime < 3000) return 0;

    const query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', session.user.id);

    // If lastSyncTime is valid, only query docs updated since then (-5s clock skew buffer)
    const sinceIso = lastSyncTime > 0
      ? new Date(Math.max(0, lastSyncTime - 5000)).toISOString()
      : null;

    const { data: modifiedDocs, error } = sinceIso
      ? await query.gt('updated_at', sinceIso).order('updated_at', { ascending: false })
      : await query.order('updated_at', { ascending: false }).limit(50);

    if (error || !modifiedDocs || modifiedDocs.length === 0) {
      setLastCloudPullTime(Date.now());
      return 0;
    }

    setLastCloudPullTime(Date.now());

    let updatedCount = 0;
    for (const doc of modifiedDocs) {
      const cloudUpdated = new Date(doc.updated_at).getTime();
      const local = await db.documents.get(doc.id);

      if (!local || cloudUpdated > local.updatedAt + 500) {
        if (!doc.is_deleted) {
          const { data: contentData } = await supabase
            .from('document_contents')
            .select('content')
            .eq('id', doc.id)
            .maybeSingle();

          const content = contentData?.content || '';
          await db.documents.put({
            id: doc.id,
            title: doc.title,
            snippet: doc.snippet || '',
            tags: doc.tags || [],
            createdAt: new Date(doc.created_at).getTime(),
            updatedAt: cloudUpdated,
            lastOpenedAt: doc.last_opened_at ? new Date(doc.last_opened_at).getTime() : Date.now(),
            openCount: 1,
            isPinned: Boolean(doc.is_pinned),
            isFavorite: Boolean(doc.is_favorite),
            isAiExcluded: Boolean(doc.is_ai_excluded),
            isDeleted: Boolean(doc.is_deleted),
            deletedAt: doc.deleted_at ? new Date(doc.deleted_at).getTime() : undefined,
            wordCount: doc.word_count || 0,
            sizeBytes: doc.size_bytes || 0,
            cloudSynced: true,
          });

          await db.document_cache.put({
            id: doc.id,
            content,
            cachedAt: Date.now(),
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('md-writer-remote-doc-update', {
                detail: { docId: doc.id, content, updatedAt: cloudUpdated, title: doc.title },
              })
            );
          }
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      notifyDocumentStoreChanged();
    }
    return updatedCount;
  } catch (err) {
    console.warn('[Supabase DeltaPull] Error:', err);
    return 0;
  }
}

/**
 * Performs bi-directional synchronization between Dexie (IndexedDB) and Supabase Cloud.
 * Throttled to once every 20s (unless forced), non-blocking, dirty-tracked and batched.
 */
export async function syncAllDocuments(force = false): Promise<{ pulled: number; pushed: number; syncedTitles: string[] }> {
  if (!supabase) return { pulled: 0, pushed: 0, syncedTitles: [] };
  const lastSync = getLastCloudSyncTime();
  if (!force && Date.now() - lastSync < 20000) {
    return { pulled: 0, pushed: 0, syncedTitles: [] };
  }
  setLastCloudSyncTime(Date.now());

  try {
    const isPro = await isUserProForSync();
    if (!isPro) return { pulled: 0, pushed: 0, syncedTitles: [] };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { pulled: 0, pushed: 0, syncedTitles: [] };

    // Flush any pending deletions that failed previously while offline
    const pendingDeletions = getPendingDeletions();
    for (const delId of pendingDeletions) {
      await deleteDocumentFromSupabase(delId).catch(() => {});
    }

    // 1. Pull latest cloud documents first (passes force flag)
    const pulled = await pullCloudDocuments(force);

    // 2. Fetch lightweight cloud metadata mapping (id -> updated_at) to avoid blind O(N) pushes
    const { data: cloudMetas } = await supabase
      .from('documents')
      .select('id, updated_at')
      .eq('user_id', session.user.id);

    const cloudMap = new Map<string, number>();
    if (cloudMetas) {
      for (const cm of cloudMetas) {
        cloudMap.set(cm.id, new Date(cm.updated_at).getTime());
      }
    }

    // 3. Only push local documents that are missing in cloud OR modified locally since last cloud update
    const localDocs = await db.documents.toArray();
    const activeConflicts = useCrossDeviceConflictStore.getState().conflicts;
    const conflictingIds = new Set(activeConflicts.map((c) => c.id));

    const docsToSync = localDocs.filter((d) => {
      if (d.id === 'doc-getting-started' && d.tags?.includes('Guide')) return false;
      if (isDocumentLocalOnly(d.id)) return false;
      if (conflictingIds.has(d.id)) return false; // Never push during deletion conflict
      if (d.isDeleted) return false;

      const cloudTime = cloudMap.get(d.id);
      // If doc was already synced before (cloudSynced: true) but missing from cloud,
      // it was deleted in the cloud on another machine! NEVER resurrect it!
      if (d.cloudSynced && cloudTime === undefined) {
        return false;
      }

      return cloudTime === undefined || d.updatedAt > cloudTime + 1000;
    });

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

    if (pushed > 0) {
      notifyDocumentStoreChanged();
    }

    return { pulled, pushed, syncedTitles: docsToSync.map(d => d.title).slice(0, 10) };
  } catch (err) {
    console.warn('[Supabase SyncAll] Sync failed:', err);
    return { pulled: 0, pushed: 0, syncedTitles: [] };
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
      isAiExcluded: Boolean(docData.is_ai_excluded),
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

    // 1. Delete content from document_contents to purge heavy cloud text
    const { error: contentError } = await supabase
      .from('document_contents')
      .delete()
      .eq('id', id);

    if (contentError) {
      console.warn('[Supabase Delete] Content deletion warning:', contentError.message);
    }

    // 2. Write lightweight deletion tombstone to documents table
    const { error: metaError } = await supabase
      .from('documents')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (metaError) {
      console.warn('[Supabase Delete] Metadata deletion error:', metaError.message);
      queuePendingDeletion(id);
      return false;
    }

    removePendingDeletion(id);
    return true;
  } catch (err) {
    console.warn('[Supabase Delete] Failed to delete document:', err);
    queuePendingDeletion(id);
    return false;
  }
}

let activeRealtimeChannel: any = null;

/**
 * Subscribes to real-time changes on the documents table for the authenticated user.
 * Propagates remote deletions, restorations, and edits instantaneously across devices.
 */
export function subscribeToUserDocumentChanges(userId: string): () => void {
  if (!supabase || !userId) return () => {};

  if (activeRealtimeChannel) {
    try {
      supabase.removeChannel(activeRealtimeChannel);
    } catch {}
    activeRealtimeChannel = null;
  }

  const channel = supabase
    .channel(`user-docs-realtime-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        try {
          if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              await db.transaction('rw', db.documents, db.document_cache, db.revisions, async () => {
                await db.documents.delete(deletedId);
                await db.document_cache.delete(deletedId);
                await db.revisions.where('documentId').equals(deletedId).delete();
              });
              notifyDocumentStoreChanged(deletedId, 'all');
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('md-writer-remote-doc-delete', { detail: { docId: deletedId } })
                );
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedDoc = payload.new as any;
            if (updatedDoc?.id) {
              const cloudUpdated = new Date(updatedDoc.updated_at).getTime();
              const existing = await db.documents.get(updatedDoc.id);
              if (existing) {
                // If updatedDoc was tombstoned on another device, trigger conflict review
                if (updatedDoc.is_deleted) {
                  const delTime = updatedDoc.deleted_at ? new Date(updatedDoc.deleted_at).getTime() : Date.now();
                  if (!isTombstoneResolved(updatedDoc.id, delTime) && !isDocumentLocalOnly(updatedDoc.id)) {
                    useCrossDeviceConflictStore.getState().addConflicts([{
                      id: updatedDoc.id,
                      title: updatedDoc.title,
                      deletedAt: delTime,
                      localUpdatedAt: existing.updatedAt,
                      snippet: existing.snippet,
                      wordCount: existing.wordCount,
                    }]);
                    return;
                  }
                }

                // If remote document was edited on another device, immediately pull updated content!
                let fetchedContent: string | null = null;
                if (!updatedDoc.is_deleted && cloudUpdated > existing.updatedAt) {
                  try {
                    const { data: contentData } = await supabase!
                      .from('document_contents')
                      .select('content')
                      .eq('id', updatedDoc.id)
                      .maybeSingle();
                    if (contentData && typeof contentData.content === 'string') {
                      fetchedContent = contentData.content;
                      await db.document_cache.put({
                        id: updatedDoc.id,
                        content: fetchedContent,
                        cachedAt: Date.now(),
                      });
                    }
                  } catch (contentErr) {
                    console.warn('[Realtime Sync] Content fetch error on update:', contentErr);
                  }
                }

                await db.documents.update(updatedDoc.id, {
                  title: updatedDoc.title,
                  snippet: updatedDoc.snippet || existing.snippet,
                  tags: updatedDoc.tags || existing.tags,
                  isPinned: Boolean(updatedDoc.is_pinned),
                  isFavorite: Boolean(updatedDoc.is_favorite),
                  isAiExcluded: Boolean(updatedDoc.is_ai_excluded),
                  isDeleted: Boolean(updatedDoc.is_deleted),
                  deletedAt: updatedDoc.deleted_at ? new Date(updatedDoc.deleted_at).getTime() : undefined,
                  wordCount: updatedDoc.word_count || existing.wordCount,
                  sizeBytes: updatedDoc.size_bytes || existing.sizeBytes,
                  updatedAt: cloudUpdated,
                  cloudSynced: true
                });

                notifyDocumentStoreChanged(updatedDoc.id, updatedDoc.is_deleted ? 'trash' : 'save');

                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('md-writer-remote-doc-update', {
                      detail: {
                        docId: updatedDoc.id,
                        content: fetchedContent,
                        updatedAt: cloudUpdated,
                        title: updatedDoc.title,
                        isDeleted: Boolean(updatedDoc.is_deleted),
                      },
                    })
                  );
                }
              } else if (!updatedDoc.is_deleted) {
                fetchDocumentFromSupabase(updatedDoc.id).then(async (res) => {
                  if (res) {
                    await db.documents.put({ ...res.meta, cloudSynced: true });
                    await db.document_cache.put({ id: res.meta.id, content: res.content, cachedAt: Date.now() });
                    notifyDocumentStoreChanged(res.meta.id, 'all');
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('md-writer-remote-doc-update', {
                          detail: {
                            docId: res.meta.id,
                            content: res.content,
                            updatedAt: res.meta.updatedAt,
                            title: res.meta.title,
                            isDeleted: false,
                          },
                        })
                      );
                    }
                  }
                });
              }
            }
          } else if (payload.eventType === 'INSERT') {
            const newDoc = payload.new as any;
            if (newDoc?.id && !newDoc.is_deleted) {
              fetchDocumentFromSupabase(newDoc.id).then(async (res) => {
                if (res) {
                  await db.documents.put({ ...res.meta, cloudSynced: true });
                  await db.document_cache.put({ id: res.meta.id, content: res.content, cachedAt: Date.now() });
                  notifyDocumentStoreChanged(res.meta.id, 'all');
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('md-writer-remote-doc-update', {
                        detail: {
                          docId: res.meta.id,
                          content: res.content,
                          updatedAt: res.meta.updatedAt,
                          title: res.meta.title,
                          isDeleted: false,
                        },
                      })
                    );
                  }
                }
              });
            }
          }
        } catch (err) {
          console.warn('[Realtime Sync] Error processing change:', err);
        }
      }
    )
    .subscribe();

  activeRealtimeChannel = channel;

  return () => {
    if (activeRealtimeChannel) {
      try {
        supabase?.removeChannel(activeRealtimeChannel);
      } catch {}
      activeRealtimeChannel = null;
    }
  };
}


/**
 * Purges lightweight deletion tombstones older than 30 days from Supabase.
 */
export async function purgeExpiredCloudTombstones(): Promise<number> {
  if (!supabase) return 0;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return 0;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('documents')
      .delete()
      .eq('user_id', session.user.id)
      .eq('is_deleted', true)
      .lt('deleted_at', thirtyDaysAgo)
      .select('id');
    return data?.length || 0;
  } catch (err) {
    console.warn('[purgeExpiredCloudTombstones] Warning:', err);
    return 0;
  }
}
