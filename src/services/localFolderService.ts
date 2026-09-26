/**
 * Native Local Folder Service using browser File System Access API
 * Supported in Chromium browsers (Chrome, Edge, Brave, Opera)
 */

export interface LocalFileItem {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: LocalFileItem[];
  size?: number;
  lastModified?: number;
}

const DB_NAME = 'MdWriterLocalVault';
const STORE_NAME = 'handles';
const KEY_NAME = 'active_vault_handle';

/**
 * Checks if the current browser supports the native File System Access API
 */
export const isFileSystemAccessSupported = (): boolean => {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
};

/**
 * Opens IndexedDB connection for storing serializable FileSystemHandle
 */
function openHandleDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists the DirectoryHandle in IndexedDB for seamless reload restoration
 */
export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, KEY_NAME);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save directory handle in IndexedDB:', err);
  }
}

/**
 * Retrieves the persisted DirectoryHandle from IndexedDB
 */
export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(KEY_NAME);
    return new Promise((resolve) => {
      request.onsuccess = async () => {
        const handle = request.result as FileSystemDirectoryHandle | undefined;
        if (!handle) {
          resolve(null);
          return;
        }

        // Verify or request permission if queryPermission is available
        try {
          if ('queryPermission' in handle) {
            const status = await (handle as any).queryPermission({ mode: 'readwrite' });
            if (status === 'granted') {
              resolve(handle);
              return;
            }
          }
        } catch {
          // Ignore permission query error
        }
        resolve(handle);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Clears the stored DirectoryHandle
 */
export async function clearStoredDirectoryHandle(): Promise<void> {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(KEY_NAME);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore error
  }
}

/**
 * Prompts user to pick a local folder via native OS file dialog
 */
export async function pickLocalFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser. Please use Chrome, Edge, or Brave.');
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
    });

    if (handle) {
      await saveDirectoryHandle(handle);
    }
    return handle;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return null; // User cancelled picker
    }
    throw err;
  }
}

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  '.obsidian',
  '.trash',
  '.vscode',
  'dist',
  'build',
  '.next',
]);

const ALLOWED_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.txt']);

/**
 * Recursively scans a DirectoryHandle for markdown files and subdirectories
 */
export async function scanLocalFolder(
  dirHandle: FileSystemDirectoryHandle,
  basePath = ''
): Promise<LocalFileItem[]> {
  const items: LocalFileItem[] = [];

  try {
    for await (const entry of (dirHandle as any).values()) {
      const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;

      if (entry.kind === 'directory') {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) {
          continue;
        }

        const children = await scanLocalFolder(entry as FileSystemDirectoryHandle, currentPath);
        items.push({
          name: entry.name,
          path: currentPath,
          kind: 'directory',
          handle: entry,
          children,
        });
      } else if (entry.kind === 'file') {
        const dotIdx = entry.name.lastIndexOf('.');
        const ext = dotIdx !== -1 ? entry.name.slice(dotIdx).toLowerCase() : '';

        if (ALLOWED_EXTENSIONS.has(ext)) {
          let size = 0;
          let lastModified = Date.now();
          try {
            const file = await (entry as FileSystemFileHandle).getFile();
            size = file.size;
            lastModified = file.lastModified;
          } catch {
            // Ignore stat errors
          }

          items.push({
            name: entry.name,
            path: currentPath,
            kind: 'file',
            handle: entry,
            size,
            lastModified,
          });
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to scan folder at path ${basePath}:`, err);
  }

  // Sort: directories first, then alphabetical by name
  return items.sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Reads text content of a local file
 */
export async function readLocalFile(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile();
  return await file.text();
}

/**
 * Directly writes text content back to the physical disk file
 */
export async function writeLocalFile(fileHandle: FileSystemFileHandle, content: string): Promise<boolean> {
  try {
    const writable = await (fileHandle as any).createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.error('Failed to write local file:', err);
    return false;
  }
}

/**
 * Creates a new markdown file inside a DirectoryHandle
 */
export async function createLocalFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  initialContent = '# ' + filename.replace(/\.md$/i, '') + '\n\n'
): Promise<FileSystemFileHandle> {
  let cleanName = filename.trim();
  if (!cleanName.endsWith('.md')) {
    cleanName += '.md';
  }

  const fileHandle = await dirHandle.getFileHandle(cleanName, { create: true });
  await writeLocalFile(fileHandle, initialContent);
  return fileHandle;
}
