/**
 * MD Writer — Global Design System Tokens
 * Single source of truth for spacing, typography, letter-spacing, line-height,
 * color palettes, elevations, border radii, and animation curves.
 */

// ============================================================================
// 1. SPACING & MARGIN SCALE (4px Base Grid)
// ============================================================================
export const spacing = {
  '0': '0px',
  '0.5': '0.125rem', // 2px
  '1': '0.25rem',    // 4px
  '1.5': '0.375rem', // 6px
  '2': '0.5rem',     // 8px
  '2.5': '0.625rem', // 10px
  '3': '0.75rem',    // 12px
  '3.5': '0.875rem', // 14px
  '4': '1rem',       // 16px
  '5': '1.25rem',    // 20px
  '6': '1.5rem',     // 24px
  '7': '1.75rem',    // 28px
  '8': '2rem',       // 32px
  '9': '2.25rem',    // 36px
  '10': '2.5rem',    // 40px
  '11': '2.75rem',   // 44px
  '12': '3rem',      // 48px
  '14': '3.5rem',    // 56px
  '16': '4rem',      // 64px
  '20': '5rem',      // 80px
  '24': '6rem',      // 96px
  '28': '7rem',      // 112px
  '32': '8rem',      // 128px
} as const;

export type SpacingToken = keyof typeof spacing;

// Spacing in raw pixels for canvas/worker calculations
export const spacingPx = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
} as const;

// Semantic layout spacing tokens
export const layoutSpacing = {
  containerPaddingXMobile: spacing['4'],   // 16px
  containerPaddingXDesktop: spacing['8'],  // 32px
  sectionGapMobile: spacing['12'],         // 48px
  sectionGapDesktop: spacing['20'],        // 80px
  navbarHeight: '3.75rem',                 // 60px
  toolbarHeight: '2.75rem',                // 44px
  modalPadding: spacing['6'],              // 24px
  cardPadding: spacing['5'],               // 20px
} as const;

// ============================================================================
// 2. LETTER SPACING (Tracking)
// ============================================================================
export const letterSpacing = {
  tighter: '-0.05em', // Display titles & Hero H1
  tight: '-0.025em',  // Section headings & H2/H3
  snug: '-0.015em',   // Subheadings, card titles, buttons
  normal: '0em',      // Body copy & prose
  wide: '0.025em',    // Small captions & navigation links
  wider: '0.05em',    // Uppercase tags, kbd badges, micro labels
  widest: '0.1em',    // Expanded monospaced identifiers
} as const;

export type LetterSpacingToken = keyof typeof letterSpacing;

// ============================================================================
// 3. LINE SPACING (Leading / Line Height)
// ============================================================================
export const lineHeight = {
  none: '1',         // Icon buttons & single-line badges
  tight: '1.2',      // Large headings & titles
  snug: '1.375',     // Subheadings & cards
  normal: '1.5',     // Default UI text, buttons, form controls
  relaxed: '1.625',  // Readable short prose & documentation summaries
  loose: '1.8',      // Long-form reading mode default
  prose: '1.85',     // Literary / book reading mode
} as const;

export type LineHeightToken = keyof typeof lineHeight;

// ============================================================================
// 4. TYPOGRAPHY (Font Families & Size Ladder)
// ============================================================================
export const fontFamily = {
  sans: '"Geist Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  serif: '"Literata Variable", Georgia, Cambria, "Times New Roman", Times, serif',
  lexend: '"Lexend", -apple-system, BlinkMacSystemFont, sans-serif',
  arial: 'Arial, Helvetica, -apple-system, sans-serif',
  lato: '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
  handwriting: '"Caveat", cursive',
} as const;

export const fontSize = {
  '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: letterSpacing.wider }],        // 11px
  xs: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: letterSpacing.wide }],          // 12px
  sm: ['0.875rem', { lineHeight: '1.375rem', letterSpacing: letterSpacing.snug }],         // 14px
  base: ['1rem', { lineHeight: '1.5rem', letterSpacing: letterSpacing.normal }],           // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: letterSpacing.snug }],          // 18px
  xl: ['1.25rem', { lineHeight: '1.875rem', letterSpacing: letterSpacing.tight }],         // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: letterSpacing.tight }],           // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: letterSpacing.tight }],      // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: letterSpacing.tighter }],      // 36px
  '5xl': ['3rem', { lineHeight: '1.15', letterSpacing: letterSpacing.tighter }],           // 48px
  '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: letterSpacing.tighter }],         // 60px
} as const;

export type FontSizeToken = keyof typeof fontSize;

// ============================================================================
// 5. COLOR PALETTE
// ============================================================================
export const colors = {
  // MD Writer Brand Signature — Electric Violet Palette
  brand: {
    50: '#F6F3FF',
    100: '#ECE6FF',
    200: '#D9CDFF',
    300: '#BDA8FF',
    400: '#9E7EFF',
    500: '#8257F5', // Core Primary
    600: '#6D3FE0', // Active / Focus
    700: '#5A2FBF',
    800: '#46258F',
    900: '#2F1A63',
    950: '#1C0F3D',
  },

  // High-Precision Neutral / Grayscale (Zinc / Slate Blend)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F4F4F5',
    150: '#ECECEF',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    850: '#1E1E22',
    900: '#18181B',
    950: '#0E0B14', // Obsidian base
    1000: '#000000',
  },

  // Semantic Status Ramps
  status: {
    success: {
      light: '#ecfdf5',
      border: '#a7f3d0',
      text: '#065f46',
      solid: '#10b981',
      darkSurface: 'rgba(6, 78, 59, 0.3)',
      darkBorder: 'rgba(16, 185, 129, 0.4)',
      darkText: '#6ee7b7',
    },
    warning: {
      light: '#fef3c7',
      border: '#fde68a',
      text: '#92400e',
      solid: '#f59e0b',
      darkSurface: 'rgba(120, 53, 15, 0.3)',
      darkBorder: 'rgba(245, 158, 11, 0.4)',
      darkText: '#fcd34d',
    },
    danger: {
      light: '#fff1f2',
      border: '#fecdd3',
      text: '#9f1239',
      solid: '#f43f5e',
      darkSurface: 'rgba(136, 19, 55, 0.3)',
      darkBorder: 'rgba(244, 63, 94, 0.4)',
      darkText: '#fda4af',
    },
    info: {
      light: '#eff6ff',
      border: '#bfdbfe',
      text: '#1e40af',
      solid: '#3b82f6',
      darkSurface: 'rgba(30, 58, 138, 0.3)',
      darkBorder: 'rgba(59, 130, 246, 0.4)',
      darkText: '#93c5fd',
    },
  },
} as const;

// Light and Dark mode Semantic Tokens
export const semanticTokens = {
  light: {
    bg: '#FBFAFD',
    surface: '#FFFFFF',
    elevated: '#F3F0F9',
    subtle: '#F0EDF6',
    borderDefault: '#E7E3F0',
    borderSubtle: '#F0EDF6',
    borderStrong: '#D4CEE2',
    textPrimary: '#1B1626',
    textSecondary: '#484157',
    textMuted: '#6B6480',
    textSubtle: '#9A93AD',
    focusRing: 'rgba(130, 87, 245, 0.4)',
  },
  dark: {
    bg: '#0E0B14',
    surface: '#15111E',
    elevated: '#1D1829',
    subtle: '#251F33',
    borderDefault: '#2A2338',
    borderSubtle: '#1F1A2A',
    borderStrong: '#3D3352',
    textPrimary: '#EDEAF5',
    textSecondary: '#C4BFD6',
    textMuted: '#9A93AD',
    textSubtle: '#6A637C',
    focusRing: 'rgba(158, 126, 255, 0.4)',
  },
} as const;

// ============================================================================
// 6. BORDER RADIUS
// ============================================================================
export const borderRadius = {
  none: '0px',
  xs: '0.25rem',   // 4px - Badges, tiny tags
  sm: '0.375rem',  // 6px - Dropdown items, tooltips
  md: '0.5rem',    // 8px - Buttons, input fields
  lg: '0.75rem',   // 12px - Cards, popovers
  xl: '1rem',      // 16px - Large cards, dialogs
  '2xl': '1.25rem',// 20px - Prominent modals, hero banners
  '3xl': '1.5rem', // 24px - Floating panels
  full: '9999px',  // Pills, round avatars
} as const;

export type BorderRadiusToken = keyof typeof borderRadius;

// ============================================================================
// 7. ELEVATION & SHADOWS
// ============================================================================
export const shadows = {
  none: 'none',
  '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  xs: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  brandGlow: '0 0 20px -2px rgba(130, 87, 245, 0.35)',
  innerSubtle: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
} as const;

export type ShadowToken = keyof typeof shadows;

// ============================================================================
// 8. TRANSITIONS & TIMING
// ============================================================================
export const transitions = {
  fast: '100ms cubic-bezier(0.16, 1, 0.3, 1)',
  base: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  smooth: '240ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
  bounce: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;
