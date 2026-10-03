import { EditorView, Decoration, DecorationSet, ViewPlugin, MatchDecorator, ViewUpdate } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { EditorFontFamily, EditorLineHeight } from '../../../stores/usePreferencesStore';

// Subtle dimming of inactive paragraphs during typewriter / focus mode
const dimmedLineDecoration = Decoration.line({
  class: 'cm-dimmed-line',
});

export function createFocusDimmingExtension(enabled: boolean) {
  if (!enabled) return [];

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const doc = view.state.doc;
        const head = view.state.selection.main.head;
        const currentLine = doc.lineAt(head);

        // Find contiguous non-empty paragraph boundaries around cursor
        let startLineNum = currentLine.number;
        while (startLineNum > 1 && doc.line(startLineNum - 1).text.trim().length > 0) {
          startLineNum--;
        }

        let endLineNum = currentLine.number;
        while (endLineNum < doc.lines && doc.line(endLineNum + 1).text.trim().length > 0) {
          endLineNum++;
        }

        for (const { from, to } of view.visibleRanges) {
          let pos = from;
          while (pos <= to && pos <= doc.length) {
            const line = doc.lineAt(pos);
            if (line.number < startLineNum || line.number > endLineNum) {
              builder.add(line.from, line.from, dimmedLineDecoration);
            }
            if (line.to >= doc.length) break;
            pos = line.to + 1;
          }
        }

        return builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

export const getEditorTypographyTheme = (
  fontFamily: EditorFontFamily,
  fontSize: number,
  lineHeight: EditorLineHeight
) => {
  let fontStack = "'Geist Mono Variable', 'Geist Mono', ui-monospace, SFMono-Regular, monospace";
  if (fontFamily === 'JetBrains Mono') {
    fontStack = "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace";
  } else if (fontFamily === 'Consolas') {
    fontStack = "Consolas, 'Courier New', monospace";
  } else if (fontFamily === 'monospace') {
    fontStack = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  }

  const lhValue = lineHeight === 'compact' ? '1.5' : lineHeight === 'relaxed' ? '2.0' : '1.75';

  return EditorView.theme({
    '&': {
      fontSize: `${fontSize}px`,
      fontFamily: fontStack,
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      lineHeight: lhValue,
    },
    '.cm-content': {
      fontFamily: 'inherit',
    },
  });
};

// CodeMirror live highlight marker decorator for ==highlight== syntax
export const highlightDecorator = new MatchDecorator({
  regexp: /(?<!=)==(?!=)([^=\r\n]+?)(?<!=)==(?!=)/g,
  decoration: Decoration.mark({ class: 'cm-md-highlight' }),
});

export const highlightViewPlugin = ViewPlugin.fromClass(
  class {
    decorations;
    constructor(view: EditorView) {
      this.decorations = highlightDecorator.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.decorations = highlightDecorator.updateDeco(update, this.decorations);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
