export interface CodeMirrorEditorHandle {
  focus: () => void;
  getValue: () => string;
  setValue: (val: string) => void;
  getSelection: () => string;
  replaceSelection: (text: string) => void;
  setCursor: (offset: number) => void;
  setSelectionRange: (from: number, to: number) => void;
  scrollToLine: (lineIndex: number) => void;
  getDOMNode: () => HTMLElement | null;
  getSelectionStart: () => number;
  getSelectionEnd: () => number;
  getScrollDOM: () => HTMLElement | null;
  scrollToRatio: (ratio: number) => void;
  getScrollRatio: () => number;
  getCaretCoords: () => { left: number; top: number; bottom: number } | null;
  flush: () => void;
}

export interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange?: (pos: { line: number; col: number; offset: number }) => void;
  onSlashTrigger?: (query: string, pos: number) => void;
  onScroll?: (event: Event, scrollDOM: HTMLElement) => void;
  showLineNumbers?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onPasteImage?: (file: File) => void;
  onDropImage?: (file: File) => void;
  onKeyDown?: (e: KeyboardEvent) => boolean | void;
  onToast?: (message: string) => void;
  onVimModeChange?: (mode: 'NORMAL' | 'INSERT' | 'VISUAL' | 'REPLACE') => void;
  editorRef?: React.RefObject<CodeMirrorEditorHandle | null>;
}
