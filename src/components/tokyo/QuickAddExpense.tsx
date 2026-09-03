'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { yen } from '@/components/tokyo/format';
import { EXCHANGE_RATE } from '@/lib/tokyo-personal';
import {
  toJpy,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type Currency,
  type ExpenseCategory,
} from '@/lib/tokyo-budget';
import type { PendingExpense, BudgetActions } from '@/hooks/useTokyoBudget';

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

/*
 * Two taps and it is recorded. This gets used standing on a street corner with
 * a bag in the other hand, so it is an always-open row rather than a button
 * that opens a modal that opens a form.
 *
 * Rendered once per tab. The prefill lives in the hook, so whichever copy is
 * mounted picks up a tick from either tab.
 */
export default function QuickAddExpense({
  pending,
  actions,
  disabled,
}: {
  pending: PendingExpense | null;
  actions: BudgetActions;
  disabled?: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('JPY');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [note, setNote] = useState('');
  const [plannedItemId, setPlannedItemId] = useState<string | undefined>();

  const amountRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /*
   * Keyed on the nonce rather than the item id, so ticking the same item twice
   * still re-opens the row instead of looking broken.
   */
  useEffect(() => {
    if (!pending) return;
    setAmount(pending.jpy === null ? '' : String(pending.jpy));
    setCurrency('JPY');
    setCategory(pending.category);
    setNote(pending.note ?? '');
    setPlannedItemId(pending.plannedItemId);

    cardRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    amountRef.current?.focus();
    amountRef.current?.select();
  }, [pending?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const parsed = Number(amount);
  const valid = amount !== '' && isFinite(parsed) && parsed > 0;
  const asJpy = valid ? toJpy(parsed, currency) : 0;

  function clear() {
    setAmount('');
    setNote('');
    setPlannedItemId(undefined);
    actions.clearPending();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || disabled) return;
    actions.addExpense({ jpy: asJpy, category, note: note || undefined, plannedItemId });
    clear();
  }

  return (
    <div ref={cardRef}>
      <GlassCard coreClassName="p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Add what you actually paid
          </h3>
          <AnimatePresence>
            {plannedItemId && (
              <motion.button
                type="button"
                onClick={clear}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                transition={{ duration: 0.28, ease: easeOut }}
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-ink-dim transition-colors duration-200 hover:text-ink"
              >
                <X className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                Prefilled, discard
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={submit} className="mt-5">
          <div className="flex flex-wrap items-stretch gap-2">
            <div className="flex min-w-[9rem] flex-1 items-center gap-1 rounded-xl bg-white/[0.03] px-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06)] focus-within:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.45)]">
              <span aria-hidden className="font-mono text-sm text-ink-faint">
                {currency === 'JPY' ? '¥' : '£'}
              </span>
              <input
                ref={amountRef}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value.replace(/[^0-9.]/g, ''))
                }
                placeholder="0"
                aria-label={`Amount in ${currency}`}
                disabled={disabled}
                className="w-full bg-transparent py-2.5 font-mono text-lg text-ink outline-none placeholder:text-ink-faint/50 disabled:opacity-50"
              />
            </div>

            {/* Stored as yen either way; this only changes what you type in. */}
            <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              {(['JPY', 'GBP'] as Currency[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={currency === option}
                  onClick={() => setCurrency(option)}
                  disabled={disabled}
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-[color,background-color] duration-200 ease-out-strong disabled:opacity-50 ${
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

          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXPENSE_CATEGORIES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={category === option}
                onClick={() => setCategory(option)}
                disabled={disabled}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-[color,background-color,transform] duration-200 ease-out-strong active:scale-[0.97] active:duration-100 disabled:opacity-50 motion-reduce:transform-none ${
                  category === option
                    ? 'bg-glow/[0.16] text-glow shadow-[inset_0_0_0_1px_rgba(130,143,255,0.4)]'
                    : 'bg-white/[0.03] text-ink-faint hover:text-ink-dim'
                }`}
              >
                {EXPENSE_CATEGORY_LABELS[option]}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 200))}
              placeholder="Note, optional"
              aria-label="Note"
              disabled={disabled}
              className="min-w-[10rem] flex-1 rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm text-ink outline-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06)] placeholder:text-ink-faint/60 focus:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.45)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!valid || disabled}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white/[0.06] py-2.5 pl-4 pr-3 text-sm font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[transform,box-shadow,opacity] duration-[280ms] ease-out-strong hover:scale-[1.025] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),inset_0_0_0_1px_rgba(255,255,255,0.12)] active:scale-[0.975] active:duration-[120ms] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transform-none"
            >
              Add
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] transition-transform duration-[280ms] ease-out-strong group-hover:scale-105">
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            </button>
          </div>

          {/* The other currency, so a pound figure is never a surprise. */}
          <p className="mt-3 h-4 font-mono text-xs text-ink-faint">
            {valid
              ? currency === 'GBP'
                ? `Recorded as ${yen(asJpy)}`
                : `About £${(asJpy / EXCHANGE_RATE).toFixed(2)}`
              : ''}
          </p>
        </form>
      </GlassCard>
    </div>
  );
}
