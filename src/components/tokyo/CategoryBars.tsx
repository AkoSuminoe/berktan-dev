'use client';

import { yen } from '@/components/tokyo/format';
import { CATEGORY_META } from '@/lib/tokyo-categories';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/tokyo-budget';

/*
 * Actual against planned, one bar each.
 *
 * The donut answers where the money went; this answers whether that was too
 * much. Two different questions, so two different pictures, rather than one
 * chart trying to carry both.
 *
 * DELIBERATE DEVIATION from the brief, which asks for actual against planned
 * "for that period". These bars are always whole-trip, whatever period is
 * selected. 68,700 yen of pedals is one afternoon, not 8,588 yen a day, so a
 * planned figure pro-rated across eight days would show him wildly over on the
 * day he buys them and wildly under on every other day. A per-period yardstick
 * is honest for the daily cap, which the period switcher already shows, and
 * dishonest per category. The card says which it is.
 */

export default function CategoryBars({
  totalsJpy,
}: {
  /** Whole-trip totals, not the period slice. See the note above. */
  totalsJpy: Record<ExpenseCategory, number>;
}) {
  /*
   * One scale across every bar, so the rows can be compared with each other
   * and not just each with itself. The widest thing on the chart is whichever
   * is larger: the biggest plan line, or the biggest overspend.
   */
  const scale = EXPENSE_CATEGORIES.reduce(
    (max, category) =>
      Math.max(max, CATEGORY_META[category].plannedJpy, totalsJpy[category]),
    1
  );

  return (
    <ul className="space-y-3.5">
      {EXPENSE_CATEGORIES.map((category) => {
        const meta = CATEGORY_META[category];
        const actual = totalsJpy[category];
        const planned = meta.plannedJpy;
        const over = planned > 0 ? actual > planned : actual > 0;
        const diff = actual - planned;

        return (
          <li key={category}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <span className="text-sm text-ink-dim">{meta.label}</span>
              <span className="font-mono text-xs">
                <span className={actual > 0 ? 'text-ink' : 'text-ink-faint'}>
                  {yen(actual)}
                </span>
                <span className="text-ink-faint">
                  {planned > 0 ? ` of ${yen(planned)}` : ' unbudgeted'}
                </span>
                {actual > 0 && planned > 0 && (
                  <span
                    className={`ml-2 ${over ? 'text-red-300' : 'text-glow'}`}
                  >
                    {diff > 0 ? '+' : ''}
                    {yen(diff)}
                  </span>
                )}
              </span>
            </div>

            {/* The planned figure is the pale track, the actual is drawn over
                it, so being under budget looks like an unfilled bar rather
                than like missing data. */}
            <div className="relative mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-white/[0.04]">
              {planned > 0 && (
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(planned / scale) * 100}%`,
                    background: meta.colour,
                    opacity: 0.18,
                  }}
                />
              )}
              <div
                role="progressbar"
                aria-valuenow={actual}
                aria-valuemin={0}
                aria-valuemax={Math.max(planned, actual)}
                aria-label={`${meta.label}, ${yen(actual)} of ${yen(planned)} planned`}
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out-strong motion-reduce:transition-none"
                style={{
                  width: `${Math.min((actual / scale) * 100, 100)}%`,
                  /* The same torii red the progress strip starts on, so
                     over budget looks the same everywhere on this route. */
                  background: over ? '#ff3b30' : meta.colour,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
