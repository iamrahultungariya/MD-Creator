import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Printer, Download, X, ZoomIn, ZoomOut, Loader2, Eye, Sliders } from 'lucide-react';
import { 
  PdfPreset, 
  FontFamily, 
  PageSize, 
  MarginSize, 
  PdfTheme,
  ExportPdfModalProps, 
  TocItem 
} from '../types';
import { executePdfPrint, exportDirectPdf } from '../services/pdfPrintService';
import { PdfExportSidebar } from './PdfExportSidebar';
import { PdfExportPreview } from './PdfExportPreview';

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentContent,
}) => {
  // Mobile Tab State ('preview' | 'settings')
  const [mobileTab, setMobileTab] = useState<'preview' | 'settings'>('preview');

  // Document Theme Isolation ('light' | 'dark', defaults to 'light')
  const [pdfTheme, setPdfTheme] = useState<PdfTheme>('light');

  // Preset & Typography state
  const [preset, setPreset] = useState<PdfPreset>('editorial');
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans');
  const [accentColor, setAccentColor] = useState<string>('#4f46e5');
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [margins, setMargins] = useState<MarginSize>('normal');

  // Structural Toggles
  const [includeCoverPage, setIncludeCoverPage] = useState<boolean>(false);
  const [coverSubtitle, setCoverSubtitle] = useState<string>('Technical Architecture & Specifications');
  const [coverAuthor, setCoverAuthor] = useState<string>('Engineering Team');
  const [coverOrg, setCoverOrg] = useState<string>('MD Writer Publishing');

  const [includeToc, setIncludeToc] = useState<boolean>(false);
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>('');

  // Preview zoom: Default to 45% on mobile to fit screen width, 85% on desktop
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 45;
    }
    return 85;
  });

  const handleFitWidth = useCallback(() => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
    const targetWidth = pageSize === 'letter' ? 816 : 794;
    const availableWidth = screenWidth < 640 ? screenWidth - 28 : Math.min(screenWidth - 460, 900);
    const calculated = Math.round((availableWidth / targetWidth) * 100);
    setZoomLevel(Math.max(30, Math.min(125, calculated)));
  }, [pageSize]);

  // Direct download state & progress
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ percent: number; message: string } | null>(null);

  // Extract Table of Contents from markdown headings (H1, H2, H3)
  const tableOfContents = useMemo<TocItem[]>(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;
    while ((match = headingRegex.exec(documentContent)) !== null) {
      items.push({
        level: match[1].length,
        title: match[2].trim(),
      });
    }
    return items;
  }, [documentContent]);

  // Preset switch handler
  const handleSelectPreset = useCallback((p: PdfPreset) => {
    setPreset(p);
    if (p === 'editorial') {
      setFontFamily('sans');
      setAccentColor('#4f46e5');
      setMargins('normal');
    } else if (p === 'technical') {
      setFontFamily('mono');
      setAccentColor('#0f172a');
      setMargins('compact');
    } else if (p === 'academic') {
      setFontFamily('serif');
      setAccentColor('#059669');
      setMargins('wide');
      setIncludeCoverPage(true);
    } else if (p === 'corporate') {
      setFontFamily('sans');
      setAccentColor('#0284c7');
      setMargins('normal');
      setIncludeCoverPage(true);
      setIncludeToc(true);
    } else if (p === 'minimalist') {
      setFontFamily('sans');
      setAccentColor('#0f172a');
      setMargins('wide');
      setIncludeCoverPage(false);
      setIncludeToc(false);
    }
  }, []);

  // 1-Click Direct Download PDF (Triggers direct file download without print popup)
  const handleDirectDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress({ percent: 5, message: 'Initializing PDF...' });
    try {
      await exportDirectPdf({
        documentTitle,
        pageSize,
        pdfTheme,
        onProgress: (percent, message) => {
          setDownloadProgress({ percent, message });
        },
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  }, [documentTitle, pageSize, pdfTheme, isDownloading]);

  // System Print PDF trigger (Opens native browser print dialog)
  const handlePrintPdf = useCallback(() => {
    executePdfPrint({
      documentTitle,
      pageSize,
      margins,
      fontFamily,
      accentColor,
      watermarkText,
      includeCoverPage,
      includeToc: includeToc && tableOfContents.length > 0,
    });
  }, [
    documentTitle,
    pageSize,
    margins,
    fontFamily,
    accentColor,
    watermarkText,
    includeCoverPage,
    includeToc,
    tableOfContents.length,
  ]);

  // Keyboard shortcut listener: Ctrl+P / Cmd+P to print, Ctrl+S to download PDF, Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        handlePrintPdf();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        handleDirectDownload();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose, handlePrintPdf, handleDirectDownload]);

  if (!isOpen) return null;

  return (
    <div
      data-pdf-studio-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
    >
      <div className="w-full h-full max-w-[1550px] max-h-screen sm:max-h-[96vh] m-0 sm:m-4 bg-white dark:bg-neutral-900 border-0 sm:border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-0">
        {/* Studio Top Navigation Bar */}
        <div data-pdf-studio-navbar="true" className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shadow-xs shrink-0">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white truncate">
                  <span className="sm:hidden">PDF Studio</span>
                  <span className="hidden sm:inline">Document Print &amp; PDF Studio</span>
                </h1>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                  Vector
                </span>
              </div>
              <p className="hidden sm:block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                Publication-grade document printing, styling &amp; PDF generation engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(30, prev - 10))}
                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFitWidth}
                className="font-mono font-semibold px-1 min-w-[42px] text-center text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                title="Click to Fit Width"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(125, prev + 10))}
                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct 1-Click Download PDF Button */}
            <button
              type="button"
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer disabled:cursor-not-allowed"
              title="Save document directly as PDF (Ctrl+S / Cmd+S)"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{downloadProgress?.message || 'Generating...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Download <span className="hidden xs:inline">PDF</span></span>
                </>
              )}
            </button>

            {/* System Print Action Button */}
            <button
              type="button"
              onClick={handlePrintPdf}
              disabled={isDownloading}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all hidden md:flex items-center gap-1.5 sm:gap-2 cursor-pointer disabled:cursor-not-allowed"
              title="Open browser print dialog (Ctrl+P / Cmd+P)"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />
              <span>Print</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher (< lg) */}
        <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-neutral-100/90 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 shrink-0 select-none">
          <div className="inline-flex rounded-xl bg-neutral-200/80 dark:bg-neutral-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'preview'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('settings')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === 'settings'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

          {/* Mobile Zoom Quick Controls */}
          {mobileTab === 'preview' && (
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(30, prev - 10))}
                className="p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleFitWidth}
                className="px-1 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
                title="Click to Fit Width"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(125, prev + 10))}
                className="p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Studio Main Workspace (Split View) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 w-full">
          <div className={`h-full min-h-0 ${mobileTab === 'settings' ? 'flex flex-1 w-full' : 'hidden'} lg:flex lg:w-[380px] xl:w-[420px] shrink-0 overflow-hidden`}>
            <PdfExportSidebar
              preset={preset}
              onSelectPreset={handleSelectPreset}
              pdfTheme={pdfTheme}
              onChangePdfTheme={setPdfTheme}
              fontFamily={fontFamily}
              onChangeFontFamily={setFontFamily}
              accentColor={accentColor}
              onChangeAccentColor={setAccentColor}
              pageSize={pageSize}
              onChangePageSize={setPageSize}
              margins={margins}
              onChangeMargins={setMargins}
              includeCoverPage={includeCoverPage}
              onChangeIncludeCoverPage={setIncludeCoverPage}
              coverSubtitle={coverSubtitle}
              onChangeCoverSubtitle={setCoverSubtitle}
              coverAuthor={coverAuthor}
              onChangeCoverAuthor={setCoverAuthor}
              coverOrg={coverOrg}
              onChangeCoverOrg={setCoverOrg}
              includeToc={includeToc}
              onChangeIncludeToc={setIncludeToc}
              tableOfContents={tableOfContents}
              includePageNumbers={includePageNumbers}
              onChangeIncludePageNumbers={setIncludePageNumbers}
              watermarkText={watermarkText}
              onChangeWatermarkText={setWatermarkText}
            />
          </div>

          <div className={`h-full min-h-0 flex-1 ${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex overflow-hidden`}>
            <PdfExportPreview
              zoomLevel={zoomLevel}
              pdfTheme={pdfTheme}
              includeCoverPage={includeCoverPage}
              coverOrg={coverOrg}
              preset={preset}
              accentColor={accentColor}
              documentTitle={documentTitle}
              coverSubtitle={coverSubtitle}
              coverAuthor={coverAuthor}
              fontFamily={fontFamily}
              pageSize={pageSize}
              margins={margins}
              watermarkText={watermarkText}
              includeToc={includeToc}
              tableOfContents={tableOfContents}
              includePageNumbers={includePageNumbers}
              documentContent={documentContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
