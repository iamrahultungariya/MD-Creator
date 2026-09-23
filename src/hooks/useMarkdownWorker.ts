import { useState, useEffect, useRef } from 'react';
import type { WorkerResponse, WorkerHeading } from '../workers/markdown.worker';
import { fastCountLines, fastCountWords, fastCalculateReadingTime } from '../utils/textCounters';

export interface MarkdownTelemetry {
  lines: number;
  words: number;
  chars: number;
  reading: number;
  headings: WorkerHeading[];
}

export function useMarkdownWorker(content: string): MarkdownTelemetry {
  const [telemetry, setTelemetry] = useState<MarkdownTelemetry>(() => ({
    lines: fastCountLines(content),
    words: fastCountWords(content),
    chars: content.length,
    reading: fastCalculateReadingTime(fastCountWords(content)),
    headings: [],
  }));

  const workerRef = useRef<Worker | null>(null);
  const reqIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Instantiate module worker supported out of the box in Vite
    try {
      workerRef.current = new Worker(
        new URL('../workers/markdown.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const data = event.data;
        if (data.id === reqIdRef.current) {
          setTelemetry({
            lines: data.lines,
            words: data.words,
            chars: data.chars,
            reading: data.readingTime,
            headings: data.headings,
          });
        }
      };
    } catch (err) {
      console.warn('[MarkdownWorker] Web Worker initialization failed, falling back to main thread:', err);
      workerRef.current = null;
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const nextId = ++reqIdRef.current;
      if (workerRef.current) {
        workerRef.current.postMessage({ id: nextId, content });
      } else {
        // Fallback calculation on main thread if worker unavailable
        const lines = fastCountLines(content);
        const words = fastCountWords(content);
        const chars = content.length;
        const reading = fastCalculateReadingTime(words);
        setTelemetry((prev) => ({
          ...prev,
          lines,
          words,
          chars,
          reading,
        }));
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [content]);

  return telemetry;
}
