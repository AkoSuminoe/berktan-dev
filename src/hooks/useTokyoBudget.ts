'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  emptyBudget,
  readBudget,
  writeBudget,
  newId,
  localDateKey,
  type BudgetState,
  type Expense,
  type ExpenseCategory,
} from '@/lib/tokyo-budget';

/** What the quick-add row should open with when a tick prefills it. */
export type PendingExpense = {
  jpy: number | null;
  category: ExpenseCategory;
  note?: string;
  plannedItemId?: string;
  /** Changes on every prefill, so the same item twice still re-opens the row. */
  nonce: number;
};

export type BudgetActions = {
  setTotal: (jpy: number | null) => void;
  setDailyCap: (jpy: number | null) => void;
  addExpense: (expense: {
    jpy: number;
    category: ExpenseCategory;
    note?: string;
    plannedItemId?: string;
    date?: string;
  }) => void;
  updateExpense: (id: string, patch: Partial<Omit<Expense, 'id'>>) => void;
  removeExpense: (id: string) => void;
  removeExpenseForPlannedItem: (plannedItemId: string) => void;
  undoRemove: () => void;
  replaceState: (state: BudgetState) => void;
  reset: () => void;
  prefill: (pending: Omit<PendingExpense, 'nonce'>) => void;
  clearPending: () => void;
};

let nonce = 0;

export function useTokyoBudget() {
  /*
   * `ready` gates every budget-shaped thing on the page. localStorage cannot be
   * read during SSR, so the first client render has to match the server's
   * empty one; a skeleton holds the space until the effect below has run.
   */
  const [ready, setReady] = useState(false);
  const [persisted, setPersisted] = useState(true);
  const [state, setState] = useState<BudgetState>(emptyBudget);
  const [pending, setPending] = useState<PendingExpense | null>(null);

  /*
   * Last deletion, for undo. State rather than a ref: the undo button appears
   * and disappears with it, and a ref would not re-render to show it.
   */
  const [lastRemoved, setLastRemoved] = useState<Expense | null>(null);

  useEffect(() => {
    const result = readBudget();
    setState(result.state);
    setPersisted(result.persisted);
    setReady(true);
  }, []);

  /*
   * Every mutation writes through `writeBudget` and records whether it stuck.
   * When it does not, `persisted` flips and the UI says so: the number on
   * screen is still right for this session, it just will not survive a reload.
   */
  const actions = useMemo<BudgetActions>(
    () => ({
      setTotal: (jpy) =>
        setState((prev) => {
          const next = { ...prev, totalJpy: jpy };
          setPersisted(writeBudget(next));
          return next;
        }),

      setDailyCap: (jpy) =>
        setState((prev) => {
          const next = { ...prev, dailyCapJpy: jpy };
          setPersisted(writeBudget(next));
          return next;
        }),

      addExpense: (expense) =>
        setState((prev) => {
          const next: BudgetState = {
            ...prev,
            expenses: prev.expenses.concat({
              id: newId(),
              jpy: Math.round(expense.jpy),
              category: expense.category,
              note: expense.note,
              plannedItemId: expense.plannedItemId,
              date: expense.date ?? localDateKey(),
              createdAt: Date.now(),
            }),
          };
          setPersisted(writeBudget(next));
          return next;
        }),

      updateExpense: (id, patch) =>
        setState((prev) => {
          const next: BudgetState = {
            ...prev,
            expenses: prev.expenses.map((expense) =>
              expense.id === id ? { ...expense, ...patch } : expense
            ),
          };
          setPersisted(writeBudget(next));
          return next;
        }),

      removeExpense: (id) =>
        setState((prev) => {
          const found = prev.expenses.find((expense) => expense.id === id);
          if (found) setLastRemoved(found);
          const next: BudgetState = {
            ...prev,
            expenses: prev.expenses.filter((expense) => expense.id !== id),
          };
          setPersisted(writeBudget(next));
          return next;
        }),

      /*
       * Un-ticking a planned item removes the expense its tick created. Kept
       * for undo, because money should never vanish from a mis-tap.
       */
      removeExpenseForPlannedItem: (plannedItemId) =>
        setState((prev) => {
          const found = prev.expenses.find(
            (expense) => expense.plannedItemId === plannedItemId
          );
          if (!found) return prev;
          setLastRemoved(found);
          const next: BudgetState = {
            ...prev,
            expenses: prev.expenses.filter((expense) => expense.id !== found.id),
          };
          setPersisted(writeBudget(next));
          return next;
        }),

      undoRemove: () =>
        setLastRemoved((restore) => {
          if (!restore) return null;
          setState((prev) => {
            const next: BudgetState = {
              ...prev,
              expenses: prev.expenses.concat(restore),
            };
            setPersisted(writeBudget(next));
            return next;
          });
          return null;
        }),

      replaceState: (incoming) => {
        setLastRemoved(null);
        setState(incoming);
        setPersisted(writeBudget(incoming));
      },

      reset: () => {
        setLastRemoved(null);
        const next = emptyBudget();
        setState(next);
        setPersisted(writeBudget(next));
      },

      prefill: (next) => {
        nonce += 1;
        setPending({ ...next, nonce });
      },

      clearPending: () => setPending(null),
    }),
    []
  );

  return {
    ready,
    persisted,
    state,
    pending,
    actions,
    canUndo: lastRemoved !== null,
  };
}
