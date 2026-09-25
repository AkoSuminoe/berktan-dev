'use client';

import { useEffect, useMemo, useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { FocusCards, StepButton, WeekNote, SOFT, hue } from '@/components/semester/shared';
import {
  addDays,
  blocksForWeek,
  CATEGORIES,
  COURSES,
  DAY_NAMES,
  DAY_SHORT,
  WEEKS,
  dayIndex,
  formatShort,
  parseISO,
  toHours,
  toISO,
  type Block,
} from '@/data/semester-plan';

/*
 * The week view: seven columns, 07:00 to 23:00, one block per scheduled item.
 *
 * Below 768px the grid is replaced by a day picker and a list rather than
 * being squeezed. A seven-column timetable at 390px gives each day 40px, which
 * is narrower than the word "Pazartesi" and unreadable at any font size, so
 * the grid is the wrong instrument on a phone rather than a small version of
 * the right one.
 */

const START_HOUR = 7;
const END_HOUR = 23;
/** One hour of the grid, in rem. Height and every block offset derive from it. */
const HOUR_REM = 3;
const BODY_REM = (END_HOUR - START_HOUR) * HOUR_REM;

type Selected = { day: number; block: number } | null;

function blockGeometry(block: Block) {
  const start = Math.max(toHours(block.start), START_HOUR);
  const end = Math.min(toHours(block.end), END_HOUR);
  if (end <= start) return null;
  return {
    top: (start - START_HOUR) * HOUR_REM,
    height: (end - start) * HOUR_REM,
  };
}

export default function WeekTab({
  weekIndex,
  setWeekIndex,
  today,
}: {
  weekIndex: number;
  setWeekIndex: (next: number) => void;
  today: Date | null;
}) {
  const week = WEEKS[weekIndex];
  const monday = useMemo(() => parseISO(week.start), [week.start]);
  const days = useMemo(() => blocksForWeek(week), [week]);

  const [selected, setSelected] = useState<Selected>(null);
  const [mobileDay, setMobileDay] = useState(0);

  const todayKey = today ? toISO(today) : null;

  /* Landing on the current week should open on the current day, not Monday. */
  useEffect(() => {
    if (!today) return;
    const sameWeek = today >= monday && today < addDays(monday, 7);
    setMobileDay(sameWeek ? dayIndex(today) : 0);
    setSelected(null);
  }, [monday, today]);

  const nowOffset = useMemo(() => {
    if (!today) return null;
    const hours = today.getHours() + today.getMinutes() / 60;
    if (hours < START_HOUR || hours > END_HOUR) return null;
    return (hours - START_HOUR) * HOUR_REM;
  }, [today]);

  const chosen =
    selected !== null ? days[selected.day][selected.block] : null;

  return (
    <div className="space-y-6">
      {/* Week stepper */}
      <div className="flex flex-wrap items-center gap-3">
        <StepButton
          onClick={() => setWeekIndex(weekIndex - 1)}
          label="Önceki hafta"
          disabled={weekIndex === 0}
        >
          Önceki
        </StepButton>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            Hafta {weekIndex + 1}: {week.label}
          </p>
          <p className="font-mono text-xs text-ink-faint">
            {formatShort(monday)} to {formatShort(addDays(monday, 6))}
          </p>
        </div>
        <StepButton
          onClick={() => setWeekIndex(weekIndex + 1)}
          label="Sonraki hafta"
          disabled={weekIndex === WEEKS.length - 1}
        >
          Sonraki
        </StepButton>
      </div>

      {week.note && <WeekNote>{week.note}</WeekNote>}

      {/* Fixed sessions. Collapsed by default: it never changes, and it is the
          answer to one question ("hangi oda"), not something read weekly. */}
      <GlassCard coreClassName="p-5 sm:p-6">
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-medium text-ink-dim transition-colors duration-200 ease-out-strong hover:text-ink">
            Sabit dersler ve odalar
          </summary>
          <div className="no-scrollbar mt-4 overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead>
                <tr className="text-xs font-medium text-ink-faint">
                  <th className="py-2 pr-4 font-medium">Gün</th>
                  <th className="py-2 pr-4 font-medium">Saat</th>
                  <th className="py-2 pr-4 font-medium">Ders</th>
                  <th className="py-2 pr-4 font-medium">Tür</th>
                  <th className="py-2 pr-4 font-medium">Oda</th>
                  <th className="py-2 pr-4 font-medium">Öğretim görevlisi</th>
                  <th className="py-2 font-medium">Haftalar</th>
                </tr>
              </thead>
              <tbody>
                {COURSES.map((course) => (
                  <tr
                    key={`${course.code}-${course.type}`}
                    className="align-top shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                  >
                    <td className="py-3 pr-4 text-ink-dim">{course.day}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-ink-dim">
                      {course.time}
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      <span className="font-mono text-xs text-ink-faint">
                        {course.code}
                      </span>{' '}
                      {course.name}
                    </td>
                    <td className="py-3 pr-4 text-ink-dim">
                      {course.type}
                      {course.group ? ` (${course.group})` : ''}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-ink">
                      {course.loc}
                    </td>
                    <td className="py-3 pr-4 text-ink-dim">{course.staff}</td>
                    <td className="py-3 text-ink-faint">{course.weeks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </GlassCard>

      <GlassCard coreClassName="p-5 sm:p-7">
        <FocusCards week={week} />
      </GlassCard>

      {/* ------------------------------------------------ phone: day + list */}
      <div className="md:hidden">
        <nav
          aria-label="Gün seç"
          className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4"
        >
          {DAY_SHORT.map((short, i) => {
            const date = addDays(monday, i);
            const isToday = todayKey === toISO(date);
            return (
              <button
                key={short}
                type="button"
                aria-pressed={mobileDay === i}
                onClick={() => setMobileDay(i)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-[color,background-color,transform] duration-200 ease-out-strong active:scale-[0.97] active:duration-100 motion-reduce:transform-none ${
                  mobileDay === i
                    ? 'bg-white/[0.08] text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                    : isToday
                      ? 'text-glow'
                      : 'text-ink-faint'
                }`}
              >
                {short} {date.getDate()}
              </button>
            );
          })}
        </nav>

        <GlassCard className="mt-4" coreClassName="p-5">
          <h3 className="text-sm font-medium text-ink">
            {DAY_NAMES[mobileDay]}, {formatShort(addDays(monday, mobileDay))}
          </h3>
          <ul className="mt-4 space-y-4">
            {days[mobileDay].map((block, i) => (
              <li
                key={`${block.start}-${i}`}
                style={hue(block.cat)}
                className="flex gap-3"
              >
                <span
                  aria-hidden
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-[3px] ${
                    SOFT.has(block.cat) ? 'bg-[var(--c)]/40' : 'bg-[var(--c)]'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-ink-faint">
                    {block.start} to {block.end}
                  </p>
                  <p
                    className={`mt-0.5 text-sm ${
                      SOFT.has(block.cat)
                        ? 'text-ink-faint'
                        : 'font-medium text-ink'
                    }`}
                  >
                    {block.title}
                    {block.location && (
                      <span className="ml-2 whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[10px] text-[var(--c)] shadow-[inset_0_0_0_1px_var(--c)]">
                        {block.location}
                      </span>
                    )}
                  </p>
                  {block.detail && (
                    <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                      {block.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* ------------------------------------------------- desktop: the grid */}
      <div className="hidden md:block">
        <GlassCard coreClassName="p-3">
          <div className="no-scrollbar overflow-x-auto">
            <div
              className="plan-grid"
              style={{ ['--hour' as string]: `${HOUR_REM}rem` }}
            >
              {/* Header row: gutter spacer, then seven days */}
              <div />
              {DAY_NAMES.map((name, i) => {
                const date = addDays(monday, i);
                const isToday = todayKey === toISO(date);
                return (
                  <div
                    key={name}
                    className={`px-2 pb-2 text-center text-xs ${
                      isToday ? 'text-glow' : 'text-ink-faint'
                    }`}
                  >
                    <span className="block text-sm font-medium">{name}</span>
                    <span className="font-mono">{formatShort(date)}</span>
                  </div>
                );
              })}

              {/* Hour gutter */}
              <div className="relative" style={{ height: `${BODY_REM}rem` }}>
                {Array.from({ length: END_HOUR - START_HOUR - 1 }, (_, i) => {
                  const hour = START_HOUR + 1 + i;
                  return (
                    <span
                      key={hour}
                      className="absolute right-2 -translate-y-1/2 font-mono text-[10px] text-ink-faint"
                      style={{ top: `${(hour - START_HOUR) * HOUR_REM}rem` }}
                    >
                      {String(hour).padStart(2, '0')}
                    </span>
                  );
                })}
              </div>

              {/* One column per day */}
              {days.map((blocks, day) => {
                const date = addDays(monday, day);
                const isToday = todayKey === toISO(date);
                return (
                  <div
                    key={week.start + day}
                    className="plan-col"
                    style={{ height: `${BODY_REM}rem` }}
                  >
                    {blocks.map((block, i) => {
                      const box = blockGeometry(block);
                      if (!box) return null;
                      const soft = SOFT.has(block.cat);
                      const isSelected =
                        selected?.day === day && selected?.block === i;
                      return (
                        <button
                          key={`${block.start}-${i}`}
                          type="button"
                          onClick={() => setSelected({ day, block: i })}
                          style={{
                            ...hue(block.cat),
                            top: `${box.top}rem`,
                            height: `calc(${box.height}rem - 2px)`,
                          }}
                          title={`${block.start} to ${block.end} ${block.title}`}
                          className={`absolute inset-x-1 overflow-hidden rounded-md px-2 py-1 text-left transition-[transform,filter] duration-200 ease-out-strong hover:brightness-125 active:scale-[0.985] active:duration-100 motion-reduce:transform-none ${
                            soft ? 'plan-block-soft' : 'plan-block'
                          } ${isSelected ? 'plan-now' : ''}`}
                        >
                          {box.height >= 1 && (
                            <span
                              className={`block truncate text-[11px] leading-tight ${
                                soft
                                  ? 'text-ink-faint'
                                  : 'font-medium text-ink'
                              }`}
                            >
                              {block.title}
                            </span>
                          )}
                          {box.height >= 2 && (
                            <span className="mt-0.5 block font-mono text-[10px] text-ink-faint">
                              {block.start} to {block.end}
                            </span>
                          )}
                          {block.location && box.height >= 3 && (
                            <span className="mt-0.5 block truncate font-mono text-[10px] text-[var(--c)]">
                              {block.location}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {isToday && nowOffset !== null && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 h-px bg-glow"
                        style={{ top: `${nowOffset}rem` }}
                      >
                        <span className="absolute -left-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-glow" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Detail for the selected block. Keeps its height when empty so the
            page does not jump on the first click. */}
        <GlassCard className="mt-4" coreClassName="min-h-[6rem] p-5">
          {chosen ? (
            <div style={hue(chosen.cat)}>
              <h3 className="text-base font-medium text-[var(--c)]">
                {chosen.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-ink-faint">
                {DAY_NAMES[selected!.day]}, {chosen.start} to {chosen.end},{' '}
                {CATEGORIES[chosen.cat]}
                {chosen.location ? `, ${chosen.location}` : ''}
              </p>
              {chosen.detail && (
                <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-ink-dim">
                  {chosen.detail}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">
              Ayrıntısını görmek için bir bloğa tıkla.
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
