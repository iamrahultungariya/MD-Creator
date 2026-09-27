import React, { useState, useEffect, useRef } from 'react';
import { MarkdownPreview } from '../../../components/editor/MarkdownPreview';
import { FontFamily, MarginSize, PageSize, PdfPreset, TocItem } from '../types';

interface PdfExportPreviewProps {
  zoomLevel: number;
  includeCoverPage: boolean;
  coverOrg: string;
  preset: PdfPreset;
  accentColor: string;
  documentTitle: string;
  coverSubtitle: string;
  coverAuthor: string;
  fontFamily: FontFamily;
  pageSize?: PageSize;
  margins?: MarginSize;
  watermarkText: string;
  includeToc: boolean;
  tableOfContents: TocItem[];
  includePageNumbers: boolean;
  documentContent: string;
}

export const PdfExportPreview: React.FC<PdfExportPreviewProps> = React.memo(({
  zoomLevel,
  includeCoverPage,
  coverOrg,
  preset,
  accentColor,
  documentTitle,
  coverSubtitle,
  coverAuthor,
  fontFamily,
  pageSize = 'a4',
  margins = 'normal',
  watermarkText,
  includeToc,
  tableOfContents,
  includePageNumbers,
  documentContent,
}) => {
  const currentFontFamilyCss =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const marginPaddingClass =
    margins === 'compact'
      ? 'p-6 sm:p-8'
      : margins === 'wide'
      ? 'p-10 sm:p-14'
      : 'p-8 sm:p-12';

  const maxSheetWidth = pageSize === 'letter' ? 'max-w-[816px]' : 'max-w-[794px]';
  const minSheetHeight = pageSize === 'letter' ? 'min-h-[1056px]' : 'min-h-[1123px]';

  // Dynamic pagination state
  const [paginatedPages, setPaginatedPages] = useState<string[][] | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Measure rendered blocks and paginate content based on printable sheet height
  useEffect(() => {
    const sandbox = measureRef.current;
    if (!sandbox) return;

    const paginateContent = () => {
      const previewRoot = sandbox.querySelector('[data-markdown-preview="true"]') || sandbox;
      const childNodes = Array.from(previewRoot.children) as HTMLElement[];

      if (childNodes.length === 0) {
        setPaginatedPages(null);
        return;
      }

      // Page dimensions in CSS pixels (at standard 96 DPI)
      // A4: 794px x 1123px. US Letter: 816px x 1056px.
      const totalSheetHeight = pageSize === 'letter' ? 1056 : 1123;
      const paddingY = margins === 'compact' ? 56 : margins === 'wide' ? 100 : 76;
      const headerFooterSpace = includePageNumbers ? 106 : 36;
      const usableContentHeight = totalSheetHeight - paddingY - headerFooterSpace;

      const pages: string[][] = [];
      let currentPageBlocks: string[] = [];
      let currentHeight = 0;

      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        const computedStyle = window.getComputedStyle(child);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        const blockHeight = child.offsetHeight + marginTop + marginBottom;
        const isHeading = /^H[1-6]$/i.test(child.tagName);

        // Avoid orphan heading near sheet bottom if remaining space is less than 65px
        const orphanHeading = isHeading && (currentHeight + blockHeight + 65 > usableContentHeight);

        if (currentPageBlocks.length > 0 && (currentHeight + blockHeight > usableContentHeight || orphanHeading)) {
          pages.push(currentPageBlocks);
          currentPageBlocks = [child.outerHTML];
          currentHeight = blockHeight;
        } else {
          currentPageBlocks.push(child.outerHTML);
          currentHeight += blockHeight;
        }
      }

      if (currentPageBlocks.length > 0) {
        pages.push(currentPageBlocks);
      }

      setPaginatedPages(pages.length > 0 ? pages : null);
    };

    // Delay slightly to let KaTeX formulas, highlight.js, and typography compute layouts
    const timer = setTimeout(paginateContent, 75);
    return () => clearTimeout(timer);
  }, [documentContent, pageSize, margins, fontFamily, preset, includePageNumbers]);

  return (
    <div 
      className="flex-1 h-full min-h-0 w-full bg-neutral-100 dark:bg-neutral-950 overflow-y-auto overflow-x-auto p-2 sm:p-6 md:p-8 flex justify-center items-start pdf-studio-scroll-container"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Hidden Measuring Sandbox (Runs offscreen with identical styling) */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className={`fixed -left-[9999px] top-0 ${maxSheetWidth} ${marginPaddingClass} ${currentFontFamilyCss} opacity-0 pointer-events-none z-[-9999]`}
        style={{ width: pageSize === 'letter' ? '816px' : '794px' }}
      >
        <div
          className={`prose prose-neutral max-w-none text-[#111827] prose-headings:text-[#030712] prose-p:text-[#111827] prose-li:text-[#111827] prose-strong:text-[#030712] prose-table:w-full prose-table:table-auto prose-td:text-[#111827] prose-td:break-words prose-th:text-[#030712] prose-th:break-words ${
            preset === 'technical' ? 'prose-headings:font-mono' : ''
          }`}
        >
          <MarkdownPreview content={documentContent} className="text-[#111827] text-sm" />
        </div>
      </div>

      {/* Main Studio Preview Canvas Container */}
      <div
        data-pdf-zoom-container="true"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className={`w-full ${maxSheetWidth} flex flex-col gap-6 sm:gap-10 shadow-2xl relative my-2 shrink-0`}
      >
        {/* SHEET: COVER PAGE (If Enabled) */}
        {includeCoverPage && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="pdf-page-indicator w-full flex items-center justify-between px-2 text-xs font-mono text-neutral-400 select-none">
              <span>Cover Sheet</span>
              <span className="uppercase text-[10px] tracking-wider text-neutral-400 font-semibold">
                {preset.toUpperCase()} SPECIFICATION
              </span>
            </div>

            <div
              id="pdf-render-cover"
              data-pdf-sheet="true"
              className={`pdf-paper-sheet bg-white text-neutral-900 rounded-sm shadow-xl p-10 sm:p-14 ${minSheetHeight} w-full flex flex-col justify-between relative overflow-hidden border border-neutral-200 ${currentFontFamilyCss}`}
              style={{ borderTop: `12px solid ${accentColor}` }}
            >
              {/* Watermark in Canvas */}
              {watermarkText && (
                <div className="canvas-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                  <span className="text-7xl font-black text-neutral-200 tracking-widest uppercase rotate-[-35deg] opacity-40">
                    {watermarkText}
                  </span>
                </div>
              )}

              {/* Top Org Banner */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4 shrink-0">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  {coverOrg || 'Technical Publication'}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Center Hero Title */}
              <div className="my-auto space-y-4 max-w-xl">
                <div
                  className="inline-block px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider mb-2"
                  style={{ backgroundColor: accentColor }}
                >
                  {preset.toUpperCase()} SPECIFICATION
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-950 leading-tight">
                  {documentTitle}
                </h1>
                {coverSubtitle && (
                  <p className="text-lg text-neutral-600 font-medium leading-relaxed">
                    {coverSubtitle}
                  </p>
                )}
              </div>

              {/* Bottom Author Strip */}
              <div className="border-t border-neutral-200 pt-6 flex items-center justify-between shrink-0">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold">Author</div>
                  <div className="text-sm font-bold text-neutral-900">{coverAuthor || 'Engineering Team'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold">Engine</div>
                  <div className="text-xs font-mono text-neutral-600">MD Creator Studio v2</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SHEET: TABLE OF CONTENTS (If Enabled) */}
        {includeToc && tableOfContents.length > 0 && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="pdf-page-indicator w-full flex items-center justify-between px-2 text-xs font-mono text-neutral-400 select-none">
              <span>Table of Contents</span>
              <span className="uppercase text-[10px] tracking-wider text-neutral-400 font-semibold">
                INDEX &bull; {tableOfContents.length} HEADINGS
              </span>
            </div>

            <div
              id="pdf-render-toc"
              data-pdf-sheet="true"
              className={`pdf-paper-sheet bg-white text-neutral-900 rounded-sm shadow-xl p-12 ${minSheetHeight} w-full relative border border-neutral-200 ${currentFontFamilyCss}`}
              style={{ borderLeft: `6px solid ${accentColor}` }}
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-8">
                <h2 className="text-xl font-bold tracking-tight text-neutral-950">
                  Table of Contents
                </h2>
                <span className="text-xs font-mono text-neutral-500">{documentTitle}</span>
              </div>

              <div className="space-y-3">
                {tableOfContents.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-baseline justify-between text-xs py-1 ${
                      item.level === 1
                        ? 'font-bold text-neutral-950 border-b border-neutral-200 pb-1 mt-3'
                        : item.level === 2
                        ? 'pl-4 text-neutral-700 font-medium'
                        : 'pl-8 text-neutral-600'
                    }`}
                  >
                    <span className="truncate pr-4">{item.title}</span>
                    <div className="flex-1 border-b border-dotted border-neutral-300 mx-2" />
                    <span className="font-mono text-[11px] font-semibold text-neutral-500 min-w-[20px] text-right">{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SHEETS: PAGINATED BODY CONTENT */}
        {paginatedPages && paginatedPages.length > 0 ? (
          paginatedPages.map((pageBlocks, pageIdx) => {
            const pageNum = pageIdx + 1;
            const totalBodyPages = paginatedPages.length;

            return (
              <div key={pageIdx} className="flex flex-col items-center gap-2 w-full">
                {/* Visual Sheet Bar Indicator */}
                <div className="pdf-page-indicator w-full flex items-center justify-between px-2 text-xs font-mono text-neutral-400 select-none">
                  <span>Page {pageNum} of {totalBodyPages}</span>
                  <span className="uppercase text-[10px] tracking-wider text-neutral-400 font-semibold">
                    {pageSize.toUpperCase()} &bull; {margins.toUpperCase()} MARGINS
                  </span>
                </div>

                {/* Discrete Physical Sheet */}
                <div
                  id={`pdf-render-body-page-${pageIdx}`}
                  data-pdf-sheet="true"
                  className={`pdf-paper-sheet bg-white text-neutral-900 rounded-sm shadow-xl ${marginPaddingClass} ${minSheetHeight} w-full flex flex-col justify-between relative border border-neutral-200 ${currentFontFamilyCss}`}
                >
                  {/* Watermark in Canvas */}
                  {watermarkText && (
                    <div className="canvas-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                      <span className="text-7xl font-black text-neutral-200 tracking-widest uppercase rotate-[-35deg] opacity-30">
                        {watermarkText}
                      </span>
                    </div>
                  )}

                  {/* Running Header */}
                  {includePageNumbers && (
                    <div className="pdf-running-header flex items-center justify-between text-[11px] text-neutral-500 border-b border-neutral-200 pb-3 mb-6 font-mono shrink-0">
                      <span className="truncate max-w-[65%]">{documentTitle}</span>
                      <span className="shrink-0">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}

                  {/* Document Body for this page */}
                  <div
                    className={`prose prose-neutral max-w-none flex-1 text-[#111827] prose-headings:text-[#030712] prose-p:text-[#111827] prose-li:text-[#111827] prose-strong:text-[#030712] prose-table:w-full prose-table:table-auto prose-td:text-[#111827] prose-td:break-words prose-th:text-[#030712] prose-th:break-words ${
                      preset === 'technical' ? 'prose-headings:font-mono' : ''
                    }`}
                    style={{
                      ['--tw-prose-links' as any]: accentColor,
                      ['--tw-prose-headings' as any]: preset === 'corporate' ? accentColor : undefined,
                    }}
                    dangerouslySetInnerHTML={{ __html: pageBlocks.join('') }}
                  />

                  {/* Running Footer with accurate Page X of Y */}
                  {includePageNumbers && (
                    <div className="pdf-running-footer flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-200 pt-3 mt-auto font-mono shrink-0">
                      <span>Published with MD Creator</span>
                      <span className="font-semibold text-neutral-700">Page {pageNum} of {totalBodyPages}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Initial / Single Sheet Fallback */
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="pdf-page-indicator w-full flex items-center justify-between px-2 text-xs font-mono text-neutral-400 select-none">
              <span>Page 1 of 1</span>
              <span className="uppercase text-[10px] tracking-wider text-neutral-400 font-semibold">
                {pageSize.toUpperCase()} &bull; {margins.toUpperCase()} MARGINS
              </span>
            </div>

            <div
              id="pdf-render-body"
              data-pdf-sheet="true"
              className={`pdf-paper-sheet bg-white text-neutral-900 rounded-sm shadow-xl ${marginPaddingClass} ${minSheetHeight} w-full flex flex-col justify-between relative border border-neutral-200 ${currentFontFamilyCss}`}
            >
              {watermarkText && (
                <div className="canvas-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                  <span className="text-7xl font-black text-neutral-200 tracking-widest uppercase rotate-[-35deg] opacity-30">
                    {watermarkText}
                  </span>
                </div>
              )}

              {includePageNumbers && (
                <div className="pdf-running-header flex items-center justify-between text-[11px] text-neutral-500 border-b border-neutral-200 pb-3 mb-6 font-mono shrink-0">
                  <span className="truncate max-w-[65%]">{documentTitle}</span>
                  <span className="shrink-0">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              <div
                className={`prose prose-neutral max-w-none flex-1 text-[#111827] prose-headings:text-[#030712] prose-p:text-[#111827] prose-li:text-[#111827] prose-strong:text-[#030712] prose-table:w-full prose-table:table-auto prose-td:text-[#111827] prose-td:break-words prose-th:text-[#030712] prose-th:break-words ${
                  preset === 'technical' ? 'prose-headings:font-mono' : ''
                }`}
                style={{
                  ['--tw-prose-links' as any]: accentColor,
                  ['--tw-prose-headings' as any]: preset === 'corporate' ? accentColor : undefined,
                }}
              >
                <MarkdownPreview content={documentContent} className="text-[#111827] text-sm" />
              </div>

              {includePageNumbers && (
                <div className="pdf-running-footer flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-200 pt-3 mt-auto font-mono shrink-0">
                  <span>Published with MD Creator</span>
                  <span className="font-semibold text-neutral-700">Page 1 of 1</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

PdfExportPreview.displayName = 'PdfExportPreview';
