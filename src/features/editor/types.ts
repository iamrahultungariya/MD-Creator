export type ViewMode = 'split' | 'write' | 'read' | 'present';

export interface CursorPosition {
  line: number;
  col: number;
}

export interface DocumentStats {
  lineCount: number;
  wordCount: number;
  charCount: number;
  readingTime: number;
}

export interface SprintState {
  isActive: boolean;
  duration: number;
  secondsRemaining: number;
  startWordCount: number;
}
