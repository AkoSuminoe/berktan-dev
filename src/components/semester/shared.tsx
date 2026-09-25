'use client';

/*
 * Pieces every /semester tab needs: the category colour channel, the legend,
 * the weekly focus cards and the small stepper button.
 *
 * The colour reaches CSS as a custom property rather than an inline
 * `background`, so the mixing rules stay in globals.css and a block only has
 * to say which category it is. One place to change how a block is painted.
 */

import type { CSSProperties } from 'react';
import {
  CATEGORIES,
  CATEGORY_COLOUR,
  SOFT_CATEGORIES,
  type CategoryId,
  type FocusKey,
  type Week,
} from '@/data/semester-plan';

export const SOFT = new Set<CategoryId>(SOFT_CATEGORIES);

/** `--c` is read by `.plan-block`, the legend swatch and the focus cards. */
export function hue(cat: CategoryId): CSSProperties {
  return { ['--c' as string]: CATEGORY_COLOUR[cat] } as CSSProperties;
}

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {(Object.keys(CATEGORIES) as CategoryId[]).map((cat) => (
        <li
          key={cat}
          style={hue(cat)}
          className="flex items-center gap-2 text-xs text-ink-faint"
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-[var(--c)]"
          />
          {CATEGORIES[cat]}
        </li>
      ))}
    </ul>
  );
}

/*
 * Every focus key is also a category id, so a card and the blocks it describes
 * share one colour with no second lookup table to fall out of step.
 *
 * Classes and guitar carry a standing default: they happen every week whether
 * or not that week names them, and a card that silently disappears reads as
 * "nothing this week" rather than "as usual".
 */
const FOCUS_ORDER: { key: FocusKey; label: string }[] = [
  { key: 'classes', label: 'Classes' },
  { key: 'fyp', label: 'FYP' },
  { key: 'aws', label: 'AWS' },
  { key: 'leetcode', label: 'LeetCode' },
  { key: 'jobs', label: 'Applications' },
  { key: 'profiler', label: 'JVM profiler' },
  { key: 'guitar', label: 'Guitar' },
];

const FOCUS_DEFAULT: Partial<Record<FocusKey, string>> = {
  classes: 'Same day and next day revision, Friday synthesis.',
  guitar: '30 min a day, 60 min on Saturday.',
};

export function FocusCards({ week }: { week: Week }) {
  const cards = FOCUS_ORDER.map(({ key, label }) => ({
    key,
    label,
    text: week.focus[key] ?? FOCUS_DEFAULT[key],
  })).filter((c): c is { key: FocusKey; label: string; text: string } =>
    Boolean(c.text)
  );

  return (
    <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <li
          key={card.key}
          style={hue(card.key)}
          className="pl-3 shadow-[inset_2px_0_0_0_var(--c)]"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--c)]">
            {card.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-dim">{card.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** A note the plan attaches to a whole week. Tinted, never red: it is context. */
export function WeekNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-glow/[0.07] px-4 py-3 text-sm leading-relaxed text-ink-dim shadow-[inset_0_0_0_1px_rgba(130,143,255,0.16)]">
      {children}
    </p>
  );
}

/** Small pill button used by every date and week stepper on this page. */
export function StepButton({
  onClick,
  label,
  children,
  disabled,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="shrink-0 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[color,transform,opacity] duration-200 ease-out-strong hover:text-ink active:scale-[0.97] active:duration-100 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transform-none"
    >
      {children}
    </button>
  );
}
