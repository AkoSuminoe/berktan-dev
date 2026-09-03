'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ChecklistItem from '@/components/tokyo/ChecklistItem';
import PersonalPlan from '@/components/tokyo/PersonalPlan';
import NightsAndFood from '@/components/tokyo/NightsAndFood';
import MoneyTab from '@/components/tokyo/MoneyTab';
import CultureNotes from '@/components/tokyo/CultureNotes';
import RateSheet from '@/components/tokyo/RateSheet';
import {
  CHECKLIST_STORAGE_KEY,
  reclaimProfileData,
} from '@/lib/tokyo-storage';
import {
  tokyoDays,
  tokyoMeta,
  totalItemCount,
  type TokyoDay,
} from '@/lib/tokyo-itinerary';
import { personalItemIds, personalItemCount } from '@/lib/tokyo-personal';
import { nightsItemIds, nightsItemCount } from '@/lib/tokyo-nights';
import { useTokyoBudget } from '@/hooks/useTokyoBudget';
import { useTokyoFx } from '@/hooks/useTokyoFx';
import { useTokyoSettings } from '@/hooks/useTokyoSettings';
import { effectiveRate } from '@/lib/tokyo-settings';
import { tokyoDateKey, totalSpent } from '@/lib/tokyo-budget';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
/* Strong ease-out. Anything entering, leaving, or answering a press uses it. */
const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

/*
 * Progress spring. damping / (2 * sqrt(stiffness)) = 30 / (2 * sqrt(220))
 * = 1.01, i.e. critically damped, no overshoot; response 2*pi/sqrt(220)
 * = 0.42s. That is Apple's "move / reposition" pairing (damping 1.0,
 * response 0.4). Critically damped matters here: a progress bar that
 * overshoots past its own value is lying about the number next to it.
 */
const PROGRESS_SPRING = { stiffness: 220, damping: 30, restDelta: 0.2 };

/**
 * Every id either tab can legitimately produce. Saved progress is filtered
 * against this so a stale entry from an older itinerary (or hand-edited
 * localStorage) can never count towards the progress bar.
 *
 * All three lists must be here. When this was WWC-only, a personal checkbox
 * wrote to localStorage and was then silently discarded on the next load,
 * which reads as data loss rather than as validation. Adding a fourth source
 * of tickable ids means adding it here too.
 */
const WWC_ITEM_IDS = tokyoDays.flatMap((day) =>
  day.items.map((item) => item.id)
);
const VALID_ITEM_IDS = new Set([
  ...WWC_ITEM_IDS,
  ...personalItemIds,
  ...nightsItemIds,
]);

function readSavedIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter(
        (id): id is string => typeof id === 'string' && VALID_ITEM_IDS.has(id)
      )
    );
  } catch {
    return new Set();
  }
}

type Tab = 'wwc' | 'personal' | 'nights' | 'money' | 'culture';

const TABS: { id: Tab; label: string }[] = [
  { id: 'wwc', label: 'Programme' },
  { id: 'personal', label: 'Personal' },
  { id: 'nights', label: 'Nights' },
  { id: 'money', label: 'Money' },
  { id: 'culture', label: 'Culture' },
];

/**
 * Which list the progress strip is describing. Per-tab rather than a union:
 * one bar over all of them would move when you switch tabs without ticking
 * anything, and would let one list push another's percentage past 100.
 *
 * Partial on purpose. Money has no checklist, so it takes its figure from
 * spending instead, and a tab with neither gets no bar at all rather than a
 * bar that describes nothing.
 */
const PROGRESS_SCOPE: Partial<
  Record<Tab, { ids: string[]; total: number; label: string }>
> = {
  wwc: { ids: WWC_ITEM_IDS, total: totalItemCount, label: 'programme' },
  personal: {
    ids: personalItemIds,
    total: personalItemCount,
    label: 'personal',
  },
  nights: { ids: nightsItemIds, total: nightsItemCount, label: 'nights' },
};

/* ------------------------------------------------------------------ */
/* Maps helpers                                                        */
/* ------------------------------------------------------------------ */

function mapsUrlForDay(day: TokyoDay): string | null {
  const stops = day.items
    .map((item) => item.mapsQuery)
    .filter((q): q is string => Boolean(q));
  if (stops.length === 0) return null;
  if (stops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`;
  }
  return `https://www.google.com/maps/dir/${stops
    .map((s) => encodeURIComponent(s))
    .join('/')}`;
}

/* ------------------------------------------------------------------ */
/* Day card                                                            */
/* ------------------------------------------------------------------ */

function DayCard({
  day,
  index,
  checkedIds,
  onToggle,
}: {
  day: TokyoDay;
  index: number;
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const mapsUrl = useMemo(() => mapsUrlForDay(day), [day]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      /* Column-paired stagger: the right card trails the left by 60ms, which
         is inside Emil's 30-80ms window. */
      transition={{ duration: 0.62, delay: (index % 2) * 0.06, ease: easeOut }}
    >
      <GlassCard className="h-full" coreClassName="p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-ink-faint">
              Day {day.day} · {day.weekday} {day.date}
            </p>
            <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
              {day.title}
            </h3>
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-white/[0.045] py-1.5 pl-4 pr-1.5 text-xs font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-[transform,box-shadow] duration-[280ms] ease-out-strong hover:scale-[1.025] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(255,255,255,0.1)] active:scale-[0.975] active:duration-[120ms]"
            >
              Open in Google Maps
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.07] transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
              </span>
            </a>
          )}
        </div>

        <div className="mt-5 space-y-1">
          {day.items.map((item) => (
            <ChecklistItem
              key={item.id}
              id={item.id}
              label={item.label}
              detail={item.detail}
              checked={checkedIds.has(item.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Planner                                                             */
/* ------------------------------------------------------------------ */

export default function TokyoPlanner() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>('wwc');

  /*
   * Keeps the chosen pill on screen. Tapping the last one in a scrolled row
   * otherwise leaves it half cut off, which reads as an unfinished tap.
   */
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  useEffect(() => {
    tabRefs.current[tab]?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }, [tab, reduce]);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  /*
   * Lifted here so both tabs write to one record: a nightlife expense entered
   * on the Nights tab is the same money as a shopping expense on the Personal
   * tab, and the prefill has to survive switching between them.
   */
  const budgetBinding = useTokyoBudget();

  /*
   * One rate for the page. Fetched once here rather than per tab, so the
   * header, the converter and the budget can never disagree about what today's
   * number is.
   */
  const fx = useTokyoFx();

  /*
   * Mid-market with the card's cut taken off. This, not `fx.rate`, is what
   * every forward-looking figure converts at: it is what he will actually be
   * charged. The sheet still shows both, so the difference stays visible.
   */
  const settingsBinding = useTokyoSettings();
  const effective = effectiveRate(
    fx.rate,
    settingsBinding.settings,
    tokyoDateKey()
  );

  /*
   * Hydrate saved progress, after mount so server and client markup match.
   *
   * The reclaim runs first and exactly once: the profile chooser was live for a
   * day, and anything ticked in that time is still under its namespaced key.
   * Reading before rescuing would show an empty list and then save over it.
   */
  useEffect(() => {
    reclaimProfileData();
    setCheckedIds(readSavedIds());
  }, []);

  const onToggle = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(
          CHECKLIST_STORAGE_KEY,
          JSON.stringify(Array.from(next))
        );
      } catch {}
      return next;
    });
  }, []);

  /*
   * Counted by filtering the id list rather than iterating the Set, because the
   * project compiles to ES5 where Set iteration needs downlevelIteration.
   */
  const scope = PROGRESS_SCOPE[tab];
  const completed = useMemo(
    () => (scope ? scope.ids.filter((id) => checkedIds.has(id)).length : 0),
    [scope, checkedIds]
  );

  /*
   * What the strip reports on this tab. Money measures spending against the
   * budget, which is a genuine progress figure and the one thing worth seeing
   * from every scroll position on that tab. Before a budget exists there is
   * nothing to be a percentage of, so the bar goes rather than reading 0%.
   */
  const budget = budgetBinding.state;
  const spentPct =
    budget.totalJpy !== null && budget.totalJpy > 0
      ? Math.min(100, Math.round((totalSpent(budget) / budget.totalJpy) * 100))
      : null;

  const meter: { pct: number; label: string } | null =
    tab === 'money'
      ? budgetBinding.ready && spentPct !== null
        ? { pct: spentPct, label: 'of budget' }
        : null
      : scope
        ? {
            pct: Math.min(
              100,
              Math.round((completed / Math.max(scope.total, 1)) * 100)
            ),
            label: scope.label,
          }
        : null;

  const pct = meter?.pct ?? 0;

  /*
   * The fill is a full-width gradient revealed by clip-path, never an animated
   * width. Two reasons: width animates layout and paint on every frame, and
   * scaleX would squash the gradient so the colour at the leading edge would
   * lie about how far along you are. Clipping keeps red -> blue anchored to
   * the track, so the head genuinely travels through the spectrum.
   *
   * The value runs through a spring so rapid toggling retargets from the
   * current position with its velocity intact instead of restarting.
   */
  const progress = useSpring(0, PROGRESS_SPRING);
  const clipPath = useTransform(
    progress,
    (value) => `inset(0 ${(100 - value).toFixed(2)}% 0 0 round 999px)`
  );

  useEffect(() => {
    if (reduce) progress.jump(pct);
    else progress.set(pct);
  }, [pct, reduce, progress]);

  // Entrances sync with the Flying-to-Tokyo curtain; skip once it has played
  const [curtainPlayed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem('bs-tokyo-curtain') === '1';
    } catch {
      return false;
    }
  });
  // Lands 100ms into the veil's dissolve, so the two overlap.
  const base = reduce || curtainPlayed ? 0.1 : 1.75;

  /* A helper rather than a ternary chain: four arms nested inline stopped
     being readable at three. */
  function renderPanel() {
    switch (tab) {
      case 'wwc':
        return (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {tokyoDays.map((day, index) => (
              <DayCard
                key={day.id}
                day={day}
                index={index}
                checkedIds={checkedIds}
                onToggle={onToggle}
              />
            ))}
          </div>
        );
      case 'personal':
        return (
          <PersonalPlan
            checkedIds={checkedIds}
            onToggle={onToggle}
            budgetBinding={budgetBinding}
            rate={effective}
            atmFeeJpy={settingsBinding.settings.atmFeeJpy}
          />
        );
      case 'nights':
        return (
          <NightsAndFood
            checkedIds={checkedIds}
            onToggle={onToggle}
            budgetBinding={budgetBinding}
            rate={effective}
            atmFeeJpy={settingsBinding.settings.atmFeeJpy}
          />
        );
      case 'money':
        return (
          <MoneyTab
            budgetBinding={budgetBinding}
            settingsBinding={settingsBinding}
            checkedIds={checkedIds}
            rate={effective}
            quote={fx.quote}
          />
        );
      case 'culture':
        return <CultureNotes />;
    }
  }

  return (
    <>
      {/* Sticky progress strip: torii red to cyber blue, Tokyo-scoped accent.
          Floating chrome, so it is the one surface here allowed a blur. */}
      <div className="material sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          {meter ? (
            <>
              <div
                role="progressbar"
                aria-valuenow={meter.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress, ${meter.label}`}
                className="h-[3px] flex-1 rounded-full bg-white/[0.07]"
              >
                <motion.div
                  className="h-full w-full rounded-full"
                  style={{
                    clipPath,
                    background:
                      'linear-gradient(90deg, #ff3b30 0%, #57c1ff 100%)',
                  }}
                />
              </div>
              <p className="shrink-0 font-mono text-xs text-ink-dim">
                {meter.pct}% {meter.label}
              </p>
            </>
          ) : (
            /* Nothing to measure. The strip keeps its height and its rate
               button rather than collapsing under the header. */
            <p className="flex-1 font-mono text-xs text-ink-faint">
              {tab === 'money' ? 'No budget set' : 'Things to know'}
            </p>
          )}

          {/* Reachable from every tab: the ladder is a shop tool. */}
          <RateSheet quote={fx.quote} state={fx.state} effective={effective} />
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 pb-40 pt-10 sm:px-6">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: base, ease }}
          className="text-sm font-medium text-ink-dim"
        >
          {tokyoMeta.programme}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: base + 0.1, ease }}
          className="mt-3 text-5xl sm:text-6xl font-semibold tracking-tighter text-ink"
        >
          Tokyo.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: base + 0.2, ease }}
          className="mt-4 max-w-xl text-base leading-relaxed text-ink-dim"
        >
          {tokyoMeta.dateRange} · staying at {tokyoMeta.hotel.name}, flying{' '}
          {tokyoMeta.outbound.flight} out and {tokyoMeta.inbound.flight} home.
        </motion.p>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: base + 0.3, ease }}
          /* The row scrolls sideways rather than wrapping: five pills do not
             fit across a 390px phone, and a wrapped second line would move the
             whole page down by 40px on the narrowest screens only. */
          className="no-scrollbar -mx-4 mt-10 flex overflow-x-auto overscroll-x-contain touch-pan-x px-4 sm:mx-0 sm:px-0"
        >
          <div
            className="inline-flex shrink-0 items-center gap-1"
            role="tablist"
            aria-label="Itinerary plans"
          >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`relative shrink-0 rounded-full px-4 max-[400px]:px-[10px] py-1.5 text-sm max-[400px]:text-[13px] font-medium transition-[color,transform] duration-200 ease-out-strong active:scale-[0.97] active:duration-100 motion-reduce:transform-none ${
                tab === id ? 'text-ink' : 'text-ink-faint hover:text-ink-dim'
              }`}
            >
              {tab === id && (
                <motion.span
                  layoutId="tokyo-tab-pill"
                  /* A layout animation is a morph on screen and can be
                     interrupted by a second click, so it wants a spring, not a
                     fixed duration. A trace of bounce because the pill is
                     being thrown from one slot to the other. */
                  transition={{ type: 'spring', duration: 0.42, bounce: 0.14 }}
                  className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
          </div>
        </motion.div>

        {/* Panels */}
        <div className="mt-8">
          {/* One wrapper keyed on the tab, rather than a copy of the same six
              motion props per panel. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              /* mode="wait" plays exit then enter, so the exit has to be short
                 or the panel sits empty. 180 + 360 = 540ms total. */
              exit={{
                opacity: 0,
                y: -8,
                transition: { duration: 0.18, ease: easeOut },
              }}
              transition={{ duration: 0.36, ease: easeOut }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
