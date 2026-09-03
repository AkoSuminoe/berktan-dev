'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { yen, gbp } from '@/components/tokyo/format';
import { CATEGORY_ICONS } from '@/components/tokyo/categoryIcons';
import { CATEGORY_META } from '@/lib/tokyo-categories';
import { arcsFor } from '@/lib/tokyo-donut';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/tokyo-budget';

/*
 * Where the money went.
 *
 * Hand-rolled SVG rather than a charting library. Recharts is not a dependency
 * despite the brief saying so, and eight arcs plus a legend is not worth 90kB
 * of one. The arc geometry lives in lib/tokyo-donut.ts so it can be checked
 * without a renderer.
 *
 * MOTION, declared rather than slipped in. The arcs draw once on mount by
 * transitioning `stroke-dashoffset`. That is a fifth animated property beyond
 * the transform / opacity / clip-path set the project holds itself to, and it
 * is a deliberate exception: eight elements, one shot, nothing coupled to
 * scroll, and there is no transform that reveals an arc. Skipped outright
 * under prefers-reduced-motion.
 */

const SIZE = 200;
const CENTRE = SIZE / 2;
const ACTUAL_R = 74;
const ACTUAL_W = 22;
const PLANNED_R = 92;
const PLANNED_W = 3;

type Slice = {
  category: ExpenseCategory;
  jpy: number;
  gbpValue: number;
  fraction: number;
};

export default function SpendDonut({
  totalsJpy,
  totalsGbp,
  remainingLabel,
  activeCategory,
  onFilter,
  onAdd,
}: {
  totalsJpy: Record<ExpenseCategory, number>;
  totalsGbp: Record<ExpenseCategory, number>;
  /** Rendered under the centre total. Already formatted, already labelled. */
  remainingLabel: string | null;
  activeCategory: ExpenseCategory | null;
  onFilter: (category: ExpenseCategory | null) => void;
  onAdd: (category: ExpenseCategory) => void;
}) {
  const reduce = useReducedMotion();

  /* Drawn at zero on the first paint, then released, so the ring sweeps in. */
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (reduce) return setDrawn(true);
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  const total = EXPENSE_CATEGORIES.reduce(
    (sum, category) => sum + totalsJpy[category],
    0
  );

  const slices: Slice[] = EXPENSE_CATEGORIES.filter(
    (category) => totalsJpy[category] > 0
  ).map((category) => ({
    category,
    jpy: totalsJpy[category],
    gbpValue: totalsGbp[category],
    fraction: total > 0 ? totalsJpy[category] / total : 0,
  }));

  /*
   * The empty state is the point of the design. Day one has no data, and a
   * blank circle says nothing; the plan's own split, drawn as a hairline ring,
   * says what the shape is supposed to end up looking like. It stays visible
   * once real spending arrives, as the thing being compared against.
   */
  const plannedTotal = EXPENSE_CATEGORIES.reduce(
    (sum, category) => sum + CATEGORY_META[category].plannedJpy,
    0
  );
  const plannedArcs = arcsFor(
    PLANNED_R,
    EXPENSE_CATEGORIES.filter(
      (category) => CATEGORY_META[category].plannedJpy > 0
    ).map((category) => ({
      key: category,
      fraction: CATEGORY_META[category].plannedJpy / plannedTotal,
      colour: CATEGORY_META[category].colour,
    }))
  );

  const actualArcs = arcsFor(
    ACTUAL_R,
    slices.map((slice) => ({
      key: slice.category,
      fraction: slice.fraction,
      colour: CATEGORY_META[slice.category].colour,
    }))
  );

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-10">
      {/* The chart. Decorative: every value in it is in the legend beside it,
          which is also where the controls are. */}
      <div className="relative shrink-0">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-hidden
          className="-rotate-90"
        >
          {/* Planned, hairline */}
          {plannedArcs.map((arc) => (
            <circle
              key={`planned-${arc.key}`}
              cx={CENTRE}
              cy={CENTRE}
              r={PLANNED_R}
              fill="none"
              stroke={arc.colour}
              strokeOpacity={0.28}
              strokeWidth={PLANNED_W}
              strokeDasharray={arc.dash}
              strokeDashoffset={arc.offset}
            />
          ))}

          {/* The track the actual arcs sit on, so a near-empty ring still
              reads as a ring rather than as a stray mark. */}
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={ACTUAL_R}
            fill="none"
            stroke="rgba(255,255,255,0.045)"
            strokeWidth={ACTUAL_W}
          />

          {actualArcs.map((arc) => (
            <circle
              key={`actual-${arc.key}`}
              cx={CENTRE}
              cy={CENTRE}
              r={ACTUAL_R}
              fill="none"
              stroke={arc.colour}
              strokeWidth={ACTUAL_W}
              strokeDasharray={arc.dash}
              strokeDashoffset={drawn ? arc.offset : arc.offset + arc.circumference}
              opacity={
                activeCategory === null || activeCategory === arc.key ? 1 : 0.25
              }
              style={{
                transition: reduce
                  ? 'opacity 200ms'
                  : 'stroke-dashoffset 620ms cubic-bezier(0.23, 1, 0.32, 1), opacity 240ms cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            />
          ))}
        </svg>

        {/* Centre. Absolutely positioned rather than SVG text, so it uses the
            same font stack and tabular figures as every other number here. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-2xl tracking-tight text-ink">
            {yen(total)}
          </p>
          {remainingLabel && (
            <p className="mt-1 max-w-[7.5rem] text-center text-[11px] leading-tight text-ink-faint">
              {remainingLabel}
            </p>
          )}
        </div>
      </div>

      {/* The legend is the accessible control, and it carries every value, so
          colour never has to be the thing that tells you what a slice is. */}
      <ul className="w-full min-w-0 flex-1 space-y-0.5">
        {EXPENSE_CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category];
          const Icon = CATEGORY_ICONS[category];
          const amount = totalsJpy[category];
          const share = total > 0 ? Math.round((amount / total) * 100) : 0;
          const active = activeCategory === category;

          return (
            <li key={category} className="group/row flex items-center gap-1">
              <button
                type="button"
                onClick={() => onFilter(active ? null : category)}
                aria-pressed={active}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-200 ${
                  active ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                }`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: meta.colour,
                    opacity: amount > 0 ? 1 : 0.35,
                  }}
                />
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-ink-faint"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-dim">
                  {meta.label}
                </span>
                <span className="shrink-0 text-right font-mono text-xs">
                  <span className={amount > 0 ? 'text-ink' : 'text-ink-faint'}>
                    {yen(amount)}
                  </span>
                  <span className="ml-2 text-ink-faint">
                    {gbp(totalsGbp[category])}
                  </span>
                  <span className="ml-2 hidden tabular-nums text-ink-faint sm:inline">
                    {share}%
                  </span>
                </span>
              </button>

              {/* Record something in this category. Separate from the filter,
                  so one tap never means two things. */}
              <button
                type="button"
                onClick={() => onAdd(category)}
                aria-label={`Add a ${meta.label.toLowerCase()} expense`}
                className="shrink-0 rounded-lg p-1.5 text-ink-faint opacity-0 transition-[opacity,color] duration-200 hover:text-ink focus-visible:opacity-100 group-hover/row:opacity-100"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
