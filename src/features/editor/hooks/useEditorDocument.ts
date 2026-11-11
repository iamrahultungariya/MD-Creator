import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  db, 
  saveDocument, 
  deleteDocument,
  getDocumentContent, 
  createNewDocument, 
  createRevisionSnapshot, 
  DocumentMetadata 
} from '../../../db';
import { IDLE_COALESCE_MS } from '../../../utils/deltaCompression';
import { syncDocumentToSupabase, deleteDocumentFromSupabase, isSupabaseConfigured, supabase } from '../../../lib/supabase';
import { markTombstoneResolved } from '../../../stores/useCrossDeviceConflictStore';
import { useConfirm } from '../../../stores/useConfirmStore';
import { MarkdownTemplate } from '../../../data/templates';
import { inlineStoredImagesInMarkdown } from '../../../services/imageStorageService';
import { CodeMirrorEditorHandle } from '../components/CodeMirrorEditor';
import { RemoteConflictData } from '../components/EditorConflictBanner';

const OFFLINE_QUEUE_KEY = 'md-writer-offline-sync-queue';

function getOfflineSyncQueue(): string[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineSyncQueue(queue: string[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(Array.from(new Set(queue))));
  } catch {}
}

function addDocToOfflineQueue(id: string): void {
  const q = getOfflineSyncQueue();
  if (!q.includes(id)) {
    saveOfflineSyncQueue([...q, id]);
  }
}

function removeDocFromOfflineQueue(id: string): void {
  const q = getOfflineSyncQueue().filter((item) => item !== id);
  saveOfflineSyncQueue(q);
}

interface UseEditorDocumentOptions {
  routeDocId?: string;
  onToast?: (message: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  editorRef?: React.RefObject<CodeMirrorEditorHandle | null>;
}

export function useEditorDocument({ routeDocId, onToast, textareaRef, editorRef }: UseEditorDocumentOptions) {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [docId, setDocId] = useState<string>(routeDocId || 'doc-getting-started');
  const [docMetadata, setDocMetadata] = useState<DocumentMetadata | null>(null);
  const [title, setTitle] = useState('Getting Started.md');
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [remoteConflict, setRemoteConflict] = useState<RemoteConflictData | null>(null);

  const contentRef = useRef<string>(content);
  contentRef.current = content;
  const titleRef = useRef<string>(title);
  titleRef.current = title;
  const isSavedRef = useRef<boolean>(isSaved);
  isSavedRef.current = isSaved;

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnapshotContentRef = useRef<string>('');
  const lastLocalEditTimeRef = useRef<number>(0);

  // Flush pending auto-save immediately on navigation / unmount / beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isSavedRef.current && contentRef.current !== undefined && docId) {
        saveDocument(docId, titleRef.current, contentRef.current, docMetadata?.tags).catch(console.warn);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (!isSavedRef.current && contentRef.current !== undefined && docId) {
        saveDocument(docId, titleRef.current, contentRef.current, docMetadata?.tags).catch(console.warn);
      }
    };
  }, [docId, docMetadata?.tags]);

  // 1. Load document from Dexie on mount or ID change
  useEffect(() => {
    let isMounted = true;
    async function load() {
      let targetId = routeDocId;
      if (!targetId) {
        const firstDoc = await db.documents.toCollection().first();
        if (firstDoc) {
          targetId = firstDoc.id;
        } else {
          targetId = await createNewDocument('Getting Started.md');
        }
      }

      const meta = await db.documents.get(targetId);
      const text = await getDocumentContent(targetId);

      if (isMounted) {
        setDocId(targetId);
        setDocMetadata(meta || null);
        setTitle(meta?.title || 'Untitled.md');
        setContent(text);
        contentRef.current = text;
        titleRef.current = meta?.title || 'Untitled.md';
        lastSnapshotContentRef.current = text;
        setIsSaved(true);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [routeDocId]);

  // 2. Offline Detection & Background Sync Listener (Bug 6 Fix)
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      const pendingQueue = getOfflineSyncQueue();
      if (pendingQueue.length > 0 && isSupabaseConfigured()) {
        onToast?.('🔄 Online: syncing offline drafts...');
        const syncPromises = pendingQueue.map(async (id) => {
          try {
            const meta = await db.documents.get(id);
            const cached = await db.document_cache.get(id);
            if (meta && cached) {
              const synced = await syncDocumentToSupabase(meta, cached.content);
              if (synced) removeDocFromOfflineQueue(id);
            }
          } catch (err) {
            console.warn('[SyncQueue] Failed to sync doc:', id, err);
          }
        });
        await Promise.allSettled(syncPromises);
        onToast?.('🟢 All offline drafts successfully synced!');
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      onToast?.('⚠️ You are offline. Changes will save locally & sync when reconnected.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onToast]);

  // 3. Remote Content Change Handler with Non-Destructive Conflict Guard
  const handleRemoteChange = useCallback(
    (newRemoteContent: string, newRemoteTitle?: string, remoteUpdatedAt?: number) => {
      if (newRemoteContent === contentRef.current) return;

      const isClean = isSavedRef.current && Date.now() - lastLocalEditTimeRef.current > 3000;

      if (isClean) {
        // Clean state: update editor and view smoothly (<500ms)
        setContent(newRemoteContent);
        contentRef.current = newRemoteContent;
        lastSnapshotContentRef.current = newRemoteContent;
        if (editorRef?.current && typeof editorRef.current.setValue === 'function') {
          editorRef.current.setValue(newRemoteContent, true);
        }
        if (newRemoteTitle && newRemoteTitle !== titleRef.current) {
          setTitle(newRemoteTitle);
          titleRef.current = newRemoteTitle;
        }
        setIsSaved(true);
        db.document_cache.put({ id: docId, content: newRemoteContent, cachedAt: Date.now() }).catch(() => {});
        onToast?.('⚡ Synced latest changes from another device');
      } else {
        // Dirty state: non-destructive conflict protection!
        createRevisionSnapshot(docId, 'Pre-conflict local draft', contentRef.current, 'local_auto').catch(() => {});
        setRemoteConflict({
          remoteContent: newRemoteContent,
          remoteTitle: newRemoteTitle,
          remoteUpdatedAt: remoteUpdatedAt || Date.now(),
        });
      }
    },
    [docId, editorRef, onToast]
  );

  // Global Remote Document Update & Flush Listeners
  useEffect(() => {
    const handleRemoteEvent = (event: Event) => {
      const custom = event as CustomEvent;
      const { docId: updatedId, content: remoteContent, title: remoteTitle, updatedAt: remoteUpdated } =
        custom.detail || {};
      if (updatedId === docId && typeof remoteContent === 'string') {
        handleRemoteChange(remoteContent, remoteTitle, remoteUpdated);
      }
    };

    const handleFlushDrafts = () => {
      if (!isSavedRef.current && contentRef.current !== undefined && docId) {
        saveDocument(docId, titleRef.current, contentRef.current, docMetadata?.tags).catch(console.warn);
      }
    };

    window.addEventListener('md-writer-remote-doc-update', handleRemoteEvent as EventListener);
    window.addEventListener('md-writer-flush-drafts', handleFlushDrafts);

    return () => {
      window.removeEventListener('md-writer-remote-doc-update', handleRemoteEvent as EventListener);
      window.removeEventListener('md-writer-flush-drafts', handleFlushDrafts);
    };
  }, [docId, docMetadata?.tags, handleRemoteChange]);

  // Supabase Realtime WebSocket Channel for direct document_contents updates
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase || !docId) return;

    const channel = supabase
      .channel(`realtime-doc-${docId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'document_contents',
          filter: `id=eq.${docId}`,
        },
        (payload: any) => {
          const remoteContent = payload.new?.content;
          if (typeof remoteContent === 'string') {
            handleRemoteChange(remoteContent);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [docId, handleRemoteChange]);

  // 4. Save Execution: Multi-tier fallback (Dexie + localStorage + Supabase Cloud)
  const executeSave = useCallback(
    async (newContent: string, newTitle: string) => {
      lastLocalEditTimeRef.current = Date.now();
      setIsSaving(true);

      // A. Save immediately to primary local source (Dexie IndexedDB)
      await saveDocument(docId, newTitle, newContent, docMetadata?.tags);

      // B. Emergency snapshot in localStorage (skip for large documents > 150KB to avoid freezing main thread)
      if (newContent.length < 150000) {
        try {
          localStorage.setItem(
            `md-writer-offline-backup-${docId}`,
            JSON.stringify({
              title: newTitle,
              content: newContent,
              savedAt: Date.now(),
            })
          );
        } catch {}
      }

      const updatedMeta = await db.documents.get(docId);
      if (updatedMeta) {
        setDocMetadata(updatedMeta);
      }

      // STRICT REQUIREMENT: Dexie IndexedDB persistence is complete in <2ms!
      // Immediately set save states to guarantee 0ms typing UI responsiveness.
      setIsSaving(false);
      setIsSaved(true);

      // C. Non-blocking Background Cloud Sync (never stalls UI or editor thread)
      if (updatedMeta) {
        if (!navigator.onLine || !isSupabaseConfigured()) {
          addDocToOfflineQueue(docId);
          setIsOffline(true);
        } else {
          syncDocumentToSupabase(updatedMeta, newContent)
            .then((synced) => {
              if (synced) {
                removeDocFromOfflineQueue(docId);
                setIsOffline(false);
              } else {
                addDocToOfflineQueue(docId);
                setIsOffline(true);
              }
            })
            .catch((err) => {
              console.warn('[Offline Fallback] Cloud sync deferred:', err);
              addDocToOfflineQueue(docId);
              setIsOffline(true);
            });
        }
      }
    },
    [docId, docMetadata?.tags]
  );

  // 5. Auto-save debounce (4.0s idle) and Revision Coalescing (45s idle / 30-60s window)
  const queueAutoSave = useCallback(
    (newContent: string, currentTitle: string) => {
      lastLocalEditTimeRef.current = Date.now();
      setIsSaved(false);

      // Fast silent local draft saving (Dexie IndexedDB - 1.5s idle)
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        executeSave(newContent, currentTitle);
      }, 1500);

      // Intelligent revision coalescing: does not spam revision history on every keystroke.
      // Only creates an auto-revision when the user pauses typing for 45s AND has modified at least 15 characters.
      if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
      snapshotTimerRef.current = setTimeout(() => {
        const charDiff = Math.abs(newContent.length - lastSnapshotContentRef.current.length);
        if (charDiff >= 15 && newContent.trim()) {
          lastSnapshotContentRef.current = newContent;
          createRevisionSnapshot(docId, currentTitle, newContent, 'Coalesced Revision (45s Idle)');
        }
      }, IDLE_COALESCE_MS);
    },
    [docId, executeSave]
  );

  // Manual Checkpoint creator (immediate, skips idle delay)
  const createManualCheckpoint = useCallback(
    async (reason = 'Manual Checkpoint') => {
      if (!content.trim()) return undefined;
      lastSnapshotContentRef.current = content;
      const revId = await createRevisionSnapshot(docId, title, content, reason);
      onToast?.('📌 Revision checkpoint saved');
      return revId;
    },
    [docId, title, content, onToast]
  );

  // Toggle interactive task in preview (strictly ignores code blocks to prevent index desync)
  const handleToggleTask = useCallback(
    (taskIndex: number, _currentChecked: boolean) => {
      let counter = 0;
      let inCodeBlock = false;
      const lines = content.split('\n');

      const nextLines = lines.map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
          inCodeBlock = !inCodeBlock;
          return line;
        }

        if (inCodeBlock) {
          return line;
        }

        const taskMatch = line.match(/^(\s*[-*+]\s*\[)([ xX])(\]\s.*)$/);
        if (taskMatch) {
          if (counter === taskIndex) {
            counter++;
            const nextChar = taskMatch[2].trim().toLowerCase() === 'x' ? ' ' : 'x';
            return `${taskMatch[1]}${nextChar}${taskMatch[3]}`;
          }
          counter++;
        }

        return line;
      });

      const nextContent = nextLines.join('\n');
      setContent(nextContent);
      setIsSaved(false);
      executeSave(nextContent, title);
    },
    [content, title, executeSave]
  );

  // Update tags
  const handleUpdateTags = useCallback(
    async (newTags: string[]) => {
      if (!docMetadata) return;
      await db.documents.update(docId, { tags: newTags });
      setDocMetadata({ ...docMetadata, tags: newTags });
    },
    [docId, docMetadata]
  );

  // Toggle AI exclusion for this document
  const handleToggleAiExclusion = useCallback(
    async (isExcluded: boolean) => {
      if (!docMetadata) return;
      await db.documents.update(docId, { isAiExcluded: isExcluded });
      setDocMetadata({ ...docMetadata, isAiExcluded: isExcluded });
      onToast?.(
        isExcluded
          ? '🛡️ Document shielded from AI scan. Mimo cannot read this note.'
          : '✨ Document AI scanning enabled.'
      );
    },
    [docId, docMetadata, onToast]
  );

  // Delete document
  const handleDeleteCurrentDoc = useCallback(async () => {
    const ok = await confirm({
      title: 'Delete Current Document',
      message: `Are you sure you want to permanently delete "${title}"?`,
      description: 'This document and its local revisions will be erased from your IndexedDB storage.',
      confirmText: 'Delete Document',
      cancelText: 'Keep Document',
      variant: 'danger',
      icon: 'trash',
    });

    if (ok) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
      isSavedRef.current = true; // Crucial: prevents unmount hook from resurrecting deleted doc!

      removeDocFromOfflineQueue(docId);
      try {
        localStorage.removeItem(`md-writer-offline-backup-${docId}`);
      } catch {}

      await deleteDocument(docId, true);
      markTombstoneResolved(docId, Date.now());

      if (isSupabaseConfigured()) {
        deleteDocumentFromSupabase(docId).catch(console.warn);
      }

      navigate('/documents');
    }
  }, [confirm, docId, title, navigate]);

  // Clear content
  const handleClearContent = useCallback(async () => {
    const ok = await confirm({
      title: 'Clear Document Content',
      message: `Are you sure you want to clear all text in "${title}"?`,
      description: 'The editor textarea will be emptied immediately and auto-saved to IndexedDB.',
      confirmText: 'Clear Content',
      cancelText: 'Keep My Writing',
      variant: 'warning',
      icon: 'clear',
    });

    if (ok) {
      setContent('');
      setIsSaved(false);
      executeSave('', title);
      onToast?.('Document content cleared');
    }
  }, [confirm, title, executeSave, onToast]);

  // Restore Revision
  const handleRestoreRevision = useCallback(
    (restoredContent: string) => {
      setContent(restoredContent);
      setIsSaved(false);
      executeSave(restoredContent, title);
      onToast?.('✨ Restored document from checkpoint!');
    },
    [title, executeSave, onToast]
  );

  // Select Template
  const handleSelectTemplate = useCallback(
    (template: MarkdownTemplate, action: 'insert' | 'replace') => {
      if (action === 'replace') {
        if (content.trim()) {
          createRevisionSnapshot(docId, title, content, 'Pre-Template Backup');
        }
        setContent(template.content);
        if (title === 'Getting Started.md' || title === 'Untitled Document' || title === 'Untitled.md') {
          setTitle(template.title);
        }
        setIsSaved(false);
        executeSave(template.content, title);
        onToast?.(`✨ Loaded "${template.title}" template`);
      } else {
        const cursor = editorRef?.current?.getSelectionStart() ?? textareaRef?.current?.selectionStart ?? content.length;
        const before = content.substring(0, cursor);
        const after = content.substring(cursor);
        const sep = before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
        const newContent = before + sep + template.content + '\n\n' + after;
        setContent(newContent);
        setIsSaved(false);
        executeSave(newContent, title);
        onToast?.(`✨ Inserted "${template.title}" snippet at cursor`);
      }
    },
    [docId, title, content, textareaRef, editorRef, executeSave, onToast]
  );

  // Insert Table
  const handleInsertTableFromModal = useCallback(
    (tableMarkdown: string) => {
      if (editorRef?.current) {
        editorRef.current.replaceSelection('\n\n' + tableMarkdown + '\n\n');
        const next = editorRef.current.getValue();
        setContent(next);
        setIsSaved(false);
        executeSave(next, title);
        return;
      }

      if (!textareaRef?.current) {
        const next = content + '\n\n' + tableMarkdown;
        setContent(next);
        executeSave(next, title);
        return;
      }
      const cursor = textareaRef.current.selectionStart;
      const before = content.substring(0, cursor);
      const after = content.substring(cursor);
      const next = before + '\n\n' + tableMarkdown + '\n' + after;
      setContent(next);
      setIsSaved(false);
      executeSave(next, title);
      setTimeout(() => {
        if (textareaRef?.current) {
          textareaRef.current.focus();
        }
      }, 50);
    },
    [content, title, textareaRef, editorRef, executeSave]
  );

  // Export & Copy Helpers
  const handleExportMd = useCallback(async () => {
    const exportable = await inlineStoredImagesInMarkdown(content);
    const blob = new Blob([exportable], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.endsWith('.md') ? title : `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, title]);

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(content);
    onToast?.('Copied Markdown!');
  }, [content, onToast]);

  // Conflict Resolution Handlers
  const resolveConflictKeepMine = useCallback(async () => {
    setRemoteConflict(null);
    await executeSave(contentRef.current, titleRef.current);
    onToast?.('Kept your version & updated cloud');
  }, [executeSave, onToast]);

  const resolveConflictUseRemote = useCallback(async () => {
    if (!remoteConflict) return;
    const targetContent = remoteConflict.remoteContent;
    const targetTitle = remoteConflict.remoteTitle || titleRef.current;

    // Backup current local draft into revisions first
    await createRevisionSnapshot(docId, 'Pre-conflict local draft', contentRef.current, 'local_auto').catch(() => {});

    setContent(targetContent);
    contentRef.current = targetContent;
    lastSnapshotContentRef.current = targetContent;
    if (editorRef?.current && typeof editorRef.current.setValue === 'function') {
      editorRef.current.setValue(targetContent);
    }
    if (targetTitle) {
      setTitle(targetTitle);
      titleRef.current = targetTitle;
    }
    setIsSaved(true);
    setRemoteConflict(null);

    await saveDocument(docId, targetTitle, targetContent, docMetadata?.tags);
    onToast?.('Applied remote version');
  }, [docId, docMetadata?.tags, editorRef, onToast, remoteConflict]);

  const dismissRemoteConflict = useCallback(() => {
    setRemoteConflict(null);
  }, []);

  return {
    docId,
    docMetadata,
    title,
    setTitle,
    content,
    setContent,
    isSaved,
    isSaving,
    isOffline,
    remoteConflict,
    resolveConflictKeepMine,
    resolveConflictUseRemote,
    dismissRemoteConflict,
    executeSave,
    queueAutoSave,
    handleToggleTask,
    handleUpdateTags,
    handleToggleAiExclusion,
    handleDeleteCurrentDoc,
    handleClearContent,
    handleRestoreRevision,
    handleSelectTemplate,
    handleInsertTableFromModal,
    handleExportMd,
    handleCopyMarkdown,
    createManualCheckpoint,
  };
}
