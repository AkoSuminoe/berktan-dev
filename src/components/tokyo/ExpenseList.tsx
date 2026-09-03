'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Undo2, Upload, Trash2, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { yen, gbp } from '@/components/tokyo/format';
import { CATEGORY_META } from '@/lib/tokyo-categories';
import {
  expenseGbp,
  serialise,
  deserialise,
  tokyoDateKey,
  type BudgetState,
  type Expense,
  type ExpenseCategory,
} from '@/lib/tokyo-budget';
import type { BudgetActions } from '@/hooks/useTokyoBudget';

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

/*
 * The record itself, plus the things that act on all of it.
 *
 * Lifted out of BudgetTracker when the donut arrived: the list is what a
 * category filter filters, and the filter lives with the chart, so the list had
 * to be somewhere both could reach.
 */
export default function ExpenseList({
  state,
  expenses,
  actions,
  canUndo,
  persisted,
  activeCategory,
  onClearFilter,
}: {
  /** The whole record, for export and reset. */
  state: BudgetState;
  /** What the period and category filters left. May be a subset. */
  expenses: Expense[];
  actions: BudgetActions;
  canUndo: boolean;
  persisted: boolean;
  activeCategory: ExpenseCategory | null;
  onClearFilter: () => void;
}) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(
    () => expenses.slice().sort((a, b) => b.createdAt - a.createdAt),
    [expenses]
  );

  function handleExport() {
    /* Always the whole record, never the filtered view. An export that
       silently dropped whatever was filtered out would be a backup with a
       hole in it. */
    const blob = new Blob([serialise(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tokyo-budget-${tokyoDateKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file: File) {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = deserialise(String(reader.result));
      if (!parsed) {
        setImportError(
          'That file is not a budget export from this page, or it is damaged. Nothing was changed.'
        );
        return;
      }
      actions.replaceState(parsed);
    };
    reader.onerror = () => setImportError('That file could not be read.');
    reader.readAsText(file);
  }

  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Expenses
        </h3>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {activeCategory && (
              <motion.button
                key="filter"
                type="button"
                onClick={onClearFilter}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                transition={{ duration: 0.28, ease: easeOut }}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{
                  background: `${CATEGORY_META[activeCategory].colour}22`,
                  color: CATEGORY_META[activeCategory].colour,
                  boxShadow: `inset 0 0 0 1px ${CATEGORY_META[activeCategory].colour}55`,
                }}
              >
                {CATEGORY_META[activeCategory].label} only
                <X className="h-3 w-3" strokeWidth={2} aria-hidden />
              </motion.button>
            )}
            {canUndo && (
              <motion.button
                key="undo"
                type="button"
                onClick={actions.undoRemove}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                transition={{ duration: 0.28, ease: easeOut }}
                className="inline-flex items-center gap-1.5 rounded-full bg-glow/[0.12] px-3 py-1 text-[11px] font-medium text-glow shadow-[inset_0_0_0_1px_rgba(130,143,255,0.3)] transition-transform duration-200 ease-out-strong active:scale-[0.97] motion-reduce:transform-none"
              >
                <Undo2 className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                Undo delete
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          {activeCategory
            ? 'Nothing in this category for the period on screen.'
            : state.expenses.length > 0
              ? 'Nothing recorded in the period on screen.'
              : 'Nothing recorded yet. Tick a planned item on the Personal or Nights tab and the amount opens filled in, ready to correct.'}
        </p>
      ) : (
        <ul className="mt-4 space-y-1">
          <AnimatePresence initial={false}>
            {sorted.map((expense) => (
              <motion.li
                key={expense.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.16, ease: easeOut },
                }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="group/row flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: CATEGORY_META[expense.category].colour }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">
                    {expense.note || CATEGORY_META[expense.category].label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-faint">
                    {CATEGORY_META[expense.category].label} · {expense.date}
                  </span>
                </span>
                <span className="shrink-0 text-right font-mono">
                  <span className="block text-sm text-ink-dim">
                    {yen(expense.jpy)}
                  </span>
                  {/* At the rate on the day, which is why this figure never
                      moves again. */}
                  <span className="mt-0.5 block text-[11px] text-ink-faint">
                    {gbp(expenseGbp(expense))}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => actions.removeExpense(expense.id)}
                  aria-label={`Delete ${yen(expense.jpy)} expense`}
                  className="shrink-0 rounded-lg p-1.5 text-ink-faint opacity-0 transition-[opacity,color] duration-200 hover:text-red-300 focus-visible:opacity-100 group-hover/row:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-5">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[color,transform] duration-200 ease-out-strong hover:text-ink active:scale-[0.97] motion-reduce:transform-none"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          Export
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[color,transform] duration-200 ease-out-strong hover:text-ink active:scale-[0.97] motion-reduce:transform-none"
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleImport(file);
            event.target.value = '';
          }}
        />

        {state.dailyCapJpy !== null && (
          <button
            type="button"
            onClick={() => actions.setDailyCap(null)}
            className="rounded-full bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-colors duration-200 hover:text-ink"
          >
            Clear daily cap
          </button>
        )}

        {/* Two presses, because this deletes a record of real money. */}
        <button
          type="button"
          onClick={() => {
            if (confirmingReset) {
              actions.reset();
              setConfirmingReset(false);
            } else {
              setConfirmingReset(true);
            }
          }}
          onBlur={() => setConfirmingReset(false)}
          className={`ml-auto rounded-full px-3.5 py-2 text-xs font-medium transition-[color,background-color] duration-200 ${
            confirmingReset
              ? 'bg-red-400/[0.14] text-red-300 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.4)]'
              : 'bg-white/[0.04] text-ink-faint shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:text-ink-dim'
          }`}
        >
          {confirmingReset ? 'Press again to erase everything' : 'Reset'}
        </button>
      </div>

      {importError && (
        <p className="mt-3 text-xs leading-relaxed text-red-300">
          {importError}
        </p>
      )}

      {!persisted && (
        <p className="mt-3 text-xs leading-relaxed text-red-300">
          This browser is not letting the page save. Private mode and a full
          storage quota both do that. The figures on screen are correct for now
          but will not survive a reload, so export before you close the tab.
        </p>
      )}

      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        Stored in this browser only. It is never sent anywhere, and there is no
        account behind it, so the export is the only backup.
      </p>
    </GlassCard>
  );
}
