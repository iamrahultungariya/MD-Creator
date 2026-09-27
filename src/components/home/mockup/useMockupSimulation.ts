import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { SAMPLE_DOCS, SampleDoc, SparkParticle, SPARK_COLORS } from './mockupData';

export function useMockupSimulation() {
  const [activeDocId, setActiveDocId] = useState<string>('quickstart');
  const [content, setContent] = useState<string>(SAMPLE_DOCS[0].content);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const [sparks, setSparks] = useState<SparkParticle[]>([]);

  const autoTypeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleIdRef = useRef<number>(0);

  // Active document object
  const currentDoc = useMemo<SampleDoc>(() => {
    return SAMPLE_DOCS.find((d) => d.id === activeDocId) || SAMPLE_DOCS[0];
  }, [activeDocId]);

  // Telemetry computation (game-dev style: single pass or fast regex)
  const stats = useMemo(() => {
    const lines = content.split('\n').length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    return { lines, words, chars };
  }, [content]);

  // High-performance bounded spark emitter (max 16 particles, zero unbound allocations)
  const emitSparks = useCallback(() => {
    const batch: SparkParticle[] = [];
    for (let i = 0; i < 4; i++) {
      particleIdRef.current = (particleIdRef.current + 1) % 10000;
      batch.push({
        id: particleIdRef.current,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        size: 3 + Math.random() * 4,
      });
    }

    setSparks((prev) => {
      const combined = [...prev.slice(-12), ...batch];
      return combined;
    });

    setTimeout(() => {
      setSparks((prev) => prev.slice(batch.length));
    }, 600);
  }, []);

  // Switch active document
  const handleSelectDoc = useCallback((docId: string) => {
    const target = SAMPLE_DOCS.find((d) => d.id === docId);
    if (target) {
      setActiveDocId(target.id);
      setContent(target.content);
      if (autoTypeIntervalRef.current) {
        clearInterval(autoTypeIntervalRef.current);
        autoTypeIntervalRef.current = null;
        setIsAutoTyping(false);
      }
    }
  }, []);

  // Toggle interactive task in preview
  const handleToggleTask = useCallback((taskIndex: number, currentChecked: boolean) => {
    let count = 0;
    setContent((prev) =>
      prev.replace(/^(\s*[-*]\s*\[)([ xX])(\])/gm, (match, prefix, _check, suffix) => {
        if (count === taskIndex) {
          count++;
          return `${prefix}${currentChecked ? ' ' : 'x'}${suffix}`;
        }
        count++;
        return match;
      })
    );
  }, []);

  // Insert snippet from mock drawer
  const handleInsertSnippet = useCallback(
    (snippet: string) => {
      setContent((prev) => prev + '\n\n' + snippet);
      emitSparks();
    },
    [emitSparks]
  );

  // Auto-typing simulation
  const stopAutoType = useCallback(() => {
    setIsAutoTyping(false);
    if (autoTypeIntervalRef.current) {
      clearInterval(autoTypeIntervalRef.current);
      autoTypeIntervalRef.current = null;
    }
  }, []);

  const startAutoType = useCallback(() => {
    setIsAutoTyping(true);
    const demoSnippet = `\n\n> [!TIP]\n> Instant local-first response time with zero typing latency!`;
    let i = 0;

    if (autoTypeIntervalRef.current) clearInterval(autoTypeIntervalRef.current);

    autoTypeIntervalRef.current = setInterval(() => {
      if (i < demoSnippet.length) {
        setContent((prev) => prev + demoSnippet[i]);
        emitSparks();
        i++;
      } else {
        stopAutoType();
      }
    }, 45);
  }, [emitSparks, stopAutoType]);

  useEffect(() => {
    return () => {
      if (autoTypeIntervalRef.current) clearInterval(autoTypeIntervalRef.current);
    };
  }, []);

  return {
    activeDocId,
    content,
    setContent,
    currentDoc,
    stats,
    sparks,
    isAutoTyping,
    emitSparks,
    handleSelectDoc,
    handleToggleTask,
    handleInsertSnippet,
    startAutoType,
    stopAutoType,
  };
}
