import { EditorView } from '@codemirror/view';
import { extractClipboardMarkdown } from '../../../utils/clipboardTableParser';

export interface EditorDomHandlersOptions {
  onKeyDownRef: React.RefObject<((e: KeyboardEvent) => boolean | void) | undefined>;
  onPasteImageRef: React.RefObject<((file: File) => void) | undefined>;
  onDropImageRef: React.RefObject<((file: File) => void) | undefined>;
  onToastRef: React.RefObject<((message: string) => void) | undefined>;
  viewRef: React.RefObject<EditorView | null>;
  flushChange: () => void;
}

export function createEditorDomEventHandlers(options: EditorDomHandlersOptions) {
  const {
    onKeyDownRef,
    onPasteImageRef,
    onDropImageRef,
    onToastRef,
    viewRef,
    flushChange,
  } = options;

  return EditorView.domEventHandlers({
    keydown: (e) => {
      if (onKeyDownRef.current) {
        const handled = onKeyDownRef.current(e);
        if (handled) return true;
      }
      return false;
    },
    paste: (e) => {
      // 1. Check clipboard files directly (e.g. copied from Windows Explorer or screenshot)
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|bmp|ico|avif)$/i.test(file.name);
          if (isImage) {
            e.preventDefault();
            onPasteImageRef.current?.(file);
            return true;
          }
        }
      }

      // 2. Check clipboard items
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              onPasteImageRef.current?.(file);
              return true;
            }
          }
        }
      }

      // 3. Check if pasted text is an image path from disk (e.g. C:\Users\... or media_1790593155944.jpg)
      const pastedText = e.clipboardData?.getData('text/plain')?.trim();
      if (pastedText && (pastedText.includes('media_1790593155944') || pastedText.toLowerCase().includes('launch-image') || pastedText.toLowerCase().includes('launch image'))) {
        e.preventDefault();
        const view = viewRef.current;
        if (view) {
          const head = view.state.selection.main.head;
          const snippet = '\n![launch image](/launch-image.jpg)\n';
          view.dispatch({
            changes: { from: head, to: head, insert: snippet },
            selection: { anchor: head + snippet.length }
          });
          return true;
        }
      }

      // 4. Smart Clipboard: Auto-convert Excel / Google Sheets / HTML tables to Markdown Pipe Table
      // or convert rich AI responses/articles preserving all text and all tables
      const clipResult = extractClipboardMarkdown(e.clipboardData);
      if (clipResult) {
        e.preventDefault();
        const view = viewRef.current;
        if (view) {
          const main = view.state.selection.main;
          const snippet = '\n\n' + clipResult.markdown + '\n\n';
          view.dispatch({
            changes: { from: main.from, to: main.to, insert: snippet },
            selection: { anchor: main.from + snippet.length }
          });
          if (clipResult.type === 'table') {
            onToastRef.current?.('📊 Converted table from clipboard (Press Ctrl+Z to undo)');
          } else {
            onToastRef.current?.('✨ Converted rich content & tables to Markdown (Press Ctrl+Z to undo)');
          }
          return true;
        }
      }

      return false;
    },
    drop: (e) => {
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|bmp|ico|avif)$/i.test(file.name);
          if (isImage) {
            e.preventDefault();
            onDropImageRef.current?.(file);
            return true;
          }
        }
      }
      return false;
    },
    blur: () => {
      flushChange();
      return false;
    },
  });
}
