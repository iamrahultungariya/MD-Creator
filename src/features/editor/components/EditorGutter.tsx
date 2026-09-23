import React from 'react';

interface EditorGutterProps {
  gutterRef: React.RefObject<HTMLDivElement | null>;
  lineCount: number;
  isTypewriterMode: boolean;
  visibleLineSlice: {
    totalHeight: number;
    topOffset: number;
    lines: number[];
  };
  lineHeight?: number;
}

export const EditorGutter: React.FC<EditorGutterProps> = React.memo(({
  gutterRef,
  lineCount,
  isTypewriterMode,
  visibleLineSlice,
  lineHeight = 24,
}) => {
  return (
    <div
      ref={gutterRef}
      className={`hidden sm:block select-none overflow-hidden text-right font-mono-code text-xs text-neutral-400 dark:text-neutral-600 transition-all ${
        lineCount >= 10000 ? 'w-16 pr-3 pl-2' : lineCount >= 1000 ? 'w-14 pr-3 pl-2' : 'w-12 pr-3 pl-2'
      } ${isTypewriterMode ? 'pt-[25vh] pb-[50vh]' : 'py-6'}`}
      style={{ scrollbarWidth: 'none' }}
      aria-hidden="true"
    >
      <div style={{ height: `${visibleLineSlice.totalHeight}px`, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: `${visibleLineSlice.topOffset}px`,
            left: 0,
            right: 0,
          }}
        >
          {visibleLineSlice.lines.map((num) => (
            <div
              key={num}
              style={{ height: `${lineHeight}px`, lineHeight: `${lineHeight}px` }}
              className="tabular-nums"
            >
              {num}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

EditorGutter.displayName = 'EditorGutter';
