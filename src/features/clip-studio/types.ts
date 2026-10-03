export type AspectRatioPreset = 
  | 'reels-9-16' 
  | 'threads-1-1' 
  | 'threads-4-5' 
  | 'x-16-9' 
  | 'x-1-1';

export interface PresetDimension {
  id: AspectRatioPreset;
  label: string;
  sublabel: string;
  width: number;
  height: number;
  ratio: string;
  platform: 'instagram' | 'threads' | 'x';
}

export const PRESET_DIMENSIONS: Record<AspectRatioPreset, PresetDimension> = {
  'reels-9-16': {
    id: 'reels-9-16',
    label: 'Instagram Reels / Stories',
    sublabel: '9:16 Vertical Video (1080 × 1920)',
    width: 1080,
    height: 1920,
    ratio: '9/16',
    platform: 'instagram',
  },
  'threads-4-5': {
    id: 'threads-4-5',
    label: 'Instagram Feed / Threads',
    sublabel: '4:5 Portrait Card (1080 × 1350)',
    width: 1080,
    height: 1350,
    ratio: '4/5',
    platform: 'threads',
  },
  'threads-1-1': {
    id: 'threads-1-1',
    label: 'Threads / Insta Square',
    sublabel: '1:1 Square Grid (1080 × 1080)',
    width: 1080,
    height: 1080,
    ratio: '1/1',
    platform: 'threads',
  },
  'x-16-9': {
    id: 'x-16-9',
    label: 'X (Twitter) Landscape',
    sublabel: '16:9 Standard Feed (1920 × 1080)',
    width: 1920,
    height: 1080,
    ratio: '16/9',
    platform: 'x',
  },
  'x-1-1': {
    id: 'x-1-1',
    label: 'X (Twitter) Square',
    sublabel: '1:1 Auto-Looping Card (1080 × 1080)',
    width: 1080,
    height: 1080,
    ratio: '1/1',
    platform: 'x',
  },
};

export type BackgroundThemeId = 
  | 'raycast-purple'
  | 'sunset-glow'
  | 'hyper-blue'
  | 'neon-cyber'
  | 'aurora-ambient'
  | 'studio-obsidian'
  | 'studio-slate'
  | 'transparent';

export interface BackgroundTheme {
  id: BackgroundThemeId;
  name: string;
  previewCss: string;
  draw: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number, timeMs?: number) => void;
}

export type TypingCadence = 'human' | 'fast' | 'blitz';
export type CaretStyle = 'bar' | 'block' | 'glow';
export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type SyntaxTheme = 'one-dark' | 'tokyo-night' | 'dracula' | 'github-dark' | 'github-light';
export type ExportFormat = 'mp4' | 'gif';

export interface InteractionEvent {
  timestamp: number; // ms from recording start
  x: number; // normalized 0 to 1
  y: number; // normalized 0 to 1
  type: 'move' | 'click' | 'key';
}

export interface RecordedClip {
  blob: Blob;
  url: string;
  durationMs: number;
  width: number;
  height: number;
  events: InteractionEvent[];
}

export interface ClipStudioConfig {
  sourceType: 'screen-recording' | 'ghost-typer';
  preset: AspectRatioPreset;
  title: string;
  
  // Window Chrome
  showMacButtons: boolean;
  showDropShadow: boolean;
  shadowDepth: number; // 0 to 60
  cornerRadius: number; // 8 to 28
  padding: number; // 0 to 80
  tiltX: number; // -15 to 15 degrees
  tiltY: number; // -15 to 15 degrees
  background: BackgroundThemeId;
  theme: SyntaxTheme;

  // Camera & Auto-Zoom (Recordly style)
  autoZoomEnabled: boolean;
  zoomScale: number; // 1.1 to 2.2
  cameraSmoothness: number; // 0.05 to 0.25
  showClickRipples: boolean;

  // Ghost Typer & Playback (optional fallback mode)
  mode: 'ghost-typer' | 'cinematic-scroll';
  cadence: TypingCadence;
  showCaret: boolean;
  caretStyle: CaretStyle;
  showKeystrokeRipples: boolean;
  highlightActiveLine: boolean;

  // Social Polish & Branding
  showWatermark: boolean;
  handle: string;
  platformBadge: 'instagram' | 'threads' | 'x' | 'custom';
  watermarkPosition: WatermarkPosition;
  showProgressBar: boolean;
  showSafeZones: boolean;

  // Export
  format: ExportFormat;
  fps: 60 | 30;
  bitrateMbps: number;
}

export interface RenderProgress {
  status: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'complete' | 'error';
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  message?: string;
  error?: string;
  outputBlobUrl?: string;
  outputFileName?: string;
  format?: ExportFormat;
}

