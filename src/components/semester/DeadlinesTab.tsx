'use client';

import { useCallback, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { SOFT, hue } from '@/components/semester/shared';
import {
  CATEGORIES,
  daysUntil,
  type CategoryId,
} from '@/data/semester-plan';
import type { StoredDeadline } from '@/lib/semester-storage';

/*
 * Teslimler: the only list on this page the user writes into.
 *
 * Undated rows sort to the top on purpose. A coursework with no date is not a
 * far-away task, it is a missing piece of information, and burying it under
 * everything with a date is how it stays missing.
 */

const SELECTABLE = (Object.keys(CATEGORIES) as CategoryId[]).filter(
  (cat) => !SOFT.has(cat)
);

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function countdown(iso: string | null, today: Date | null): string {
  if (!iso) return 'Tarih yok';
  if (!today) return '';
  const n = daysUntil(iso, today);
  if (n === 0) return 'Bugün';
  if (n < 0) return `${-n} gün önce`;
  return `${n} gün`;
}

export default function DeadlinesTab({
  rows,
  setRows,
  today,
}: {
  rows: StoredDeadline[];
  setRows: (next: StoredDeadline[]) => void;
  today: Date | null;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [cat, setCat] = useState<CategoryId>('tekrar');

  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          (a.date ? 1 : 0) - (b.date ? 1 : 0) ||
          (a.date ?? '').localeCompare(b.date ?? '')
      ),
    [rows]
  );

  const add = useCallback(() => {
    const clean = title.trim();
    if (clean === '') return;
    setRows([
      ...rows,
      {
        id: `own-${Date.now()}`,
        title: clean.slice(0, 160),
        date: ISO_DAY.test(date) ? date : null,
        cat,
      },
    ]);
    setTitle('');
    setDate('');
  }, [cat, date, rows, setRows, title]);

  const setDateFor = useCallback(
    (id: string, value: string) => {
      setRows(
        rows.map((row) =>
          row.id === id
            ? { ...row, date: ISO_DAY.test(value) ? value : null }
            : row
        )
      );
    },
    [rows, setRows]
  );

  const remove = useCallback(
    (id: string) => setRows(rows.filter((row) => row.id !== id)),
    [rows, setRows]
  );

  return (
    <div className="space-y-6">
      <GlassCard coreClassName="p-5 sm:p-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            add();
          }}
          className="flex flex-wrap gap-3"
        >
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            placeholder="Ör. Formal Methods coursework 1"
            aria-label="Teslim başlığı"
            className="min-w-[14rem] flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-base text-ink placeholder:text-ink-faint focus:border-glow/50 focus:outline-none sm:text-sm"
          />
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label="Teslim tarihi"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-base text-ink focus:border-glow/50 focus:outline-none sm:text-sm"
          />
          <select
            value={cat}
            onChange={(event) => setCat(event.target.value as CategoryId)}
            aria-label="Kategori"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-base text-ink focus:border-glow/50 focus:outline-none sm:text-sm"
          >
            {SELECTABLE.map((option) => (
              <option key={option} value={option} className="bg-surface">
                {CATEGORIES[option]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms] motion-reduce:transform-none"
          >
            Teslim ekle
          </button>
        </form>
      </GlassCard>

      <GlassCard coreClassName="p-5 sm:p-6">
        {sorted.length === 0 ? (
          <p className="text-sm text-ink-faint">
            Henüz teslim yok. Yukarıdan ekle.
          </p>
        ) : (
          <ul>
            {sorted.map((row) => {
              const past =
                row.date && today ? daysUntil(row.date, today) < 0 : false;
              return (
                <li
                  key={row.id}
                  style={hue(row.cat)}
                  className={`flex flex-wrap items-center gap-3 py-3 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.04)] last:shadow-none ${
                    past ? 'opacity-50' : ''
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-[var(--c)]"
                  />
                  <span className="min-w-[10rem] flex-1 text-sm text-ink">
                    {row.title}
                  </span>
                  <input
                    type="date"
                    value={row.date ?? ''}
                    onChange={(event) => setDateFor(row.id, event.target.value)}
                    aria-label={`${row.title} tarihi`}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-base text-ink-dim focus:border-glow/50 focus:outline-none sm:text-xs"
                  />
                  <span
                    className={`w-[6rem] text-right font-mono text-xs ${
                      row.date ? 'text-ink-dim' : 'text-[var(--c)]'
                    }`}
                  >
                    {countdown(row.date, today)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(row.id)}
                    aria-label={`${row.title} sil`}
                    className="rounded-full p-2 text-ink-faint transition-[color,transform] duration-200 ease-out-strong hover:text-ink active:scale-[0.94] active:duration-100 motion-reduce:transform-none"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-5 text-xs leading-relaxed text-ink-faint">
          Tarihi olmayanlar en üstte durur. Blackboard ve CMISGo&apos;daki
          coursework, sınav ve FYP tarihlerini buraya gir. Bu liste yalnızca bu
          tarayıcıda saklanır, hiçbir yere gönderilmez.
        </p>
      </GlassCard>
    </div>
  );
}
