'use client';

import { useState } from 'react';
import { Luggage } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { yen, pounds, gbp } from '@/components/tokyo/format';
import {
  budget,
  weightGroups,
  plannedWeightKg,
  weightSoFar,
  BAGGAGE_ALLOWANCE_KG,
  EXCHANGE_RATE,
} from '@/lib/tokyo-personal';
import {
  toJpy,
  totalSpent,
  spentGbp,
  remainingGbp,
  spentOn,
  remaining,
  deriveDailyCap,
  daysRemaining,
  tokyoDateKey,
  type BudgetState,
  type Currency,
} from '@/lib/tokyo-budget';
import type { BudgetActions } from '@/hooks/useTokyoBudget';

/*
 * The headline figures and the baggage weight.
 *
 * The category breakdown and the expense list used to live here too. They left
 * when the donut arrived: the chart owns the category filter and the list is
 * what it filters, so both belong together under MoneyTab. The planned figures
 * that fed the old reference column now live in tokyo-categories.ts, where the
 * chart can read the same numbers.
 */

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

function BudgetSetup({
  actions,
  rate,
}: {
  actions: BudgetActions;
  rate: number;
}) {
  const [amount, setAmount] = useState('1000');
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [cap, setCap] = useState('');

  const parsed = Number(amount);
  const valid = amount !== '' && isFinite(parsed) && parsed > 0;

  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Set the budget
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">
        The figures below this are what the plan expects things to cost. This is
        what you are actually working with. It stays in this browser and is sent
        nowhere.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          /* The currency he typed in is recorded, so that side stays fixed. */
          actions.setTotal(toJpy(parsed, currency, rate), currency, rate);
          const capValue = Number(cap);
          if (cap !== '' && isFinite(capValue) && capValue > 0) {
            actions.setDailyCap(toJpy(capValue, currency, rate));
          }
        }}
        className="mt-6 space-y-3"
      >
        <div className="flex flex-wrap items-stretch gap-2">
          <div className="flex min-w-[9rem] flex-1 items-center gap-1 rounded-xl bg-white/[0.03] px-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06)] focus-within:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.45)]">
            <span aria-hidden className="font-mono text-sm text-ink-faint">
              {currency === 'JPY' ? '¥' : '£'}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value.replace(/[^0-9.]/g, ''))
              }
              aria-label="Total trip budget"
              className="w-full bg-transparent py-2.5 font-mono text-lg text-ink outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            {(['GBP', 'JPY'] as Currency[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={currency === option}
                onClick={() => setCurrency(option)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-[color,background-color] duration-200 ease-out-strong ${
                  currency === option
                    ? 'bg-white/[0.09] text-ink'
                    : 'text-ink-faint hover:text-ink-dim'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={cap}
            onChange={(event) =>
              setCap(event.target.value.replace(/[^0-9.]/g, ''))
            }
            placeholder="Daily cap, optional"
            aria-label="Daily cap, optional"
            className="min-w-[10rem] flex-1 rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm text-ink outline-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06)] placeholder:text-ink-faint/60 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.45)]"
          />
          <button
            type="submit"
            disabled={!valid}
            className="shrink-0 rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[transform,box-shadow,opacity] duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transform-none"
          >
            Start
          </button>
        </div>

        <p className="text-xs leading-relaxed text-ink-faint">
          Leave the cap blank and it is worked out for you: what is left, spread
          over the days that are left.
        </p>
      </form>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Baggage                                                             */
/* ------------------------------------------------------------------ */

function BaggagePanel({ checkedIds }: { checkedIds: Set<string> }) {
  const carried = weightSoFar(checkedIds);
  const pct = Math.min(100, Math.round((carried / BAGGAGE_ALLOWANCE_KG) * 100));

  return (
    <div className="mt-8 border-t border-white/[0.06] pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <Luggage className="h-4 w-4 text-ink-faint" strokeWidth={1.5} aria-hidden />
          Baggage
        </p>
        <p className="font-mono text-sm text-ink-dim">
          {carried.toFixed(1)} of {BAGGAGE_ALLOWANCE_KG} kg
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Checked baggage used"
        className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff3b30] to-[#57c1ff] transition-[width] duration-500 ease-out-strong motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {weightGroups.map((group) => {
          const bought = group.itemIds.filter((id) => checkedIds.has(id)).length;
          return (
            <div key={group.id}>
              <dt className="text-xs text-ink-faint">{group.label}</dt>
              <dd className="mt-1 font-mono text-sm text-ink-dim">
                {group.kg.toFixed(1)} kg
                <span className="ml-1.5 text-ink-faint">
                  {bought}/{group.itemIds.length}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        One checked bag and one hand bag. The shopping plans to{' '}
        {plannedWeightKg.toFixed(1)} kg, split evenly across each group as its
        items are ticked, because the Student Pack weighs the groups rather than
        the items. Its estimate also counts one scale figure and two are on the
        list, so the real number lands a little higher.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tracker                                                             */
/* ------------------------------------------------------------------ */

export default function BudgetTracker({
  state,
  actions,
  checkedIds,
  rate,
}: {
  state: BudgetState;
  actions: BudgetActions;
  checkedIds: Set<string>;
  /** Today's effective rate. Only forward-looking figures may use it. */
  rate: number;
}) {
  const today = tokyoDateKey();
  const spent = totalSpent(state);
  const left = remaining(state);
  const cap = deriveDailyCap(state, today);
  const spentToday = spentOn(state, today);

  /*
   * Two pound figures, deliberately computed differently and labelled as such.
   * Spending is summed at each entry's own frozen rate and cannot move again;
   * what is left converts at today's, because it has yet to be spent.
   */
  const spentInGbp = spentGbp(state);
  const leftInGbp = remainingGbp(state, rate);

  if (state.totalJpy === null) {
    return (
      <div className="space-y-5">
        <BudgetSetup actions={actions} rate={rate} />
        <PlannedReference rate={rate} />
      </div>
    );
  }

  const pct =
    state.totalJpy > 0
      ? Math.min(100, Math.round((spent / state.totalJpy) * 100))
      : 0;
  const over = left !== null && left < 0;

  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">
            Spent
          </p>
          <p className="mt-2 font-mono text-3xl tracking-tight text-ink">
            {yen(spent)}
          </p>
          <p className="mt-1 font-mono text-sm text-ink-dim">
            {gbp(spentInGbp)}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-faint">
            at the rates on the day
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">
            {over ? 'Over budget by' : 'Left'}
          </p>
          <p
            className={`mt-2 font-mono text-2xl tracking-tight ${
              over ? 'text-red-300' : 'text-ink-dim'
            }`}
          >
            {yen(Math.abs(left ?? 0))}
          </p>
          <p className="mt-1 font-mono text-sm text-ink-faint">
            {gbp(Math.abs(leftInGbp ?? 0))}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-faint">
            at today&rsquo;s rate
          </p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget spent"
        className="mt-6 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff3b30] to-[#57c1ff] transition-[width] duration-500 ease-out-strong motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Today. The cap shrinks on its own after an expensive day. */}
      <dl className="mt-6 grid grid-cols-3 gap-x-6">
        <div>
          <dt className="text-xs text-ink-faint">Today&rsquo;s cap</dt>
          <dd className="mt-1 font-mono text-sm text-ink-dim">
            {cap === null ? '—' : yen(cap)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Spent today</dt>
          <dd className="mt-1 font-mono text-sm text-ink-dim">
            {yen(spentToday)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Left today</dt>
          <dd
            className={`mt-1 font-mono text-sm ${
              cap !== null && spentToday > cap ? 'text-red-300' : 'text-glow'
            }`}
          >
            {cap === null ? '—' : yen(cap - spentToday)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        {state.dailyCapJpy === null
          ? `Worked out from what is left across ${daysRemaining(today)} remaining trip ${daysRemaining(today) === 1 ? 'day' : 'days'}, so an expensive day quietly shrinks the rest.`
          : 'A cap you set. Clear it in the controls below to have it worked out instead.'}
      </p>

      <BaggagePanel checkedIds={checkedIds} />
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Planned figures, shown before a budget exists                       */
/* ------------------------------------------------------------------ */

function PlannedReference({ rate }: { rate: number }) {
  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        What the plan expects
      </h3>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {[
          { label: 'Shopping', value: budget.shopping },
          { label: 'Dinners', value: budget.dinners },
          { label: 'Daily and nights', value: budget.daily },
          { label: 'Tax-free back', value: -budget.taxFreeSaving },
        ].map((line) => (
          <div key={line.label}>
            <dt className="text-xs text-ink-faint">{line.label}</dt>
            <dd
              className={`mt-1 font-mono text-sm ${
                line.value < 0 ? 'text-glow' : 'text-ink-dim'
              }`}
            >
              {line.value < 0 ? '-' : ''}
              {yen(Math.abs(line.value))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-xs leading-relaxed text-ink-faint">
        {yen(budget.afterTaxFree)} ({pounds(budget.afterTaxFree, rate)}) after
        tax-free, from a {yen(budget.sticker)} sticker, at today&rsquo;s ¥
        {rate.toFixed(1)} to the pound. The plan itself was costed at ¥
        {EXCHANGE_RATE}. Tax-free takes the consumption tax out of a
        tax-inclusive price, so it returns about 9.09%, not 10%.
      </p>
    </GlassCard>
  );
}
