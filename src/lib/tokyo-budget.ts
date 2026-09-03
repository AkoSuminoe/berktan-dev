/*
 * The spending record for the Tokyo trip.
 *
 * The planned figures in `tokyo-personal.ts` are suggestions: a prefill and a
 * reference column. What was actually paid lives here, because the sticker
 * price is routinely not the price. The Cry Baby alone ranges 14,801 to 19,800.
 *
 * PRIVACY. berktan.dev is a public site and this is a record of what somebody
 * spends. It goes to localStorage and nowhere else: no server, no API route,
 * no cookie, and no analytics event carrying an amount. Anything that would
 * send an amount off the device is a bug, not a feature.
 *
 * Pure logic, no React, so the rules can be read without a component around
 * them.
 */

import { EXCHANGE_RATE } from '@/lib/tokyo-personal';

/**
 * Deliberately not `tokyo-checklist-v1`. Different lifecycle and different
 * reset: clearing a checklist should never clear a spending record.
 */
export const BUDGET_STORAGE_KEY = 'tokyo-budget-v1';

/** Bumped only for a shape change that needs a migration. */
export const BUDGET_SCHEMA_VERSION = 1;

/** A guard against a hand-edited or corrupt file, not a real limit. */
const MAX_EXPENSES = 2000;
const MAX_JPY = 10_000_000;
const MAX_NOTE_LENGTH = 200;

export type ExpenseCategory =
  | 'pedals'
  | 'collection'
  | 'gifts'
  | 'food'
  | 'nightlife'
  | 'transport'
  | 'other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'pedals',
  'collection',
  'gifts',
  'food',
  'nightlife',
  'transport',
  'other',
];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  pedals: 'Pedals',
  collection: 'Collection',
  gifts: 'Gifts',
  food: 'Food',
  nightlife: 'Nightlife',
  transport: 'Transport',
  other: 'Other',
};

export type Expense = {
  id: string;
  /**
   * Always yen. The pound figure is a view, computed on the way out; storing
   * both invites the two to disagree after a rate change.
   */
  jpy: number;
  category: ExpenseCategory;
  note?: string;
  /** The planned item whose tick prefilled this, when one did. */
  plannedItemId?: string;
  /** 'YYYY-MM-DD', local time, so a day boundary matches the traveller's. */
  date: string;
  createdAt: number;
};

export type BudgetState = {
  version: number;
  /** Null until the trip budget has been entered. */
  totalJpy: number | null;
  /** Null means derive it from what is left and how many days remain. */
  dailyCapJpy: number | null;
  expenses: Expense[];
};

export function emptyBudget(): BudgetState {
  return {
    version: BUDGET_SCHEMA_VERSION,
    totalJpy: null,
    dailyCapJpy: null,
    expenses: [],
  };
}

/* ------------------------------------------------------------------ */
/* Currency                                                            */
/* ------------------------------------------------------------------ */

export type Currency = 'JPY' | 'GBP';

export function toJpy(amount: number, currency: Currency): number {
  return currency === 'JPY' ? Math.round(amount) : Math.round(amount * EXCHANGE_RATE);
}

export function fromJpy(jpy: number, currency: Currency): number {
  return currency === 'JPY' ? jpy : jpy / EXCHANGE_RATE;
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

/** Local calendar date, not UTC: `toISOString` would roll over at 9am JST. */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** The trip, as calendar dates, matching the WWC itinerary. */
export const TRIP_DATES = [
  '2026-09-05',
  '2026-09-06',
  '2026-09-07',
  '2026-09-08',
  '2026-09-09',
  '2026-09-10',
  '2026-09-11',
  '2026-09-12',
];

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Finite, non-negative, and inside the guard rail. Anything else is null. */
function cleanAmount(value: unknown): number | null {
  if (typeof value !== 'number' || !isFinite(value) || value < 0) return null;
  return Math.min(Math.round(value), MAX_JPY);
}

function cleanCategory(value: unknown): ExpenseCategory {
  return EXPENSE_CATEGORIES.indexOf(value as ExpenseCategory) !== -1
    ? (value as ExpenseCategory)
    : 'other';
}

function cleanDate(value: unknown): string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : localDateKey();
}

function cleanExpense(value: unknown): Expense | null {
  if (!isRecord(value)) return null;
  const jpy = cleanAmount(value.jpy);
  if (jpy === null) return null;
  const id = typeof value.id === 'string' && value.id ? value.id : newId();

  return {
    id,
    jpy,
    category: cleanCategory(value.category),
    note:
      typeof value.note === 'string' && value.note
        ? value.note.slice(0, MAX_NOTE_LENGTH)
        : undefined,
    plannedItemId:
      typeof value.plannedItemId === 'string' && value.plannedItemId
        ? value.plannedItemId.slice(0, 100)
        : undefined,
    date: cleanDate(value.date),
    createdAt:
      typeof value.createdAt === 'number' && isFinite(value.createdAt)
        ? value.createdAt
        : Date.now(),
  };
}

/**
 * The trust boundary.
 *
 * This runs on whatever came out of localStorage, and on whatever JSON file the
 * user picked for an import. Every field is coerced, every number clamped,
 * every unknown key dropped, and the array is capped. Nothing here evaluates
 * anything: it is a rebuild of the object, field by field, not a cast.
 */
export function parseBudget(value: unknown): BudgetState | null {
  if (!isRecord(value)) return null;
  if (value.version !== BUDGET_SCHEMA_VERSION) return null;

  const rawExpenses = Array.isArray(value.expenses) ? value.expenses : [];
  const expenses: Expense[] = [];
  for (const raw of rawExpenses.slice(0, MAX_EXPENSES)) {
    const expense = cleanExpense(raw);
    if (expense) expenses.push(expense);
  }

  return {
    version: BUDGET_SCHEMA_VERSION,
    totalJpy: cleanAmount(value.totalJpy),
    dailyCapJpy: cleanAmount(value.dailyCapJpy),
    expenses,
  };
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

/**
 * Read, or null when storage is unavailable or holds nothing usable.
 *
 * Private browsing throws on access, not on write, so even the read is guarded.
 * A null here means "show the planned figures read-only", never "the budget is
 * empty".
 */
export function readBudget(): { state: BudgetState; persisted: boolean } {
  try {
    const raw = window.localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!raw) return { state: emptyBudget(), persisted: true };
    const parsed = parseBudget(JSON.parse(raw) as unknown);
    return { state: parsed ?? emptyBudget(), persisted: true };
  } catch {
    return { state: emptyBudget(), persisted: false };
  }
}

/** The only function that writes the key. Returns whether it stuck. */
export function writeBudget(state: BudgetState): boolean {
  try {
    window.localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    // A full quota throws here even when the read succeeded.
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Ids                                                                 */
/* ------------------------------------------------------------------ */

let counter = 0;

/**
 * `crypto.randomUUID` needs a secure context, which a phone on a hotel wifi
 * captive portal may not be. The fallback only has to be unique within one
 * browser's list, so time plus a counter plus noise is enough.
 */
export function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  counter += 1;
  return `e${Date.now().toString(36)}-${counter}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/* Derived figures                                                     */
/* ------------------------------------------------------------------ */

const sum = (values: number[]) => values.reduce((total, n) => total + n, 0);

export function totalSpent(state: BudgetState): number {
  return sum(state.expenses.map((expense) => expense.jpy));
}

export function spentOn(state: BudgetState, date: string): number {
  return sum(
    state.expenses
      .filter((expense) => expense.date === date)
      .map((expense) => expense.jpy)
  );
}

export function remaining(state: BudgetState): number | null {
  if (state.totalJpy === null) return null;
  return state.totalJpy - totalSpent(state);
}

export function totalsByCategory(state: BudgetState): Record<ExpenseCategory, number> {
  const totals = {} as Record<ExpenseCategory, number>;
  for (const category of EXPENSE_CATEGORIES) totals[category] = 0;
  for (const expense of state.expenses) totals[expense.category] += expense.jpy;
  return totals;
}

/** Trip days from `today` onward, minimum one, so the cap never divides by zero. */
export function daysRemaining(today: string): number {
  const left = TRIP_DATES.filter((date) => date >= today).length;
  return Math.max(left, 1);
}

/**
 * What is spendable today.
 *
 * An explicit cap wins. Otherwise it is what is left spread over the days that
 * are left, which is the behaviour that matters: overspend on Sunday and every
 * later day quietly gets smaller, rather than the plan pretending nothing
 * happened.
 */
export function deriveDailyCap(state: BudgetState, today: string): number | null {
  if (state.dailyCapJpy !== null) return state.dailyCapJpy;
  const left = remaining(state);
  if (left === null) return null;
  return Math.round(Math.max(left, 0) / daysRemaining(today));
}

/** The expense a given planned item created, if its tick made one. */
export function expenseForPlannedItem(
  state: BudgetState,
  plannedItemId: string
): Expense | undefined {
  return state.expenses.find(
    (expense) => expense.plannedItemId === plannedItemId
  );
}

/* ------------------------------------------------------------------ */
/* Export and import                                                   */
/* ------------------------------------------------------------------ */

export function serialise(state: BudgetState): string {
  return JSON.stringify(state, null, 2);
}

/** Runs the same validation as a storage read; a bad file returns null. */
export function deserialise(text: string): BudgetState | null {
  try {
    return parseBudget(JSON.parse(text) as unknown);
  } catch {
    return null;
  }
}
