'use client';

import BudgetTracker from '@/components/tokyo/BudgetTracker';
import QuickAddExpense from '@/components/tokyo/QuickAddExpense';
import CardSettings from '@/components/tokyo/CardSettings';
import GlassCard from '@/components/GlassCard';
import type { BudgetBinding, SettingsBinding } from '@/components/tokyo/types';
import type { FxQuote } from '@/lib/tokyo-fx';

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

  return (
    <div className="space-y-5">
      <BudgetTracker
        state={state}
        actions={actions}
        persisted={persisted}
        canUndo={canUndo}
        checkedIds={checkedIds}
        rate={rate}
      />

      <QuickAddExpense
        pending={pending}
        actions={actions}
        disabled={state.totalJpy === null}
        rate={rate}
        atmFeeJpy={settingsBinding.settings.atmFeeJpy}
      />

      <CardSettings
        settings={settingsBinding.settings}
        update={settingsBinding.update}
        quote={quote}
      />
    </div>
  );
}
