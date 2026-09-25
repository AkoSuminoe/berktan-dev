'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { FocusCards, StepButton, WeekNote, SOFT, hue } from '@/components/semester/shared';
import {
  BAD_DAY,
  DAY_NAMES,
  addDays,
  blocksForDate,
  formatShort,
  toISO,
  type Block,
  type CategoryId,
} from '@/data/semester-plan';
import type { BadDayMap, DoneMap } from '@/lib/semester-storage';

/*
 * One day, tickable.
 *
 * Bad day mode is a per-date switch rather than a global one: it describes
 * what happened on a Tuesday, so it has to stay on that Tuesday. Its ticks are
 * stored under a separate key prefix, because the short list and the full list
 * have different indices and sharing a key would mark the wrong rows.
 */

const PROGRESS_SPRING = { stiffness: 220, damping: 30, restDelta: 0.2 };

type Row = { cat: CategoryId; title: string; detail?: string; time: string | null };

function toRows(blocks: Block[]): Row[] {
  return blocks.map((b) => ({
    cat: b.cat,
    title: b.title,
    detail: b.detail,
    time: `${b.start} to ${b.end}`,
  }));
}

export default function TodayTab({
  date,
  setDate,
  today,
  done,
  setDone,
  badDays,
  setBadDays,
}: {
  date: Date;
  setDate: (next: Date) => void;
  today: Date | null;
  done: DoneMap;
  setDone: (next: DoneMap) => void;
  badDays: BadDayMap;
  setBadDays: (next: BadDayMap) => void;
}) {
  const reduce = useReducedMotion();
  const key = toISO(date);
  const day = useMemo(() => blocksForDate(date), [date]);
  const isBad = badDays[key] === true;
  /* Separate namespace: the two lists do not share row indices. */
  const doneKey = isBad ? `bad:${key}` : key;
  const ticks = done[doneKey] ?? {};

  const rows: Row[] = useMemo(() => {
    if (!day) return [];
    if (isBad) {
      return BAD_DAY.map((b) => ({
        cat: b.cat,
        title: b.title,
        detail: b.detail,
        time: null,
      }));
    }
    return toRows(day.blocks);
  }, [day, isBad]);

  const tickable = rows.filter((r) => !SOFT.has(r.cat)).length;
  const ticked = rows.filter((r, i) => !SOFT.has(r.cat) && ticks[i]).length;
  const pct = tickable === 0 ? 0 : Math.min(100, (ticked / tickable) * 100);

  /*
   * Spring-driven clip-path, matching the /tokyo progress bar. Width is never
   * animated (layout plus paint every frame) and scaleX would squash the
   * gradient, so the leading edge would report the wrong colour for the value.
   */
  const progress = useSpring(0, PROGRESS_SPRING);
  const clip = useTransform(progress, (v) => `inset(0 ${100 - v}% 0 0 round 999px)`);
  useEffect(() => {
    if (reduce) progress.jump(pct);
    else progress.set(pct);
  }, [pct, progress, reduce]);

  const toggle = useCallback(
    (index: number) => {
      const next: DoneMap = { ...done };
      const forDay = { ...(next[doneKey] ?? {}) };
      if (forDay[index]) delete forDay[index];
      else forDay[index] = true;
      next[doneKey] = forDay;
      setDone(next);
    },
    [done, doneKey, setDone]
  );

  const toggleBadDay = useCallback(() => {
    const next: BadDayMap = { ...badDays };
    if (next[key]) delete next[key];
    else next[key] = true;
    setBadDays(next);
  }, [badDays, key, setBadDays]);

  const isToday = today ? toISO(today) === key : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StepButton onClick={() => setDate(addDays(date, -1))} label="Previous day">
          Previous
        </StepButton>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {DAY_NAMES[(date.getDay() + 6) % 7]}, {formatShort(date)}
          </p>
          <p className="font-mono text-xs text-ink-faint">
            {day
              ? `Week ${day.weekNumber}: ${day.week.label}${isBad ? ', bad day version' : ''}`
              : 'Outside the plan'}
          </p>
        </div>
        <StepButton onClick={() => setDate(addDays(date, 1))} label="Next day">
          Next
        </StepButton>
        {today && !isToday && (
          <StepButton onClick={() => setDate(today)} label="Back to today">
            Today
          </StepButton>
        )}
      </div>

      {!day ? (
        <GlassCard coreClassName="p-6">
          <p className="text-sm text-ink-dim">
            This date is outside the plan, which runs from 21 September 2026 to
            17 January 2027.
          </p>
        </GlassCard>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleBadDay}
              aria-pressed={isBad}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-[color,background-color,transform] duration-200 ease-out-strong active:scale-[0.97] active:duration-100 motion-reduce:transform-none ${
                isBad
                  ? 'bg-glow/20 text-ink shadow-[inset_0_0_0_1px_rgba(130,143,255,0.35)]'
                  : 'bg-white/[0.04] text-ink-faint shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:text-ink-dim'
              }`}
            >
              Bad day mode
            </button>
            <p className="font-mono text-xs text-ink-faint">
              {ticked} / {tickable}
            </p>
          </div>

          {/* Progress. aria-valuenow is the integer the label would read. */}
          <div
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Blocks completed today"
            className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]"
          >
            <motion.div
              style={{ clipPath: clip }}
              className="h-full w-full rounded-full bg-gradient-to-r from-glow-deep to-glow"
            />
          </div>

          {day.week.note && <WeekNote>{day.week.note}</WeekNote>}

          <GlassCard coreClassName="p-5 sm:p-7">
            <FocusCards week={day.week} />
          </GlassCard>

          <GlassCard coreClassName="p-5 sm:p-6">
            <ul className="space-y-1">
              {rows.map((row, i) => {
                const soft = SOFT.has(row.cat);
                const on = ticks[i] === true;
                return (
                  <li
                    key={`${row.title}-${i}`}
                    style={hue(row.cat)}
                    className="flex items-start gap-3 py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.04)] last:shadow-none"
                  >
                    {soft ? (
                      <span
                        aria-hidden
                        className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-[3px] bg-[var(--c)]/45"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(i)}
                        aria-label={`${row.title} done`}
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--c)]"
                      />
                    )}
                    {row.time && (
                      <span className="mt-0.5 w-[5.5rem] shrink-0 font-mono text-[11px] text-ink-faint">
                        {row.time}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          on
                            ? 'text-ink-faint line-through'
                            : soft
                              ? 'text-ink-faint'
                              : 'font-medium text-ink'
                        }`}
                      >
                        {row.title}
                      </p>
                      {row.detail && (
                        <p className="mt-1 max-w-[75ch] text-xs leading-relaxed text-ink-dim">
                          {row.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </GlassCard>
        </>
      )}
    </div>
  );
}
