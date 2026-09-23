import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  db, 
  saveDocument, 
  getDocumentContent, 
  createNewDocument, 
  createRevisionSnapshot, 
  DocumentMetadata 
} from '../../../db';
import { syncDocumentToSupabase, isSupabaseConfigured, supabase } from '../../../lib/supabase';
import { useConfirm } from '../../../stores/useConfirmStore';
import { MarkdownTemplate } from '../../../data/templates';
import { CodeMirrorEditorHandle } from '../components/CodeMirrorEditor';

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

  const contentRef = useRef<string>(content);
  contentRef.current = content;

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnapshotContentRef = useRef<string>('');

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
        for (const id of pendingQueue) {
          try {
            const meta = await db.documents.get(id);
            const cached = await db.document_cache.get(id);
            if (meta && cached) {
              await syncDocumentToSupabase(meta, cached.content);
              removeDocFromOfflineQueue(id);
            }
          } catch (err) {
            console.warn('[SyncQueue] Failed to sync doc:', id, err);
          }
        }
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

  // 3. Supabase Realtime WebSocket Channel (Bug 7 Fix)
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
          if (typeof remoteContent === 'string' && remoteContent !== contentRef.current) {
            setContent(remoteContent);
            contentRef.current = remoteContent;
            lastSnapshotContentRef.current = remoteContent;
            db.document_cache.put({ id: docId, content: remoteContent, cachedAt: Date.now() });
            onToast?.('⚡ Synced live from another device');
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [docId, onToast]);

  // 4. Save Execution: Multi-tier fallback (Dexie + localStorage + Supabase Cloud)
  const executeSave = useCallback(
    async (newContent: string, newTitle: string) => {
      setIsSaving(true);

      // A. Save immediately to primary local source (Dexie IndexedDB)
      await saveDocument(docId, newTitle, newContent, docMetadata?.tags);

      // B. Emergency snapshot in localStorage
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

      const updatedMeta = await db.documents.get(docId);
      if (updatedMeta) {
        setDocMetadata(updatedMeta);

        // C. Sync to Supabase or queue for offline background sync
        if (!navigator.onLine || !isSupabaseConfigured()) {
          addDocToOfflineQueue(docId);
          setIsOffline(true);
        } else {
          try {
            const synced = await syncDocumentToSupabase(updatedMeta, newContent);
            if (synced) {
              removeDocFromOfflineQueue(docId);
              setIsOffline(false);
            } else {
              addDocToOfflineQueue(docId);
              setIsOffline(true);
            }
          } catch (err) {
            console.warn('[Offline Fallback] Cloud sync deferred:', err);
            addDocToOfflineQueue(docId);
            setIsOffline(true);
          }
        }
      }

      setIsSaving(false);
      setIsSaved(true);
    },
    [docId, docMetadata?.tags]
  );

  // 5. Auto-save debounce (1.5s) and snapshot debounce (30s)
  const queueAutoSave = useCallback(
    (newContent: string, currentTitle: string) => {
      setIsSaved(false);

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        executeSave(newContent, currentTitle);
      }, 1500);

      if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
      snapshotTimerRef.current = setTimeout(() => {
        if (newContent !== lastSnapshotContentRef.current && newContent.trim()) {
          lastSnapshotContentRef.current = newContent;
          createRevisionSnapshot(docId, currentTitle, newContent, 'Auto-snapshot');
        }
      }, 30000);
    },
    [docId, executeSave]
  );

  // Toggle interactive task in preview
  const handleToggleTask = useCallback(
    (taskIndex: number, _currentChecked: boolean) => {
      let counter = 0;
      const taskRegex = /^(\s*[-*+]\s*\[)([ xX])(\]\s.*)$/gm;

      const nextContent = content.replace(taskRegex, (match, prefix, checkChar, suffix) => {
        if (counter === taskIndex) {
          counter++;
          const nextChar = checkChar.trim().toLowerCase() === 'x' ? ' ' : 'x';
          return `${prefix}${nextChar}${suffix}`;
        }
        counter++;
        return match;
      });

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
      removeDocFromOfflineQueue(docId);
      try {
        localStorage.removeItem(`md-writer-offline-backup-${docId}`);
      } catch {}
      await db.documents.delete(docId);
      await db.document_cache.delete(docId);
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
  const handleExportMd = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
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
    executeSave,
    queueAutoSave,
    handleToggleTask,
    handleUpdateTags,
    handleDeleteCurrentDoc,
    handleClearContent,
    handleRestoreRevision,
    handleSelectTemplate,
    handleInsertTableFromModal,
    handleExportMd,
    handleCopyMarkdown,
  };
}
