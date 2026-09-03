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
import { isPlausibleRate } from '@/lib/tokyo-fx';
import { BUDGET_STORAGE_KEY } from '@/lib/tokyo-storage';

/*
 * The key lives in tokyo-storage.ts with the other two, so there is exactly one
 * definition of each. Re-exported here because the budget's own callers should
 * not have to know which module owns the string.
 */
export { BUDGET_STORAGE_KEY } from '@/lib/tokyo-storage';

/**
 * Bumped only for a shape change that needs a migration.
 *
 * 1 -> 2 added `rateAtEntry` to every expense, and `totalCurrency` plus
 * `totalRateAtEntry` to the state. See `migrateV1` for why the old rows can be
 * given 215 with a straight face.
 */
export const BUDGET_SCHEMA_VERSION = 2;

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
  | 'cash'
  | 'other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'pedals',
  'collection',
  'gifts',
  'food',
  'nightlife',
  'transport',
  'cash',
  'other',
];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  pedals: 'Pedals',
  collection: 'Collection',
  gifts: 'Gifts',
  food: 'Food',
  nightlife: 'Nightlife',
  transport: 'Transport',
  cash: 'ATM fee',
  other: 'Other',
};

/**
 * A cash withdrawal records the FEE, never the amount withdrawn.
 *
 * Taking 50,000 yen out of a machine is not spending 50,000 yen; it moves money
 * from one form into another. Record the withdrawal as an expense and then
 * record the ramen bought with that cash, and the total is wrong by fifty
 * thousand yen while looking perfectly reasonable.
 *
 * The fee is the only thing the withdrawal actually costs. The amount taken out
 * goes in the note, where it is useful and harmless.
 */
export function cashWithdrawalExpense(
  atmFeeJpy: number,
  withdrawnJpy: number,
  rateAtEntry: number
) {
  return {
    jpy: atmFeeJpy,
    rateAtEntry,
    category: 'cash' as ExpenseCategory,
    note: `ATM fee on a ¥${Math.round(withdrawnJpy).toLocaleString('en-GB')} withdrawal`,
  };
}

export type Expense = {
  id: string;
  /**
   * Always yen. The pound figure is a view, computed on the way out; storing
   * both invites the two to disagree after a rate change.
   */
  jpy: number;
  /**
   * The rate this was entered at, frozen forever.
   *
   * This is the whole reason the schema moved to 2. Money already spent was
   * spent at a rate that no longer exists, so converting an old expense with
   * today's rate does not correct it, it falsifies it: last week's tonkatsu
   * would cost a different number of pounds every time the page loaded. Only
   * the *remaining* budget is allowed to move.
   */
  rateAtEntry: number;
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
  /**
   * Which currency the budget was typed in, and at what rate.
   *
   * Whichever one he typed is the one that holds still. "I have 1,000 pounds"
   * is a claim about pounds, so its yen equivalent should float with the rate;
   * "I have 150,000 yen in cash" is a claim about yen, and floating it would be
   * wrong. Storing only the yen would silently drift the pound budget by about
   * 20 pounds across eight days at 2%.
   */
  totalCurrency: Currency;
  totalRateAtEntry: number;
  /** Null means derive it from what is left and how many days remain. */
  dailyCapJpy: number | null;
  expenses: Expense[];
};

export function emptyBudget(): BudgetState {
  return {
    version: BUDGET_SCHEMA_VERSION,
    totalJpy: null,
    totalCurrency: 'GBP',
    totalRateAtEntry: EXCHANGE_RATE,
    dailyCapJpy: null,
    expenses: [],
  };
}

/* ------------------------------------------------------------------ */
/* Currency                                                            */
/* ------------------------------------------------------------------ */

export type Currency = 'JPY' | 'GBP';

/*
 * The rate is a parameter, never a module constant, because which rate applies
 * is a real decision at every call: the rate an old expense was entered at, or
 * today's for anything still to be spent. Reaching for an ambient rate is how
 * the two get mixed up.
 */
export function toJpy(amount: number, currency: Currency, rate: number): number {
  return currency === 'JPY' ? Math.round(amount) : Math.round(amount * rate);
}

export function fromJpy(jpy: number, currency: Currency, rate: number): number {
  return currency === 'JPY' ? jpy : jpy / rate;
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

/**
 * Local calendar date, not UTC: `toISOString` would roll over at 9am JST.
 *
 * Kept as the fallback for `tokyoDateKey`, and as the thing that is right when
 * no timezone database is available.
 */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * The day it is in Tokyo, which is the only day that means anything here.
 *
 * Checking the budget at 01:00 in a bar in Shibuya has to count as that day,
 * and opening the same page from London must not move the boundary: the trip
 * has eight dated days and they are Japanese ones. This stamps every expense
 * and drives the daily cap, the days remaining and the weekday test the card
 * spread uses, so all of them turn over together.
 *
 * `en-CA` is the shortest route to YYYY-MM-DD from Intl. The try/catch is not
 * ceremony: a runtime without the full timezone data throws on a named zone,
 * and a thrown date formatter must not take the budget down with it.
 */
export function tokyoDateKey(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tokyo',
    }).format(date);
  } catch {
    return localDateKey(date);
  }
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
    : tokyoDateKey();
}

/** A rate outside plausible bounds is a corrupt row, not a rate. */
function cleanRate(value: unknown): number {
  return isPlausibleRate(value) ? value : EXCHANGE_RATE;
}

function cleanExpense(value: unknown): Expense | null {
  if (!isRecord(value)) return null;
  const jpy = cleanAmount(value.jpy);
  if (jpy === null) return null;
  const id = typeof value.id === 'string' && value.id ? value.id : newId();

  return {
    id,
    jpy,
    rateAtEntry: cleanRate(value.rateAtEntry),
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
  if (value.version !== 1 && value.version !== BUDGET_SCHEMA_VERSION) {
    return null;
  }

  /*
   * A v1 row carries no rate, and `cleanRate` gives it 215. That is not a
   * guess: v1 existed only while the rate was the hardcoded constant, so 215
   * genuinely is the rate every one of those was entered at.
   */
  const migrating = value.version === 1;

  const rawExpenses = Array.isArray(value.expenses) ? value.expenses : [];
  const expenses: Expense[] = [];
  for (const raw of rawExpenses.slice(0, MAX_EXPENSES)) {
    const expense = cleanExpense(raw);
    if (expense) expenses.push(expense);
  }

  return {
    version: BUDGET_SCHEMA_VERSION,
    totalJpy: cleanAmount(value.totalJpy),
    /* v1 offered a GBP toggle and converted at 215, so the same reasoning holds. */
    totalCurrency: value.totalCurrency === 'JPY' ? 'JPY' : 'GBP',
    totalRateAtEntry: migrating
      ? EXCHANGE_RATE
      : cleanRate(value.totalRateAtEntry),
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
export function readBudget(): {
  state: BudgetState;
  persisted: boolean;
} {
  try {
    const raw = window.localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!raw) return { state: emptyBudget(), persisted: true };
    const parsed = parseBudget(JSON.parse(raw) as unknown);
    return { state: parsed ?? emptyBudget(), persisted: true };
  } catch {
    return { state: emptyBudget(), persisted: false };
  }
}

/** The only function that writes a budget key. Returns whether it stuck. */
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

/**
 * Spending in pounds, each entry at the rate it was entered at.
 *
 * Deliberately not `totalSpent(state) / todaysRate`. That version would restate
 * every past purchase every time the rate moved, so the figure would drift
 * without anything having been bought. What was paid was paid.
 */
export function spentGbp(state: BudgetState): number {
  return sum(state.expenses.map((expense) => expense.jpy / expense.rateAtEntry));
}

/**
 * The budget in pounds, at the rate it was set at.
 *
 * A budget typed as "1,000 pounds" is a claim about pounds and stays 1,000.
 * One typed in yen is a claim about yen, so its pound value moves with the rate
 * and takes today's.
 */
export function totalGbp(state: BudgetState, todaysRate: number): number | null {
  if (state.totalJpy === null) return null;
  return state.totalCurrency === 'GBP'
    ? state.totalJpy / state.totalRateAtEntry
    : state.totalJpy / todaysRate;
}

/**
 * What is left, in pounds, at today's rate. This one is *supposed* to move:
 * money not yet spent will be spent at whatever the rate turns out to be.
 */
export function remainingGbp(
  state: BudgetState,
  todaysRate: number
): number | null {
  const total = totalGbp(state, todaysRate);
  if (total === null) return null;
  return total - spentGbp(state);
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

/**
 * One expense in pounds, at the rate it was entered at.
 *
 * Both currencies without storing both. A second stored field would be a
 * second source of truth: edit the yen, or import a file written by an older
 * version, and the two disagree with nothing to say which is right. Yen plus a
 * frozen rate is exact, and the pound figure cannot drift because it is not
 * stored at all.
 */
export const expenseGbp = (expense: Expense) =>
  expense.jpy / expense.rateAtEntry;

export function totalsByCategoryFor(
  expenses: Expense[]
): Record<ExpenseCategory, number> {
  const totals = {} as Record<ExpenseCategory, number>;
  for (const category of EXPENSE_CATEGORIES) totals[category] = 0;
  for (const expense of expenses) totals[expense.category] += expense.jpy;
  return totals;
}

/**
 * The same split in pounds, each row at its own rate.
 *
 * Deliberately not `totalsByCategoryFor(...) / todaysRate`. That would restate
 * every past purchase whenever the rate moved, which is the whole reason
 * `rateAtEntry` exists; the discipline just has to survive one level of
 * aggregation to still be worth anything.
 */
export function gbpByCategoryFor(
  expenses: Expense[]
): Record<ExpenseCategory, number> {
  const totals = {} as Record<ExpenseCategory, number>;
  for (const category of EXPENSE_CATEGORIES) totals[category] = 0;
  for (const expense of expenses) {
    totals[expense.category] += expenseGbp(expense);
  }
  return totals;
}

export function totalsByCategory(
  state: BudgetState
): Record<ExpenseCategory, number> {
  return totalsByCategoryFor(state.expenses);
}

/* ------------------------------------------------------------------ */
/* Periods                                                             */
/* ------------------------------------------------------------------ */

/**
 * Which slice of the trip is on screen.
 *
 * 'sofar' rather than 'this week': eight days have no calendar weeks in them,
 * and labelling it that way would invent a boundary that does not exist.
 */
export type Period = 'today' | 'sofar' | 'trip';

export const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  sofar: 'So far',
  trip: 'Whole trip',
};

export function expensesForPeriod(
  state: BudgetState,
  period: Period,
  today: string
): Expense[] {
  if (period === 'trip') return state.expenses;
  if (period === 'today') {
    return state.expenses.filter((expense) => expense.date === today);
  }
  return state.expenses.filter((expense) => expense.date <= today);
}

/** Trip days up to and including today. Zero before the trip starts. */
export function daysElapsed(today: string): number {
  return TRIP_DATES.filter((date) => date <= today).length;
}

/**
 * What this period was allowed to cost.
 *
 * Today takes the derived cap, which already shrinks after an expensive day.
 * 'So far' takes an even split of the budget across the days gone, which is
 * the only per-period figure the plan can honestly support. Before the trip
 * starts nothing has been consumed by the schedule, so the yardstick is the
 * whole budget and the card says so.
 */
export function allowanceForPeriod(
  state: BudgetState,
  period: Period,
  today: string
): number | null {
  if (state.totalJpy === null) return null;
  if (period === 'trip') return state.totalJpy;
  if (period === 'today') return deriveDailyCap(state, today);

  const elapsed = daysElapsed(today);
  if (elapsed === 0) return state.totalJpy;
  return Math.round((state.totalJpy * elapsed) / TRIP_DATES.length);
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
