'use client';

import GlassCard from '@/components/GlassCard';
import {
  WEEKS,
  addDays,
  formatShort,
  parseISO,
  type FocusKey,
} from '@/data/semester-plan';

/*
 * The whole semester as one table. Seventeen rows, one per week, with the
 * current week tinted.
 *
 * It scrolls sideways rather than collapsing to cards on a phone: the value
 * here is reading one stream down the page (what does AWS look like in
 * November) and a stack of per-week cards destroys exactly that.
 */

const COLUMNS: { key: FocusKey; label: string }[] = [
  { key: 'fyp', label: 'FYP' },
  { key: 'aws', label: 'AWS SAA-C03' },
  { key: 'leetcode', label: 'LeetCode' },
  { key: 'jobs', label: 'Applications' },
  { key: 'classes', label: 'Classes' },
];

export default function RoadmapTab({ currentWeek }: { currentWeek: number | null }) {
  return (
    <GlassCard coreClassName="p-3 sm:p-4">
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[68rem] text-left align-top text-sm">
          <thead>
            <tr className="text-xs font-medium text-ink-faint">
              <th className="px-3 py-2 font-medium">Week</th>
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-3 py-2 font-medium">
                  {column.label}
                </th>
              ))}
              <th className="px-3 py-2 font-medium">Profiler and guitar</th>
            </tr>
          </thead>
          <tbody>
            {WEEKS.map((week, i) => {
              const monday = parseISO(week.start);
              const current = currentWeek === i;
              return (
                <tr
                  key={week.start}
                  className={`align-top shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ${
                    current ? 'bg-glow/[0.07]' : ''
                  }`}
                >
                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`text-sm font-medium ${current ? 'text-glow' : 'text-ink'}`}
                    >
                      {i + 1}. {week.label}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] text-ink-faint">
                      {formatShort(monday)} to {formatShort(addDays(monday, 6))}
                    </span>
                    {week.fypSession && (
                      <span className="mt-1 block text-[11px] text-ink-faint">
                        Friday FYP session
                      </span>
                    )}
                  </td>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-4 text-xs leading-relaxed text-ink-dim"
                    >
                      {week.focus[column.key] ?? ''}
                      {column.key === 'classes' && week.note && (
                        <span className="mt-2 block text-ink-faint">
                          {week.note}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-4 text-xs leading-relaxed text-ink-dim">
                    {week.focus.profiler || week.focus.guitar ? (
                      <>
                        {week.focus.profiler && (
                          <span className="block">{week.focus.profiler}</span>
                        )}
                        {week.focus.guitar && (
                          <span className="mt-1 block">{week.focus.guitar}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-ink-faint">Routine</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
