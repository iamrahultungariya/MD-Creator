export type PdfPreset = 'editorial' | 'technical' | 'academic' | 'corporate' | 'minimalist';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type PageSize = 'a4' | 'letter';
export type MarginSize = 'compact' | 'normal' | 'wide';
export type PdfTheme = 'light' | 'dark';

export interface AccentColor {
  id: string;
  name: string;
  hex: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: 'indigo', name: 'Indigo Blue', hex: '#4f46e5' },
  { id: 'emerald', name: 'Emerald Green', hex: '#059669' },
  { id: 'rose', name: 'Crimson Rose', hex: '#e11d48' },
  { id: 'purple', name: 'Royal Violet', hex: '#7c3aed' },
  { id: 'amber', name: 'Amber Gold', hex: '#d97706' },
  { id: 'slate', name: 'Graphite Slate', hex: '#0f172a' },
];

export interface TocItem {
  level: number;
  title: string;
}

export interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentContent: string;
}

export interface PdfConfigState {
  preset: PdfPreset;
  fontFamily: FontFamily;
  accentColor: string;
  pageSize: PageSize;
  margins: MarginSize;
  includeCoverPage: boolean;
  coverSubtitle: string;
  coverAuthor: string;
  coverOrg: string;
  includeToc: boolean;
  includePageNumbers: boolean;
  watermarkText: string;
  pdfTheme: PdfTheme;
}
