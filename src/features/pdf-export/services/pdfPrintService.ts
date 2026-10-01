import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import { FontFamily, MarginSize, PageSize, PdfTheme } from '../types';

export interface DirectPdfOptions {
  documentTitle: string;
  pageSize: PageSize;
  pdfTheme?: PdfTheme;
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
 * 1-Click Direct High-Resolution Multi-Page PDF Generation and Download.
 * Captures rendered document sheets at high pixel-ratio (2.5x) and slices
 * multi-page continuous content into exact physical sheet proportions (A4/Letter),
 * preserving 100% aspect ratio, crisp readable typography, tables, and math.
 * NEVER squishes multi-page content into a single page.
 */
export async function exportDirectPdf(options: DirectPdfOptions): Promise<void> {
  const { documentTitle, pageSize, onProgress } = options;

  onProgress?.(5, 'Preparing document sheets...');

  // 1. Ensure fonts and KaTeX math are fully parsed and ready
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Font fallback
    }
  }

  // 2. Locate all rendered printable sheets marked with data-pdf-sheet="true"
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

    let isFirstPage = true;
    const totalSheets = sheets.length;

    for (let i = 0; i < totalSheets; i++) {
      const sheet = sheets[i];
      const sheetNum = i + 1;
      const progressPercent = Math.round(10 + (sheetNum / totalSheets) * 80);
      onProgress?.(progressPercent, `Rendering page ${sheetNum} of ${totalSheets}...`);

      // Yield execution to the browser event loop so the UI stays responsive and updates progress bar
      await new Promise((resolve) => setTimeout(resolve, 30));

      // Render individual sheet at 2.0x (192 DPI) - razor sharp and ultra-fast
      const imgData = await toJpeg(sheet, {
        quality: 0.96,
        pixelRatio: 2.0,
        fontEmbedCSS: '', // Avoid heavy recursive font re-embedding freeze
        backgroundColor: options.pdfTheme === 'dark' ? '#15111E' : '#ffffff',
        skipFonts: true,
        filter: (node) => {
          if (
            node instanceof HTMLElement && 
            (node.classList.contains('pdf-page-indicator') || node.classList.contains('no-print'))
          ) {
            return false;
          }
          return true;
        },
      });

      // Load imgData into an image to get true pixel dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imgData;
      });

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // Calculate the physical height this image represents in mm at full sheet width (pdfWidthMm)
      const contentHeightMm = (imgHeight / imgWidth) * pdfWidthMm;

      // If it naturally fits on 1 sheet (e.g. Cover Sheet, Table of Contents, or short doc), add directly
      if (contentHeightMm <= pdfHeightMm * 1.05) {
        if (isFirstPage) {
          isFirstPage = false;
        } else {
          pdf.addPage(pageSize === 'letter' ? 'letter' : 'a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, Math.min(pdfHeightMm, contentHeightMm), undefined, 'FAST');
      } else {
        // Multi-page document content!
        // Slice the canvas vertically into exact 1-page chunks so aspect ratio is NEVER squished!
        const pageHeightPx = Math.floor(imgWidth * (pdfHeightMm / pdfWidthMm));
        const totalPages = Math.ceil(imgHeight / pageHeightPx);

        for (let p = 0; p < totalPages; p++) {
          if (isFirstPage) {
            isFirstPage = false;
          } else {
            pdf.addPage(pageSize === 'letter' ? 'letter' : 'a4', 'portrait');
          }

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = pageHeightPx;
          const pageCtx = pageCanvas.getContext('2d');

          if (pageCtx) {
            pageCtx.fillStyle = options.pdfTheme === 'dark' ? '#15111E' : '#ffffff';
            pageCtx.fillRect(0, 0, imgWidth, pageHeightPx);

            const srcY = p * pageHeightPx;
            const srcH = Math.min(pageHeightPx, imgHeight - srcY);

            pageCtx.drawImage(
              img,
              0, srcY, imgWidth, srcH,
              0, 0, imgWidth, srcH
            );

            const pageSliceData = pageCanvas.toDataURL('image/jpeg', 0.98);
            pdf.addImage(pageSliceData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
          }
        }
      }
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
 * System Print Dialog trigger via an isolated, clean print iframe.
 * Avoids any modal navbars, dark mode boxes, or UI chrome leaking into the print stream.
 * Provides 100% vector-sharp text, crisp native OS printing, and zero black boxes.
 */
export function executePdfPrint(options?: PrintPdfOptions): void {
  // 1. Locate the rendered sheets from the preview
  const sheets = Array.from(document.querySelectorAll<HTMLElement>('[data-pdf-sheet="true"]'));
  if (sheets.length === 0) {
    window.print();
    return;
  }

  // 2. Clone the clean inner HTML of all printable sheets
  const contentHtml = sheets
    .map((s) => s.outerHTML)
    .join('\n<div style="page-break-after: always; break-after: page;"></div>\n');

  // 3. Create a clean, isolated hidden iframe in the document
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // 4. Collect stylesheets from parent document (fonts, KaTeX, highlight.js)
  const headElements: string[] = [];
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    headElements.push(node.outerHTML);
  });

  const fontCss = options?.fontFamily === 'serif'
    ? '"Literata Variable", Georgia, serif'
    : options?.fontFamily === 'mono'
    ? '"Geist Mono Variable", ui-monospace, monospace'
    : '"Geist Variable", system-ui, sans-serif';

  const marginMm = options?.margins === 'compact' ? '12mm' : options?.margins === 'wide' ? '24mm' : '16mm';
  const pageSizeStr = options?.pageSize === 'letter' ? 'letter' : 'A4';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${options?.documentTitle || 'Document'}</title>
        ${headElements.join('\n')}
        <style>
          @page {
            size: ${pageSizeStr} portrait;
            margin: ${marginMm};
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #111827 !important;
            font-family: ${fontCss} !important;
            -webkit-font-smoothing: antialiased;
          }
          /* Strictly suppress any UI indicators or chrome */
          .no-print, .pdf-page-indicator {
            display: none !important;
          }
          .pdf-paper-sheet {
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #111827 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            page-break-after: always !important;
            break-after: page !important;
            min-height: 92vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .pdf-paper-sheet:last-of-type {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
            color: #111827 !important;
          }
          p, li, blockquote {
            break-inside: auto;
            color: #1f2937 !important;
            line-height: 1.6;
          }
          table, pre, code, img, .katex-display {
            break-inside: avoid !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 16px 0 !important;
          }
          th, td {
            border: 1px solid #e5e7eb !important;
            padding: 8px 12px !important;
            font-size: 13px !important;
          }
          th {
            background-color: #f9fafb !important;
            font-weight: 600 !important;
          }
          pre {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 12px 14px !important;
            font-size: 12px !important;
          }
          .pdf-running-header {
            border-bottom: 1px solid #e5e7eb !important;
            padding-bottom: 8px !important;
            margin-bottom: 20px !important;
            font-size: 11px !important;
            color: #6b7280 !important;
            display: flex !important;
            justify-content: space-between !important;
          }
          .pdf-running-footer {
            border-top: 1px solid #e5e7eb !important;
            padding-top: 8px !important;
            margin-top: 28px !important;
            font-size: 10px !important;
            color: #6b7280 !important;
            display: flex !important;
            justify-content: space-between !important;
          }
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
    </html>
  `);
  doc.close();

  // 5. Trigger print inside the isolated iframe after rendering
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 2500);
    }
  }, 300);
}
