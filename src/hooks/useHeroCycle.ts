import { useCallback, useEffect, useRef, useState } from 'react';
import { STAGE_ORDER } from '../data/heroContent';

const STAGE_DURATION = 7200;

export function useHeroCycle(reducedMotion: boolean) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % STAGE_ORDER.length);
      setProgressKey((key) => key + 1);
    }, STAGE_DURATION);
    return () => clearTimeout(timer);
  }, [index, paused, reducedMotion]);

  useEffect(() => {
    return () => {
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, []);

  const goTo = useCallback((next: number) => {
    setIndex(next);
    setProgressKey((key) => key + 1);
    setPaused(true);
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => setPaused(false), 9000);
  }, []);

  const pause = useCallback(() => {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    setPaused(false);
    setProgressKey((key) => key + 1);
  }, []);

  return {
    stage: STAGE_ORDER[index],
    index,
    goTo,
    pause,
    resume,
    paused,
    progressKey,
    duration: STAGE_DURATION
  };
}