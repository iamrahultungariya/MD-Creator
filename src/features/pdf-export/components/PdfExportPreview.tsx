import React, { useState, useRef, useEffect } from 'react';
import { MarkdownPreview } from '../../../components/editor/MarkdownPreview';
import { FontFamily, MarginSize, PageSize, PdfPreset, PdfTheme, TocItem } from '../types';

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
  pdfTheme?: PdfTheme;
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
  pdfTheme = 'light',
}) => {
  const isDarkPdf = pdfTheme === 'dark';
  const currentFontFamilyCss =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const marginPaddingClass =
    margins === 'compact'
      ? 'p-6 sm:p-10'
      : margins === 'wide'
      ? 'p-10 sm:p-16'
      : 'p-8 sm:p-12';

  const maxSheetWidth = pageSize === 'letter' ? 'max-w-[816px]' : 'max-w-[794px]';
  const minSheetHeight = pageSize === 'letter' ? 'min-h-[1056px]' : 'min-h-[1123px]';

  const [pagesHtml, setPagesHtml] = useState<string[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  // Paginate markdown DOM blocks into authentic A4/Letter sheets
  useEffect(() => {
    if (!measureRef.current) return;
    const previewRoot = measureRef.current.querySelector('[data-markdown-preview="true"]');
    if (!previewRoot) return;

    const blocks = Array.from(previewRoot.children) as HTMLElement[];
    if (blocks.length === 0) {
      setPagesHtml(['<p class="opacity-40 italic">Empty document</p>']);
      return;
    }

    const paddingY = margins === 'compact' ? 24 : margins === 'wide' ? 48 : 32;
    const headerFooterOverhead = includePageNumbers ? 116 : 0;
    const targetSheetHeight = pageSize === 'letter' ? 1056 : 1123;
    const maxPageHeight = targetSheetHeight - (paddingY * 2) - headerFooterOverhead - 24;

    const pages: string[] = [];
    let currentPageBlocks: string[] = [];
    let currentPageHeight = 0;

    for (let i = 0; i < blocks.length; i++) {
      const el = blocks[i];
      if (!el) continue;

      // Handle explicit HR page break (---)
      if (el.tagName.toLowerCase() === 'hr') {
        if (currentPageBlocks.length > 0) {
          pages.push(currentPageBlocks.join(''));
          currentPageBlocks = [];
          currentPageHeight = 0;
        }
        continue;
      }

      const computed = window.getComputedStyle(el);
      const marginTop = parseFloat(computed.marginTop) || 0;
      const marginBottom = parseFloat(computed.marginBottom) || 0;
      const height = el.getBoundingClientRect().height + marginTop + marginBottom;

      const isHeading = /^H[1-6]$/i.test(el.tagName);
      const nextEl = blocks[i + 1] as HTMLElement | undefined;
      const nextHeight = nextEl ? nextEl.getBoundingClientRect().height : 0;

      const wouldOverflow = currentPageHeight + height > maxPageHeight;
      const isOrphanHeading = isHeading && (
        (currentPageHeight + height + Math.min(nextHeight, 80) > maxPageHeight) ||
        (maxPageHeight - currentPageHeight < 110)
      );

      if (currentPageBlocks.length > 0 && (wouldOverflow || isOrphanHeading)) {
        pages.push(currentPageBlocks.join(''));
        currentPageBlocks = [el.outerHTML];
        currentPageHeight = height;
      } else {
        currentPageBlocks.push(el.outerHTML);
        currentPageHeight += height;
      }
    }

    if (currentPageBlocks.length > 0) {
      pages.push(currentPageBlocks.join(''));
    }

    setPagesHtml(pages);
  }, [
    documentContent,
    pageSize,
    margins,
    fontFamily,
    preset,
    isDarkPdf,
    includePageNumbers,
  ]);

  return (
    <div 
      className="flex-1 h-full min-h-0 w-full bg-neutral-100 dark:bg-[#0c0912] overflow-y-auto overflow-x-auto p-4 sm:p-8 md:p-10 flex justify-center items-start pdf-studio-scroll-container"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Main Studio Preview Canvas Container */}
      <div
        data-pdf-zoom-container="true"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className={`w-full ${maxSheetWidth} flex flex-col gap-8 shadow-2xl relative my-2 shrink-0`}
      >
        {/* SHEET 1: COVER PAGE (If Enabled) */}
        {includeCoverPage && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="pdf-page-indicator w-full flex items-center justify-between px-2 text-xs font-mono text-neutral-400 select-none">
              <span>Cover Sheet</span>
              <span className="uppercase text-[10px] tracking-wider font-semibold text-brand-600 dark:text-brand-400">
                {preset.toUpperCase()} SPECIFICATION
              </span>
            </div>

            <div
              id="pdf-render-cover"
              data-pdf-sheet="true"
              className={`pdf-paper-sheet ${
                isDarkPdf ? 'bg-[#15111E] text-white border-[#2A2338] pdf-theme-dark' : 'bg-white text-neutral-900 border-neutral-200 pdf-theme-light'
              } rounded-md shadow-xl p-10 sm:p-16 ${minSheetHeight} w-full flex flex-col justify-between relative overflow-hidden border ${currentFontFamilyCss}`}
              style={{ borderTop: `10px solid ${accentColor}` }}
            >
              {/* Watermark in Canvas */}
              {watermarkText && (
                <div className="canvas-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                  <span className={`text-7xl font-black ${isDarkPdf ? 'text-neutral-800' : 'text-neutral-200'} tracking-widest uppercase rotate-[-35deg] opacity-35`}>
                    {watermarkText}
                  </span>
                </div>
              )}

              {/* Top Org Banner */}
              <div className={`flex items-center justify-between border-b ${isDarkPdf ? 'border-neutral-800' : 'border-neutral-200'} pb-4 shrink-0`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${isDarkPdf ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {coverOrg || 'Technical Publication'}
                </span>
                <span className={`text-xs font-mono ${isDarkPdf ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Center Hero Title */}
              <div className="my-auto space-y-4 max-w-xl">
                <div
                  className="inline-block px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider mb-2 shadow-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  {preset.toUpperCase()} SPECIFICATION
                </div>
                <h1 className={`text-4xl sm:text-5xl font-black tracking-tight leading-tight ${isDarkPdf ? 'text-white' : 'text-neutral-950'}`}>
                  {documentTitle}
                </h1>
                {coverSubtitle && (
                  <p className={`text-lg font-medium leading-relaxed ${isDarkPdf ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    {coverSubtitle}
                  </p>
                )}
              </div>

              {/* Bottom Author Strip */}
              <div className={`border-t ${isDarkPdf ? 'border-neutral-800' : 'border-neutral-200'} pt-6 flex items-center justify-between shrink-0`}>
                <div>
                  <div className={`text-[11px] uppercase tracking-wider font-bold ${isDarkPdf ? 'text-neutral-400' : 'text-neutral-500'}`}>Author</div>
                  <div className={`text-sm font-bold ${isDarkPdf ? 'text-neutral-100' : 'text-neutral-900'}`}>{coverAuthor || 'Engineering Team'}</div>
                </div>
                <div className="text-right">
                  <div className={`text-[11px] uppercase tracking-wider font-bold ${isDarkPdf ? 'text-neutral-400' : 'text-neutral-500'}`}>Engine</div>
                  <div className={`text-xs font-mono ${isDarkPdf ? 'text-neutral-400' : 'text-neutral-600'}`}>MD Writer Studio</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SHEET 2: TABLE OF CONTENTS (If Enabled) */}
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
              className={`pdf-paper-sheet ${
                isDarkPdf ? 'bg-[#15111E] text-neutral-100 border-[#2A2338] pdf-theme-dark' : 'bg-white text-neutral-900 border-neutral-200 pdf-theme-light'
              } rounded-md shadow-xl p-12 ${minSheetHeight} w-full relative border ${currentFontFamilyCss}`}
              style={{ borderLeft: `6px solid ${accentColor}` }}
            >
              <div className={`flex items-center justify-between border-b ${isDarkPdf ? 'border-neutral-800' : 'border-neutral-200'} pb-3 mb-8`}>
                <h2 className={`text-xl font-bold tracking-tight ${isDarkPdf ? 'text-white' : 'text-neutral-950'}`}>
                  Table of Contents
                </h2>
                <span className={`text-xs font-mono ${isDarkPdf ? 'text-neutral-400' : 'text-neutral-500'}`}>{documentTitle}</span>
              </div>

              <div className="space-y-3">
                {tableOfContents.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-baseline justify-between text-xs py-1 ${
                      item.level === 1
                        ? (isDarkPdf ? 'font-bold text-white border-b border-neutral-800 pb-1 mt-3' : 'font-bold text-neutral-950 border-b border-neutral-200 pb-1 mt-3')
                        : item.level === 2
                        ? (isDarkPdf ? 'pl-4 text-neutral-300 font-medium' : 'pl-4 text-neutral-700 font-medium')
                        : (isDarkPdf ? 'pl-8 text-neutral-400' : 'pl-8 text-neutral-600')
                    }`}
                  >
                    <span className="truncate pr-4">{item.title}</span>
                    <div className={`flex-1 border-b border-dotted ${isDarkPdf ? 'border-neutral-700' : 'border-neutral-300'} mx-2`} />
                    <span className={`font-mono text-[11px] font-semibold ${isDarkPdf ? 'text-neutral-400' : 'text-neutral-500'} min-w-[20px] text-right`}>{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT BODY SHEETS (Authentic Multi-Page Sheets with Clean Breaks) */}
        {pagesHtml.length === 0 ? (
          /* Fallback before DOM measurement settles */
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="pdf-page-indicator w-full flex items-center justify-between px-2 text-xs font-mono text-neutral-400 select-none">
              <span>Document Content</span>
              <span className="uppercase text-[10px] tracking-wider text-neutral-400 font-semibold">
                {pageSize.toUpperCase()} &bull; {margins.toUpperCase()} MARGINS &bull; {fontFamily.toUpperCase()}
              </span>
            </div>

            <div
              id="pdf-render-body"
              data-pdf-sheet="true"
              className={`pdf-paper-sheet ${
                isDarkPdf ? 'bg-[#15111E] text-neutral-100 border-[#2A2338] pdf-theme-dark' : 'bg-white text-neutral-900 border-neutral-200 pdf-theme-light'
              } rounded-md shadow-xl ${marginPaddingClass} ${minSheetHeight} w-full flex flex-col justify-between relative border ${currentFontFamilyCss}`}
            >
              {watermarkText && (
                <div className="canvas-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                  <span className={`text-7xl font-black ${isDarkPdf ? 'text-neutral-800' : 'text-neutral-200'} tracking-widest uppercase rotate-[-35deg] opacity-25`}>
                    {watermarkText}
                  </span>
                </div>
              )}

              {includePageNumbers && (
                <div className={`pdf-running-header flex items-center justify-between text-[11px] ${isDarkPdf ? 'text-neutral-400 border-neutral-800' : 'text-neutral-500 border-neutral-200'} border-b pb-3 mb-6 font-mono shrink-0`}>
                  <span className="truncate max-w-[65%] font-medium">{documentTitle}</span>
                  <span className="shrink-0">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              <div
                className={`pdf-prose-content ${
                  isDarkPdf ? 'prose prose-invert text-[#EDEAF5] prose-headings:text-white prose-p:text-[#EDEAF5] prose-li:text-[#EDEAF5] prose-strong:text-white' : 'prose prose-neutral text-[#1B1626] prose-headings:text-[#1B1626] prose-p:text-[#1B1626] prose-li:text-[#1B1626] prose-strong:text-[#1B1626]'
                } max-w-none flex-1 prose-table:w-full prose-table:table-auto prose-td:break-words prose-th:break-words ${
                  preset === 'technical' ? 'prose-headings:font-mono' : ''
                }`}
                style={{
                  ['--tw-prose-links' as any]: accentColor,
                  ['--tw-prose-headings' as any]: preset === 'corporate' ? accentColor : undefined,
                }}
              >
                <MarkdownPreview 
                  content={documentContent} 
                  className={isDarkPdf ? 'text-[#EDEAF5] text-sm' : 'text-[#1B1626] text-sm'} 
                  forceTheme={isDarkPdf ? 'dark' : 'light'}
                />
              </div>

              {includePageNumbers && (
                <div className={`pdf-running-footer flex items-center justify-between text-[10px] ${isDarkPdf ? 'text-neutral-400 border-neutral-800' : 'text-neutral-500 border-neutral-200'} border-t pt-3 mt-8 font-mono shrink-0`}>
                  <span>Published with MD Writer</span>
                  <span className={`font-semibold ${isDarkPdf ? 'text-neutral-300' : 'text-neutral-700'}`}>Document Sheet</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          pagesHtml.map((pageHtml, pageIdx) => (
            <div key={pageIdx} className="flex flex-col items-center gap-2 w-full">
              <div className="pdf-page-indicator w-full flex items-center justify-between px-2 text-xs font-mono text-neutral-400 select-none">
                <span>Document Content &bull; Page {pageIdx + 1} of {pagesHtml.length}</span>
                <span className="uppercase text-[10px] tracking-wider text-neutral-400 font-semibold">
                  {pageSize.toUpperCase()} &bull; {margins.toUpperCase()} MARGINS &bull; {fontFamily.toUpperCase()}
                </span>
              </div>

              <div
                id={`pdf-render-page-${pageIdx + 1}`}
                data-pdf-sheet="true"
                className={`pdf-paper-sheet ${
                  isDarkPdf ? 'bg-[#15111E] text-neutral-100 border-[#2A2338] pdf-theme-dark' : 'bg-white text-neutral-900 border-neutral-200 pdf-theme-light'
                } rounded-md shadow-xl ${marginPaddingClass} ${minSheetHeight} w-full flex flex-col justify-between relative border ${currentFontFamilyCss}`}
              >
                {watermarkText && (
                  <div className="canvas-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                    <span className={`text-7xl font-black ${isDarkPdf ? 'text-neutral-800' : 'text-neutral-200'} tracking-widest uppercase rotate-[-35deg] opacity-25`}>
                      {watermarkText}
                    </span>
                  </div>
                )}

                {/* Running Header */}
                {includePageNumbers && (
                  <div className={`pdf-running-header flex items-center justify-between text-[11px] ${isDarkPdf ? 'text-neutral-400 border-neutral-800' : 'text-neutral-500 border-neutral-200'} border-b pb-3 mb-6 font-mono shrink-0`}>
                    <span className="truncate max-w-[65%] font-medium">{documentTitle}</span>
                    <span className="shrink-0">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}

                {/* Live Markdown Rendering for this page */}
                <div
                  className={`pdf-prose-content ${
                    isDarkPdf ? 'prose prose-invert text-[#EDEAF5] prose-headings:text-white prose-p:text-[#EDEAF5] prose-li:text-[#EDEAF5] prose-strong:text-white' : 'prose prose-neutral text-[#1B1626] prose-headings:text-[#1B1626] prose-p:text-[#1B1626] prose-li:text-[#1B1626] prose-strong:text-[#1B1626]'
                  } max-w-none flex-1 prose-table:w-full prose-table:table-auto prose-td:break-words prose-th:break-words ${
                    preset === 'technical' ? 'prose-headings:font-mono' : ''
                  }`}
                  style={{
                    ['--tw-prose-links' as any]: accentColor,
                    ['--tw-prose-headings' as any]: preset === 'corporate' ? accentColor : undefined,
                  }}
                  dangerouslySetInnerHTML={{ __html: pageHtml }}
                />

                {/* Running Footer */}
                {includePageNumbers && (
                  <div className={`pdf-running-footer flex items-center justify-between text-[10px] ${isDarkPdf ? 'text-neutral-400 border-neutral-800' : 'text-neutral-500 border-neutral-200'} border-t pt-3 mt-8 font-mono shrink-0`}>
                    <span>Published with MD Writer</span>
                    <span className={`font-semibold ${isDarkPdf ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Page {pageIdx + 1} of {pagesHtml.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Hidden Off-Screen Container for DOM Measurement & Pagination */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className={`fixed -left-[9999px] top-0 pointer-events-none opacity-0 ${maxSheetWidth} ${marginPaddingClass} ${currentFontFamilyCss}`}
        style={{ width: pageSize === 'letter' ? '816px' : '794px' }}
      >
        <div
          className={`pdf-prose-content ${
            isDarkPdf ? 'prose prose-invert text-[#EDEAF5]' : 'prose prose-neutral text-[#1B1626]'
          } max-w-none`}
        >
          <MarkdownPreview 
            content={documentContent} 
            className={isDarkPdf ? 'text-[#EDEAF5] text-sm' : 'text-[#1B1626] text-sm'} 
            forceTheme={isDarkPdf ? 'dark' : 'light'}
          />
        </div>
      </div>
    </div>
  );
});

PdfExportPreview.displayName = 'PdfExportPreview';
