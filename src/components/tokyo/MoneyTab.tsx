'use client';

import { useMemo, useState } from 'react';
import GlassCard from '@/components/GlassCard';
import BudgetTracker from '@/components/tokyo/BudgetTracker';
import QuickAddExpense from '@/components/tokyo/QuickAddExpense';
import CardSettings from '@/components/tokyo/CardSettings';
import SpendDonut from '@/components/tokyo/SpendDonut';
import CategoryBars from '@/components/tokyo/CategoryBars';
import ExpenseList from '@/components/tokyo/ExpenseList';
import SectionNav from '@/components/tokyo/SectionNav';
import { yen } from '@/components/tokyo/format';
import {
  expensesForPeriod,
  totalsByCategoryFor,
  gbpByCategoryFor,
  totalsByCategory,
  allowanceForPeriod,
  deriveDailyCap,
  daysRemaining,
  daysElapsed,
  tokyoDateKey,
  TRIP_DATES,
  PERIOD_LABELS,
  type Period,
  type ExpenseCategory,
} from '@/lib/tokyo-budget';
import type { BudgetBinding, SettingsBinding } from '@/components/tokyo/types';
import type { FxQuote } from '@/lib/tokyo-fx';

const PERIODS: Period[] = ['today', 'sofar', 'trip'];

const SECTIONS = [
  { id: 'money-totals', label: 'Totals' },
  { id: 'money-breakdown', label: 'Breakdown' },
  { id: 'money-expenses', label: 'Expenses' },
  { id: 'money-card', label: 'Card' },
];

/*
 * Everything about money, in one place.
 *
 * It used to sit on top of the Personal tab and again on top of Nights, which
 * made both of them open on a wall of figures before reaching what they were
 * for. The entry row still lives on those tabs, because ticking a planned item
 * prefills it and a prefill that opens on a tab you are not looking at is
 * broken. What moved here is the reading, not the recording.
 */
export default function MoneyTab({
  budgetBinding,
  settingsBinding,
  checkedIds,
  rate,
  quote,
}: {
  budgetBinding: BudgetBinding;
  settingsBinding: SettingsBinding;
  /** Baggage weight is derived from what has been ticked, not from spending. */
  checkedIds: Set<string>;
  rate: number;
  quote: FxQuote;
}) {
  const { ready, persisted, state, pending, actions, canUndo } = budgetBinding;

  const [period, setPeriod] = useState<Period>('trip');
  const [category, setCategory] = useState<ExpenseCategory | null>(null);

  const today = tokyoDateKey();

  const inPeriod = useMemo(
    () => expensesForPeriod(state, period, today),
    [state, period, today]
  );

  const totalsJpy = useMemo(() => totalsByCategoryFor(inPeriod), [inPeriod]);
  const totalsGbp = useMemo(() => gbpByCategoryFor(inPeriod), [inPeriod]);
  /* The bars are whole-trip whatever the period. See CategoryBars. */
  const tripTotals = useMemo(() => totalsByCategory(state), [state]);

  const listed = useMemo(
    () =>
      category === null
        ? inPeriod
        : inPeriod.filter((expense) => expense.category === category),
    [inPeriod, category]
  );

  /* Holds the layout on the first paint, before localStorage has been read. */
  if (!ready) {
    return (
      <div className="space-y-5">
        <GlassCard coreClassName="p-6 sm:p-7">
          <div className="h-[7.5rem] animate-pulse rounded-xl bg-white/[0.03] motion-reduce:animate-none" />
        </GlassCard>
        <GlassCard coreClassName="p-6 sm:p-7">
          <div className="h-[11rem] animate-pulse rounded-xl bg-white/[0.03] motion-reduce:animate-none" />
        </GlassCard>
      </div>
    );
  }

  const periodTotal = inPeriod.reduce((sum, expense) => sum + expense.jpy, 0);
  const allowance = allowanceForPeriod(state, period, today);
  const cap = deriveDailyCap(state, today);
  const elapsed = daysElapsed(today);
  const left = allowance === null ? null : allowance - periodTotal;

  const centreLabel =
    left === null
      ? null
      : left < 0
        ? `${yen(-left)} over`
        : `${yen(left)} left`;

  /* Said in words under the switcher, because "so far" and "whole trip" show
     the same spending and differ only in what it is being measured against. */
  const yardstick =
    state.totalJpy === null
      ? 'Set a budget above and this becomes a comparison.'
      : period === 'today'
        ? state.dailyCapJpy === null
          ? `Against ${yen(cap ?? 0)}, which is what is left spread over the ${daysRemaining(today)} trip ${daysRemaining(today) === 1 ? 'day' : 'days'} that remain.`
          : `Against the ${yen(cap ?? 0)} daily cap you set.`
        : period === 'sofar'
          ? elapsed === 0
            ? 'The trip has not started, so this is measured against the whole budget.'
            : `Everything up to and including today, against an even split of the budget across the ${elapsed} ${elapsed === 1 ? 'day' : 'days'} gone. Eight days have no calendar weeks in them, so this is "so far" rather than "this week".`
          : `All ${TRIP_DATES.length} days, against the whole budget.`;

  return (
    <div className="space-y-5">
      <SectionNav sections={SECTIONS} />

      <div id="money-totals" className="scroll-mt-24">
        <BudgetTracker
          state={state}
          actions={actions}
          checkedIds={checkedIds}
          rate={rate}
        />
      </div>

      {/* Breakdown */}
      <div id="money-breakdown" className="scroll-mt-24 space-y-5">
        <GlassCard coreClassName="p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
              Where it went
            </h3>

            <div
              role="group"
              aria-label="Period"
              className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
            >
              {PERIODS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={period === option}
                  onClick={() => setPeriod(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-[color,background-color,transform] duration-200 ease-out-strong active:scale-[0.97] active:duration-100 motion-reduce:transform-none ${
                    period === option
                      ? 'bg-white/[0.09] text-ink'
                      : 'text-ink-faint hover:text-ink-dim'
                  }`}
                >
                  {PERIOD_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <SpendDonut
              totalsJpy={totalsJpy}
              totalsGbp={totalsGbp}
              remainingLabel={centreLabel}
              activeCategory={category}
              onFilter={setCategory}
              onAdd={(next) =>
                actions.prefill({ jpy: null, category: next })
              }
            />
          </div>

          <div className="mt-7 border-t border-white/[0.06] pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-sm text-ink-dim">
                {PERIOD_LABELS[period]}
                <span className="ml-2 font-mono text-ink">
                  {yen(periodTotal)}
                </span>
                {allowance !== null && (
                  <span className="ml-1.5 font-mono text-xs text-ink-faint">
                    of {yen(allowance)}
                  </span>
                )}
              </p>
              {allowance !== null && (
                <p
                  className={`font-mono text-xs ${
                    left !== null && left < 0 ? 'text-red-300' : 'text-glow'
                  }`}
                >
                  {centreLabel}
                </p>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-faint">
              {yardstick}
            </p>
          </div>
        </GlassCard>

        <GlassCard coreClassName="p-6 sm:p-7">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Actual against planned
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">
            Whole trip, whichever period is selected above. The plan has no
            per-day shape, so spreading it across eight days would call an
            afternoon in a pedal shop an overspend and every other day an
            underspend.
          </p>
          <div className="mt-6">
            <CategoryBars totalsJpy={tripTotals} />
          </div>
        </GlassCard>
      </div>

      {/* The record */}
      <div id="money-expenses" className="scroll-mt-24">
        <ExpenseList
          state={state}
          expenses={listed}
          actions={actions}
          canUndo={canUndo}
          persisted={persisted}
          activeCategory={category}
          onClearFilter={() => setCategory(null)}
        />
      </div>

      <QuickAddExpense
        pending={pending}
        actions={actions}
        disabled={state.totalJpy === null}
        rate={rate}
        atmFeeJpy={settingsBinding.settings.atmFeeJpy}
      />

      <div id="money-card" className="scroll-mt-24">
        <CardSettings
          settings={settingsBinding.settings}
          update={settingsBinding.update}
          quote={quote}
        />
      </div>
    </div>
  );
}
