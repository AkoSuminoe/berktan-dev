'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { LADDER_STEPS, ageLabel, type FxQuote, type Staleness } from '@/lib/tokyo-fx';

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

/* The dot carries the state; the words beside it never contradict it. */
const DOT = {
  fresh: 'bg-glow shadow-[0_0_8px_-1px_rgba(130,143,255,0.9)]',
  stale: 'bg-amber-400 shadow-[0_0_8px_-1px_rgba(251,191,36,0.8)]',
  offline: 'bg-ink-faint',
} as const;

function yenOf(gbp: number, rate: number) {
  return Math.round(gbp * rate).toLocaleString('en-GB');
}

/* ------------------------------------------------------------------ */
/* Converter                                                           */
/* ------------------------------------------------------------------ */

function Converter({ rate, effective }: { rate: number; effective: number }) {
  const [value, setValue] = useState('1000');
  const [fromYen, setFromYen] = useState(true);

  const parsed = Number(value);
  const valid = value !== '' && isFinite(parsed) && parsed >= 0;

  /* Both rates on the result, so the card's cut is seen rather than assumed. */
  const midOut = valid ? (fromYen ? parsed / rate : parsed * rate) : 0;
  const effOut = valid ? (fromYen ? parsed / effective : parsed * effective) : 0;
  const spread = Math.abs(rate - effective) > 0.005;

  return (
    <div>
      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-white/[0.03] px-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06)] focus-within:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.45)]">
          <span aria-hidden className="font-mono text-sm text-ink-faint">
            {fromYen ? '¥' : '£'}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(event) =>
              setValue(event.target.value.replace(/[^0-9.]/g, ''))
            }
            aria-label={fromYen ? 'Amount in yen' : 'Amount in pounds'}
            className="w-full min-w-0 bg-transparent py-2.5 font-mono text-lg text-ink outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setFromYen((previous) => !previous)}
          aria-label="Swap currencies"
          className="shrink-0 rounded-xl bg-white/[0.04] px-3 text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[color,transform] duration-200 ease-out-strong hover:text-ink active:scale-[0.95] motion-reduce:transform-none"
        >
          <ArrowLeftRight className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-white/[0.02] px-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          <span aria-hidden className="font-mono text-sm text-ink-faint">
            {fromYen ? '£' : '¥'}
          </span>
          <output className="min-w-0 truncate py-2.5 font-mono text-lg text-ink">
            {valid
              ? fromYen
                ? effOut.toFixed(2)
                : Math.round(effOut).toLocaleString('en-GB')
              : '0'}
          </output>
        </div>
      </div>

      <p className="mt-2.5 font-mono text-[11px] text-ink-faint">
        {spread ? (
          <>
            your card ¥{effective.toFixed(2)} · mid-market ¥{rate.toFixed(2)} ={' '}
            {fromYen
              ? `£${midOut.toFixed(2)}`
              : `¥${Math.round(midOut).toLocaleString('en-GB')}`}
          </>
        ) : (
          <>
            mid-market ¥{rate.toFixed(2)}. Set a card spread in settings to see
            what you are really charged.
          </>
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

export default function RateSheet({
  quote,
  state,
  effective,
}: {
  quote: FxQuote;
  state: Staleness;
  /** Mid-market adjusted by the card spread. Equals the rate when unset. */
  effective: number;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  /*
   * Escape and a click outside both close it, and focus goes back to the
   * trigger rather than to the top of the document. Listeners are only bound
   * while it is open, so the closed state costs nothing.
   */
  useEffect(() => {
    if (!open) return;

    sheetRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointer(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const ladder = useMemo(
    () =>
      LADDER_STEPS.map((jpy) => ({
        jpy,
        gbp: jpy / effective,
      })),
    [effective]
  );

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-label={`Exchange rate, ${quote.rate.toFixed(2)} yen to the pound. Open the converter.`}
        className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[color,transform] duration-200 ease-out-strong hover:text-ink active:scale-[0.97] motion-reduce:transform-none"
      >
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${DOT[state]}`} />
        ¥{quote.rate.toFixed(1)}
        <span className="hidden text-ink-faint sm:inline">
          {ageLabel(quote)}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-label="Exchange rate and converter"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: -6,
              transition: { duration: 0.14, ease: easeOut },
            }}
            transition={{ duration: 0.28, ease: easeOut }}
            /*
             * `.sheet`, not `.material`: this hangs off the sticky strip, and
             * a backdrop-filter inside a backdrop-filter blurs nothing. See
             * the note on `.sheet` in globals.css.
             *
             * Right-anchored so it cannot push the page sideways on a phone.
             */
            className="sheet absolute right-0 top-[calc(100%+0.6rem)] z-40 w-[min(21rem,calc(100vw-2rem))] origin-top-right rounded-2xl p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.07),0_24px_48px_-12px_rgba(0,0,0,0.7)] outline-none"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">
                Rate
              </p>
              <p className="font-mono text-[11px] text-ink-faint">
                {quote.source === 'fallback'
                  ? 'no live rate, using the planning figure'
                  : `${quote.source === 'erapi' ? 'exchangerate-api' : 'ECB'} · ${ageLabel(quote)}`}
              </p>
            </div>

            {state !== 'fresh' && (
              <p className="mt-2 text-[11px] leading-relaxed text-ink-dim">
                {state === 'offline'
                  ? `Showing the last rate this browser saved, from ${quote.asOf}.`
                  : 'Over a day old. The ECB does not publish at weekends.'}
              </p>
            )}

            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2">
              {ladder.map((step) => (
                <div key={step.jpy} className="flex items-baseline justify-between">
                  <dt className="font-mono text-xs text-ink-dim">
                    ¥{step.jpy.toLocaleString('en-GB')}
                  </dt>
                  <dd className="font-mono text-xs text-ink">
                    £{step.gbp < 10 ? step.gbp.toFixed(2) : step.gbp.toFixed(1)}
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between">
                <dt className="font-mono text-xs text-ink-faint">£10</dt>
                <dd className="font-mono text-xs text-ink-dim">
                  ¥{yenOf(10, effective)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <Converter rate={quote.rate} effective={effective} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
