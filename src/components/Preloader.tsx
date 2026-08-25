'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';

const NAME = 'BERKTAN';

/*
 * Timing budget (see .veil in globals.css for the curves):
 *   180ms  first letter starts
 *   444ms  last letter starts   (180 + 6 x 44ms stagger)
 *  1064ms  wordmark fully settled
 *  1750ms  hold ends, veil starts receding
 *  2050ms  wordmark gone, veil still dissolving
 *  2410ms  veil gone
 * Hero.tsx delays its first entrance to 1.85s so it fades up *through* the
 * blurring veil rather than after it. Keep those two numbers in step.
 */
const HOLD_DURATION = 1750;
const REDUCED_HOLD = 420;
/* Longest exit transition (660ms) plus slack, only used if transitionend is
   swallowed (background tab, some Safari versions). */
const EXIT_FALLBACK = 900;

type Phase = 'holding' | 'leaving' | 'gone';

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>('holding');
  const reduce = useReducedMotion();
  const pathname = usePathname();
  // The veil belongs to the homepage; /tokyo has its own
  const isHome = pathname === '/';

  useEffect(() => {
    if (!isHome || phase !== 'holding') return;
    document.body.style.overflow = 'hidden';
    const timeout = setTimeout(
      () => {
        setPhase('leaving');
        document.body.style.overflow = '';
        try {
          window.sessionStorage.setItem('bs-preloader-done', '1');
        } catch {}
      },
      reduce ? REDUCED_HOLD : HOLD_DURATION
    );
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = '';
    };
  }, [reduce, isHome, phase]);

  // Unmount once the dissolve has actually finished; transitionend is the
  // accurate signal, the timer is only a safety net.
  useEffect(() => {
    if (phase !== 'leaving') return;
    const timeout = setTimeout(() => setPhase('gone'), EXIT_FALLBACK);
    return () => clearTimeout(timeout);
  }, [phase]);

  if (!isHome || phase === 'gone') return null;

  return (
    <div
      className="veil"
      data-leaving={phase === 'leaving'}
      onTransitionEnd={(event) => {
        if (
          event.propertyName === 'opacity' &&
          event.target === event.currentTarget
        ) {
          setPhase('gone');
        }
      }}
    >
      <span
        aria-label={NAME}
        className="veil-mark flex text-2xl sm:text-3xl font-light uppercase tracking-[0.45em] text-ink pl-[0.45em]"
      >
        {NAME.split('').map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            aria-hidden
            className="veil-letter"
            style={{ '--i': i } as CSSProperties}
          >
            {letter}
          </span>
        ))}
      </span>
    </div>
  );
}
