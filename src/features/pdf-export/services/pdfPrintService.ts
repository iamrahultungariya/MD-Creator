import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import { FontFamily, MarginSize, PageSize } from '../types';

export interface DirectPdfOptions {
  documentTitle: string;
  pageSize: PageSize;
  onProgress?: (progress: number, message: string) => void;
}

export interface PrintPdfOptions {
  documentTitle: string;
  pageSize: PageSize;
  margins: MarginSize;
  fontFamily: FontFamily;
  accentColor: string;
  watermarkText?: string;
  includeCoverPage?: boolean;
  includeToc?: boolean;
}

/**
 * 1-Click Direct PDF Generation and File Download.
 * Captures all rendered paginated sheets via html-to-image (fully supporting modern CSS
 * including oklch colors, KaTeX, and Tailwind v4) and compiles them into a
 * high-resolution PDF document using jsPDF, then triggers a direct file download.
 * Does NOT open the browser print dialog.
 */
export async function exportDirectPdf(options: DirectPdfOptions): Promise<void> {
  const { documentTitle, pageSize, onProgress } = options;

  onProgress?.(5, 'Preparing document sheets...');

  // 1. Ensure web fonts and KaTeX math glyphs are fully parsed and ready
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Font loading failure fallback
    }
  }

  // 2. Locate all rendered sheets marked with data-pdf-sheet="true"
  let sheets = Array.from(
    document.querySelectorAll<HTMLElement>('[data-pdf-sheet="true"]')
  );

  if (sheets.length === 0) {
    const singleBody = document.getElementById('pdf-render-body');
    if (singleBody) {
      sheets = [singleBody];
    } else {
      throw new Error('No printable sheets found in PDF Studio preview.');
    }
  }

  // 3. Temporarily reset zoom transform on preview container so capture runs at true 1:1 scale
  const zoomContainer = document.querySelector<HTMLElement>('[data-pdf-zoom-container="true"]');
  const originalTransform = zoomContainer?.style.transform || '';
  if (zoomContainer) {
    zoomContainer.style.transform = 'none';
  }

  try {
    const pdfWidthMm = pageSize === 'letter' ? 215.9 : 210;
    const pdfHeightMm = pageSize === 'letter' ? 279.4 : 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize === 'letter' ? 'letter' : 'a4',
      compress: true,
    });

    const totalSheets = sheets.length;

    for (let i = 0; i < totalSheets; i++) {
      const sheet = sheets[i];
      const pageNum = i + 1;
      const progressPercent = Math.round(10 + (pageNum / totalSheets) * 80);
      onProgress?.(progressPercent, `Rendering page ${pageNum} of ${totalSheets}...`);

      // Render sheet using html-to-image with native SVG foreignObject support (supports oklch!)
      const imgData = await toJpeg(sheet, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('pdf-page-indicator')) {
            return false;
          }
          return true;
        },
      });

      if (i > 0) {
        pdf.addPage(pageSize === 'letter' ? 'letter' : 'a4', 'portrait');
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
    }

    onProgress?.(95, 'Compiling and saving PDF file...');

    const sanitizedTitle = (documentTitle || 'document')
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '_')
      .trim();

    // Trigger direct browser file download
    pdf.save(`${sanitizedTitle}.pdf`);

    onProgress?.(100, 'Download complete!');
  } finally {
    // Restore user zoom transform
    if (zoomContainer) {
      zoomContainer.style.transform = originalTransform;
    }
  }
}

/**
 * System Print Dialog trigger.
 * Triggers native browser print on the active window.
 * All UI chrome (navbar, sidebar, modal background) is suppressed via @media print,
 * and paginated sheets are formatted with 1-sheet-per-page geometry.
 */
export function executePdfPrint(_options?: PrintPdfOptions): void {
  // 1. Temporarily reset zoom transform so printable layout computes at true 1:1 scale
  const zoomContainer = document.querySelector<HTMLElement>('[data-pdf-zoom-container="true"]');
  const originalTransform = zoomContainer?.style.transform || '';
  if (zoomContainer) {
    zoomContainer.style.transform = 'none';
  }

  try {
    window.print();
  } finally {
    if (zoomContainer) {
      zoomContainer.style.transform = originalTransform;
    }
  }
}
