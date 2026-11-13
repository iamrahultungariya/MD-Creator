import React from 'react';
import { useCurrentFrame } from 'remotion';

interface AutoTypingEngineProps {
  fullText: string;
  startFrame: number;
  speed?: number; // Characters per frame
  cursorColor?: string;
  className?: string;
  showCursor?: boolean;
}

export const useAutoType = (fullText: string, startFrame: number, speed: number = 0.8) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charCount = Math.min(fullText.length, Math.floor(elapsed * speed));
  const displayedText = fullText.slice(0, charCount);
  const isComplete = charCount >= fullText.length;
  const cursorVisible = Math.floor(frame / 18) % 2 === 0;

  return { displayedText, isComplete, cursorVisible };
};

export const AutoTypingEngine: React.FC<AutoTypingEngineProps> = ({
  fullText,
  startFrame,
  speed = 0.8,
  cursorColor = '#8257F5',
  className = '',
  showCursor = true,
}) => {
  const { displayedText, isComplete, cursorVisible } = useAutoType(fullText, startFrame, speed);

  return (
    <span className={`inline-block whitespace-pre-wrap ${className}`}>
      {displayedText}
      {showCursor && (!isComplete || cursorVisible) && (
        <span
          className="inline-block w-[2px] h-[1.1em] align-middle ml-[2px]"
          style={{ backgroundColor: cursorColor }}
        />
      )}
    </span>
  );
};
