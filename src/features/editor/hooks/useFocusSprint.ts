import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fastCountWords } from '../../../utils/textCounters';

export type SprintMode = 'time' | 'words';

interface UseFocusSprintOptions {
  content: string;
  onSprintComplete?: (wordsWritten: number, elapsedMinutes: number, wpm: number) => void;
}

// Web Audio API tone synthesis for clean, pleasant audio cues (zero assets)
function playTone(frequencies: number[], durationMs = 300) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + durationMs / 1000);
    });
  } catch {
    // Gracefully ignore if audio context is blocked
  }
}

export function useFocusSprint({ content, onSprintComplete }: UseFocusSprintOptions) {
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [sprintMode, setSprintMode] = useState<SprintMode>('time');
  const [sprintDuration, setSprintDuration] = useState(25); // minutes
  const [targetWords, setTargetWords] = useState(250); // target words for 'words' mode
  const [sprintSecondsRemaining, setSprintSecondsRemaining] = useState(25 * 60);
  const [sprintStartWordCount, setSprintStartWordCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);

  // Compute words currently in content using zero-allocation scanner ONLY when sprint is active
  const currentWords = useMemo(() => {
    return isSprintActive ? fastCountWords(content) : 0;
  }, [isSprintActive, content]);
  const wordsWritten = isSprintActive ? Math.max(0, currentWords - sprintStartWordCount) : 0;

  // Calculate live WPM
  const calculateWpm = useCallback(() => {
    if (!isSprintActive && pausedElapsedRef.current === 0) return 0;
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000 + pausedElapsedRef.current;
    const elapsedMin = Math.max(0.1, elapsedSec / 60);
    return Math.round(wordsWritten / elapsedMin);
  }, [isSprintActive, wordsWritten]);

  // Main countdown / sprint tracking loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isSprintActive) {
      interval = setInterval(() => {
        // Check if word target is achieved in 'words' mode
        if (sprintMode === 'words' && wordsWritten >= targetWords) {
          setIsSprintActive(false);
          const elapsedSec = (Date.now() - startTimeRef.current) / 1000 + pausedElapsedRef.current;
          const elapsedMin = Math.max(0.1, elapsedSec / 60);
          const wpm = Math.round(wordsWritten / elapsedMin);
          if (soundEnabled) playTone([523.25, 659.25, 783.99, 1046.50], 450); // Victory fanfare
          onSprintComplete?.(wordsWritten, Math.round(elapsedMin), wpm);
          return;
        }

        // Time mode countdown
        if (sprintMode === 'time') {
          setSprintSecondsRemaining((prev) => {
            if (prev <= 1) {
              setIsSprintActive(false);
              const elapsedMin = sprintDuration;
              const wpm = Math.round(wordsWritten / Math.max(1, elapsedMin));
              if (soundEnabled) playTone([523.25, 659.25, 783.99, 1046.50], 450); // Victory fanfare
              onSprintComplete?.(wordsWritten, elapsedMin, wpm);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSprintActive, sprintMode, wordsWritten, targetWords, sprintDuration, soundEnabled, onSprintComplete]);

  const handleStartSprint = useCallback(
    (minutes?: number, mode: SprintMode = 'time', wordGoal = 250) => {
      const mins = minutes || sprintDuration;
      const initialWords = fastCountWords(content);
      setSprintMode(mode);
      setSprintDuration(mins);
      setTargetWords(wordGoal);
      setSprintSecondsRemaining(mins * 60);
      setSprintStartWordCount(initialWords);
      startTimeRef.current = Date.now();
      pausedElapsedRef.current = 0;
      setIsSprintActive(true);

      if (soundEnabled) {
        playTone([523.25, 659.25], 250); // Start bell
      }
    },
    [sprintDuration, content, soundEnabled]
  );

  const handlePauseSprint = useCallback(() => {
    setIsSprintActive(false);
    pausedElapsedRef.current += (Date.now() - startTimeRef.current) / 1000;
  }, []);

  const handleResumeSprint = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsSprintActive(true);
  }, []);

  const handleResetSprint = useCallback(() => {
    setIsSprintActive(false);
    setSprintSecondsRemaining(sprintDuration * 60);
    pausedElapsedRef.current = 0;
  }, [sprintDuration]);

  const formatSprintTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, []);

  // Calculate progress percentage (0 - 100)
  const progressPercent = sprintMode === 'time'
    ? Math.min(100, Math.round(((sprintDuration * 60 - sprintSecondsRemaining) / (sprintDuration * 60)) * 100))
    : Math.min(100, Math.round((wordsWritten / Math.max(1, targetWords)) * 100));

  return {
    isSprintActive,
    sprintMode,
    setSprintMode,
    sprintDuration,
    targetWords,
    setTargetWords,
    sprintSecondsRemaining,
    sprintStartWordCount,
    wordsWritten,
    wpm: calculateWpm(),
    progressPercent,
    soundEnabled,
    setSoundEnabled,
    handleStartSprint,
    handlePauseSprint,
    handleResumeSprint,
    handleResetSprint,
    formatSprintTime,
  };
}
