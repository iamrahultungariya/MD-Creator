import React, { useState, useEffect, useCallback } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus, 
  RefreshCw, 
  Search, 
  X, 
  Unlink, 
  ChevronRight, 
  ChevronDown, 
  HardDrive,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  LocalFileItem, 
  isFileSystemAccessSupported, 
  pickLocalFolder, 
  getStoredDirectoryHandle, 
  clearStoredDirectoryHandle, 
  scanLocalFolder, 
  readLocalFile, 
  createLocalFile 
} from '../../services/localFolderService';

interface LocalFolderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (fileHandle: FileSystemFileHandle, fileName: string, content: string) => void;
  activeFileName?: string;
}

export const LocalFolderDrawer: React.FC<LocalFolderDrawerProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  activeFileName = '',
}) => {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [items, setItems] = useState<LocalFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSupported = isFileSystemAccessSupported();

  // Load stored directory handle on mount
  useEffect(() => {
    if (!isOpen || !isSupported) return;

    getStoredDirectoryHandle()
      .then((handle) => {
        if (handle) {
          setDirHandle(handle);
          refreshFolder(handle);
        }
      })
      .catch(console.warn);
  }, [isOpen, isSupported]);

  const refreshFolder = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const scanned = await scanLocalFolder(handle);
      setItems(scanned);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to scan local folder.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePickFolder = async () => {
    setErrorMsg(null);
    try {
      const handle = await pickLocalFolder();
      if (handle) {
        setDirHandle(handle);
        await refreshFolder(handle);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to open local folder.');
    }
  };

  const handleDisconnect = async () => {
    await clearStoredDirectoryHandle();
    setDirHandle(null);
    setItems([]);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleOpenFile = async (fileHandle: FileSystemFileHandle, fileName: string) => {
    try {
      const text = await readLocalFile(fileHandle);
      onSelectFile(fileHandle, fileName, text);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Could not read file: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleCreateNewFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirHandle || !newFileName.trim()) return;

    try {
      const fileHandle = await createLocalFile(dirHandle, newFileName.trim());
      setIsCreatingFile(false);
      setNewFileName('');
      await refreshFolder(dirHandle);
      const text = await readLocalFile(fileHandle);
      onSelectFile(fileHandle, fileHandle.name, text);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Failed to create file: ${err?.message || 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  // Filter items matching search
  const filterItems = (list: LocalFileItem[], query: string): LocalFileItem[] => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();

    return list
      .map((item) => {
        if (item.kind === 'file') {
          return item.name.toLowerCase().includes(q) ? item : null;
        }
        const filteredChildren = filterItems(item.children || [], query);
        if (filteredChildren.length > 0 || item.name.toLowerCase().includes(q)) {
          return { ...item, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as LocalFileItem[];
  };

  const displayedItems = filterItems(items, searchQuery);

  const renderTree = (list: LocalFileItem[], depth = 0) => {
    return (
      <ul className="space-y-0.5 select-none text-xs">
        {list.map((item) => {
          if (item.kind === 'directory') {
            const isExpanded = expandedFolders.has(item.path) || Boolean(searchQuery.trim());
            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => toggleFolder(item.path)}
                  style={{ paddingLeft: `${depth * 14 + 8}px` }}
                  className="w-full text-left py-1.5 pr-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className="truncate">{item.name}</span>
                </button>
                {isExpanded && item.children && renderTree(item.children, depth + 1)}
              </li>
            );
          }

          const isActive = activeFileName === item.name;
          return (
            <li key={item.path}>
              <button
                type="button"
                onClick={() => handleOpenFile(item.handle as FileSystemFileHandle, item.name)}
                style={{ paddingLeft: `${depth * 14 + 24}px` }}
                className={`w-full text-left py-1.5 pr-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
                title={item.path}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.size !== undefined && (
                  <span className="text-[10px] text-neutral-400 font-mono shrink-0 pl-1">
                    {Math.round(item.size / 1024)}k
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200 text-neutral-800 dark:text-neutral-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Local Folder / Vault
              </h2>
              <p className="text-[11px] text-neutral-500">
                {dirHandle ? dirHandle.name : 'Direct disk sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser capability warning */}
        {!isSupported ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Browser Not Supported
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Direct local folder access requires the File System Access API (available on Chrome, Edge, Brave, and Opera).
              </p>
            </div>
            <p className="text-xs text-neutral-400">
              You can still open single markdown files or install the standalone PWA app!
            </p>
          </div>
        ) : !dirHandle ? (
          /* Empty State: Prompt to connect folder */
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                No Folder Connected
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed px-4">
                Open your Obsidian vault, documentation folder, or Markdown directory to edit files directly on your hard drive.
              </p>
            </div>
            <button
              onClick={handlePickFolder}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Choose Local Folder</span>
            </button>
          </div>
        ) : (
          /* Folder Connected View */
          <>
            {/* Search & Actions Bar */}
            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search folder notes..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700"
                  />
                </div>
                <button
                  onClick={() => refreshFolder(dirHandle)}
                  disabled={isLoading}
                  className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-pointer"
                  title="Rescan folder"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsCreatingFile((prev) => !prev)}
                  className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                  title="New Note in Folder"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline New Note Creation Form */}
              {isCreatingFile && (
                <form onSubmit={handleCreateNewFile} className="flex items-center gap-1.5 pt-1 animate-in fade-in duration-100">
                  <input
                    type="text"
                    autoFocus
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Note-name.md"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-blue-500 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFile(false)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 mx-3 my-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* File Tree List */}
            <div className="flex-1 overflow-y-auto p-3">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                  <span>Scanning local markdown files...</span>
                </div>
              ) : displayedItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  {searchQuery ? 'No matching notes found.' : 'No markdown files (.md) in this folder.'}
                </div>
              ) : (
                renderTree(displayedItems)
              )}
            </div>

            {/* Bottom Footer Action */}
            <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-mono text-[11px] truncate max-w-[200px]" title={dirHandle.name}>
                📁 {dirHandle.name}
              </span>
              <button
                onClick={handleDisconnect}
                className="hover:text-rose-500 flex items-center gap-1 cursor-pointer font-medium"
                title="Disconnect local folder"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
