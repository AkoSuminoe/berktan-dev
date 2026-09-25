'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import WeekTab from '@/components/semester/WeekTab';
import TodayTab from '@/components/semester/TodayTab';
import RoadmapTab from '@/components/semester/RoadmapTab';
import ReviewTab from '@/components/semester/ReviewTab';
import DeadlinesTab from '@/components/semester/DeadlinesTab';
import { Legend } from '@/components/semester/shared';
import {
  WEEKS,
  isInSemester,
  parseISO,
  weekIndexFor,
} from '@/data/semester-plan';
import {
  defaultDeadlines,
  readBadDays,
  readDeadlines,
  readDone,
  readTab,
  writeBadDays,
  writeDeadlines,
  writeDone,
  writeTab,
  type BadDayMap,
  type DoneMap,
  type StoredDeadline,
} from '@/lib/semester-storage';

/*
 * Semester 1 planner, /semester.
 *
 * Everything on screen is derived from src/data/semester-plan.ts. No schedule
 * fact is written into a component, so changing the plan is one file.
 *
 * Hydration: "today" is a client-only fact. The server renders the first week
 * and an empty state, then a mount effect fills in the date, the saved ticks
 * and the saved deadlines. `ready` gates the panels so the first paint is not
 * week 1 briefly claiming to be the current week.
 */

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

type Tab = 'week' | 'today' | 'road' | 'review' | 'dead';

const TABS: { id: Tab; label: string }[] = [
  { id: 'week', label: 'Hafta' },
  { id: 'today', label: 'Bugün' },
  { id: 'road', label: 'Yol haritası' },
  { id: 'review', label: 'Tekrar ve kurallar' },
  { id: 'dead', label: 'Teslimler' },
];

const TAB_IDS = TABS.map((t) => t.id);

/** Midnight local, so every day comparison is a whole-day comparison. */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function SemesterPlanner() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('week');
  const [today, setToday] = useState<Date | null>(null);
  const [weekIndex, setWeekIndex] = useState(0);
  const [date, setDate] = useState<Date>(() => parseISO(WEEKS[0].start));
  const [done, setDone] = useState<DoneMap>({});
  const [badDays, setBadDays] = useState<BadDayMap>({});
  const [deadlines, setDeadlines] = useState<StoredDeadline[]>(defaultDeadlines);

  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});

  /* One mount effect: read the clock and everything persisted, then paint. */
  useEffect(() => {
    const now = startOfToday();
    setToday(now);
    setWeekIndex(weekIndexFor(now));
    setDate(isInSemester(now) ? now : parseISO(WEEKS[0].start));
    setDone(readDone());
    setBadDays(readBadDays());
    setDeadlines(readDeadlines());
    const saved = readTab(TAB_IDS);
    if (saved) setTab(saved as Tab);
    setReady(true);
  }, []);

  /* Writes are explicit rather than a save-on-every-render effect, so a state
     restored from storage can never be written straight back over itself. */
  const updateDone = useCallback((next: DoneMap) => {
    setDone(next);
    writeDone(next);
  }, []);

  const updateBadDays = useCallback((next: BadDayMap) => {
    setBadDays(next);
    writeBadDays(next);
  }, []);

  const updateDeadlines = useCallback((next: StoredDeadline[]) => {
    setDeadlines(next);
    writeDeadlines(next);
  }, []);

  const selectTab = useCallback((next: Tab) => {
    setTab(next);
    writeTab(next);
    tabRefs.current[next]?.scrollIntoView({
      inline: 'nearest',
      block: 'nearest',
    });
  }, []);

  const currentWeek = today ? weekIndexFor(today) : null;
  const inSemester = today ? isInSemester(today) : false;

  function renderPanel() {
    if (!ready) {
      return (
        <GlassCard coreClassName="p-6">
          <p className="text-sm text-ink-faint">Plan yükleniyor.</p>
        </GlassCard>
      );
    }
    switch (tab) {
      case 'week':
        return (
          <WeekTab
            weekIndex={weekIndex}
            setWeekIndex={setWeekIndex}
            today={today}
          />
        );
      case 'today':
        return (
          <TodayTab
            date={date}
            setDate={setDate}
            today={today}
            done={done}
            setDone={updateDone}
            badDays={badDays}
            setBadDays={updateBadDays}
          />
        );
      case 'road':
        return <RoadmapTab currentWeek={inSemester ? currentWeek : null} />;
      case 'review':
        return <ReviewTab />;
      case 'dead':
        return (
          <DeadlinesTab
            rows={deadlines}
            setRows={updateDeadlines}
            today={today}
          />
        );
    }
  }

  return (
    <section
      lang="tr"
      className="mx-auto max-w-6xl px-4 pb-40 pt-16 sm:px-6 sm:pt-24"
    >
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="text-sm font-medium text-ink-dim"
      >
        Final year, 2026/27
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease }}
        className="mt-3 text-5xl font-semibold tracking-tighter text-ink sm:text-6xl"
      >
        Dönem 1.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease }}
        className="mt-4 max-w-2xl text-base leading-relaxed text-ink-dim"
      >
        21 Eylül 2026 to 15 Ocak 2027. Uyanış 07:00, yatış 22:45. Normal haftada
        yaklaşık 48 saat çalışma, akşamların çoğu boş.
      </motion.p>

      {/* Where the semester currently is. Client-only, so it appears after
          mount rather than rendering a guess on the server. */}
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.26, ease }}
        className="mt-4 font-mono text-xs text-ink-faint"
      >
        {ready && currentWeek !== null
          ? inSemester
            ? `Hafta ${currentWeek + 1} / ${WEEKS.length} · ${WEEKS[currentWeek].label}`
            : 'Plan penceresinin dışındayız'
          : ' '}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.32, ease }}
        className="mt-8"
      >
        <Legend />
      </motion.div>

      {/* Tabs. Five labels, one of them three words long, so the row scrolls
          sideways and only the active pill carries a filled background. A
          background on all five is what makes the row too wide to fit. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.38, ease }}
        className="no-scrollbar -mx-4 mt-8 flex touch-pan-x overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:px-0"
      >
        <div
          role="tablist"
          aria-label="Dönem planı görünümleri"
          className="inline-flex shrink-0 items-center gap-1"
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              type="button"
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              aria-selected={tab === id}
              onClick={() => selectTab(id)}
              className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-[color,transform] duration-200 ease-out-strong active:scale-[0.97] active:duration-100 max-[400px]:px-[10px] max-[400px]:text-[13px] motion-reduce:transform-none ${
                tab === id ? 'text-ink' : 'text-ink-faint hover:text-ink-dim'
              }`}
            >
              {tab === id && (
                <motion.span
                  layoutId="semester-tab-pill"
                  /* A morph on screen that a second click can interrupt, so a
                     spring rather than a duration. A trace of bounce because
                     the pill is being thrown between slots. */
                  transition={{ type: 'spring', duration: 0.42, bounce: 0.14 }}
                  className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: easeOut } }}
            transition={{ duration: 0.36, ease: easeOut }}
          >
            {renderPanel()}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
