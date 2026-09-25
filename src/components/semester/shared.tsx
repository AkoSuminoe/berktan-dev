'use client';

/*
 * Pieces every /semester tab needs: the category colour channel, the legend,
 * the weekly focus cards and the section shell.
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
  type Week,
  type WeekFocus,
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
 * The week's headline per stream. `ders` and `gitar` have a standing default
 * because they happen every week whether or not that week names them, and a
 * card that silently disappears reads as "nothing this week" rather than "as
 * usual".
 */
const FOCUS_ORDER: { key: keyof WeekFocus; label: string }[] = [
  { key: 'ders', label: 'Dersler' },
  { key: 'fyp', label: 'FYP' },
  { key: 'aws', label: 'AWS' },
  { key: 'lc', label: 'LeetCode' },
  { key: 'is', label: 'Başvurular' },
  { key: 'proje', label: 'JVM profiler' },
  { key: 'gitar', label: 'Gitar' },
];

const FOCUS_DEFAULT: Partial<Record<keyof WeekFocus, string>> = {
  ders: 'Aynı gün + ertesi gün tekrarı, Cuma sentezi.',
  gitar: 'Günde 30 dk, Cumartesi 60 dk.',
};

const FOCUS_CATEGORY: Record<keyof WeekFocus, CategoryId> = {
  ders: 'ders',
  fyp: 'fyp',
  aws: 'aws',
  lc: 'lc',
  is: 'is',
  proje: 'proje',
  gitar: 'gitar',
};

export function FocusCards({ week }: { week: Week }) {
  const cards = FOCUS_ORDER.map(({ key, label }) => ({
    key,
    label,
    text: week.focus[key] ?? FOCUS_DEFAULT[key],
  })).filter((c): c is { key: keyof WeekFocus; label: string; text: string } =>
    Boolean(c.text)
  );

  return (
    <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <li
          key={card.key}
          style={hue(FOCUS_CATEGORY[card.key])}
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
