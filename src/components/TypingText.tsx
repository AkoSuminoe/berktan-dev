'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function TypingText({
  text,
  speed = 70,
  startDelay = 400,
  className,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setVisibleCount(text.length);
      return;
    }

    setVisibleCount(0);
    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i += 1;
        setVisibleCount(i);
        if (i >= text.length && interval) {
          clearInterval(interval);
          interval = null;
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay, reduce]);

  return (
    <span className={className}>
      {text.slice(0, visibleCount)}
      <span aria-hidden className="text-phosphor animate-blink">
        _
      </span>
    </span>
  );
}
