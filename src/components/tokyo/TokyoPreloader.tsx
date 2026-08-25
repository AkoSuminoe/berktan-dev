'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Plane } from 'lucide-react';

const TEXT = 'Flying to Tokyo...';

/*
 * Same veil grammar as the homepage (see .veil in globals.css), retimed for a
 * longer string: 18 characters at 44ms would run a 750ms cascade, so the
 * stagger drops to 26ms and the whole wordmark settles by ~1.2s.
 *   160ms  first letter
 *   602ms  last letter starts   (160 + 17 x 26ms)
 *  1202ms  settled
 *  1650ms  veil starts receding, plane keeps flying out to the right
 * TokyoPlanner delays its first entrance to 1.75s to overlap the dissolve.
 */
const HOLD_DURATION = 1650;
const REDUCED_HOLD = 380;
const EXIT_FALLBACK = 900;

type Phase = 'holding' | 'leaving' | 'gone';

export default function TokyoPreloader() {
  const [phase, setPhase] = useState<Phase>('holding');
  const reduce = useReducedMotion();

  useEffect(() => {
    if (phase !== 'holding') return;

    // Play the veil once per session; later visits dismiss without animating.
    // (Checked in the effect, not in state init, to keep SSR markup stable.)
    let played = false;
    try {
      played = window.sessionStorage.getItem('bs-tokyo-curtain') === '1';
    } catch {}
    if (played) {
      setPhase('gone');
      return;
    }

    document.body.style.overflow = 'hidden';
    const timeout = setTimeout(
      () => {
        setPhase('leaving');
        document.body.style.overflow = '';
        try {
          window.sessionStorage.setItem('bs-tokyo-curtain', '1');
        } catch {}
      },
      reduce ? REDUCED_HOLD : HOLD_DURATION
    );
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = '';
    };
  }, [reduce, phase]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const timeout = setTimeout(() => setPhase('gone'), EXIT_FALLBACK);
    return () => clearTimeout(timeout);
  }, [phase]);

  if (phase === 'gone') return null;

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
      <div className="flex items-center gap-4">
        <span aria-hidden className="veil-plane text-ink-dim">
          <span className="veil-plane-arrival">
            <Plane className="h-5 w-5 rotate-12" strokeWidth={1.5} />
          </span>
        </span>

        <span
          aria-label={TEXT}
          style={{ '--stagger': '26ms', '--lead': '160ms' } as CSSProperties}
          className="veil-mark flex text-xl sm:text-2xl font-light tracking-[0.3em] uppercase text-ink"
        >
          {TEXT.split('').map((letter, i) => (
            <span
              key={`${letter}-${i}`}
              aria-hidden
              className="veil-letter whitespace-pre"
              style={{ '--i': i } as CSSProperties}
            >
              {letter}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
