/*
 * Browser storage for the /semester page, in one place.
 *
 * Four keys, all versioned, all private to this route. Nothing here ever
 * leaves the browser: there is no server, no sync and no analytics event
 * carrying a tick. Same posture as the /tokyo planner.
 *
 * Every read is defensive twice over. `localStorage` throws outright in some
 * privacy modes, so every call is wrapped; and whatever comes back is
 * untrusted input, so it is shape-checked before it is used. A hand-edited or
 * stale value must degrade to the default, never to a render crash.
 */

import type { CategoryId, Deadline } from '@/data/semester-plan';
import { CATEGORIES, DEFAULT_DEADLINES } from '@/data/semester-plan';

export const DONE_KEY = 'bs-semester-done-v1';
export const BAD_DAY_KEY = 'bs-semester-bad-v1';
/*
 * v2: the category ids were renamed from Turkish to English when the page
 * moved to English copy. A v1 row would fail the category check and be dropped
 * silently, which reads as the list eating an entry, so the key is bumped and
 * v1 is left on disk.
 */
export const DEADLINES_KEY = 'bs-semester-deadlines-v2';
export const TAB_KEY = 'bs-semester-tab-v1';

/** A stored deadline keeps an id so the list can be edited row by row. */
export type StoredDeadline = Deadline & { id: string };

/** `{ "2026-09-21": { "3": true } }`, day key to block index to ticked. */
export type DoneMap = Record<string, Record<string, boolean>>;
/** `{ "2026-09-21": true }` for the days running the bad-day list. */
export type BadDayMap = Record<string, boolean>;

function readRaw(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private mode, or the quota is full. Losing a tick beats throwing. */
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(CATEGORIES, v);
}

export function readDone(): DoneMap {
  const parsed = readRaw(DONE_KEY);
  if (!isRecord(parsed)) return {};
  const out: DoneMap = {};
  for (const dayKey of Object.keys(parsed)) {
    const day = parsed[dayKey];
    if (!isRecord(day)) continue;
    const ticks: Record<string, boolean> = {};
    for (const index of Object.keys(day)) {
      if (day[index] === true) ticks[index] = true;
    }
    out[dayKey] = ticks;
  }
  return out;
}

export const writeDone = (value: DoneMap): void => write(DONE_KEY, value);

export function readBadDays(): BadDayMap {
  const parsed = readRaw(BAD_DAY_KEY);
  if (!isRecord(parsed)) return {};
  const out: BadDayMap = {};
  for (const key of Object.keys(parsed)) {
    if (parsed[key] === true) out[key] = true;
  }
  return out;
}

export const writeBadDays = (value: BadDayMap): void => write(BAD_DAY_KEY, value);

/**
 * Deadlines are the one list the user writes into, so this is the strictest
 * read: a row survives only with a string title, a category that still exists
 * in the plan, and either a well formed ISO day or no date at all.
 */
export function readDeadlines(): StoredDeadline[] {
  const parsed = readRaw(DEADLINES_KEY);
  if (!Array.isArray(parsed)) return defaultDeadlines();
  const rows: StoredDeadline[] = [];
  parsed.forEach((row, i) => {
    if (!isRecord(row)) return;
    const { title, date, cat, id } = row;
    if (typeof title !== 'string' || title.trim() === '') return;
    if (!isCategoryId(cat)) return;
    const day = typeof date === 'string' && ISO_DAY.test(date) ? date : null;
    rows.push({
      id: typeof id === 'string' && id !== '' ? id : `stored-${i}`,
      title: title.slice(0, 160),
      date: day,
      cat,
    });
  });
  return rows;
}

export const writeDeadlines = (rows: StoredDeadline[]): void =>
  write(DEADLINES_KEY, rows);

/** The plan's own list, given ids, used until the user edits anything. */
export function defaultDeadlines(): StoredDeadline[] {
  return DEFAULT_DEADLINES.map((d, i) => ({ ...d, id: `plan-${i}` }));
}

export function readTab(valid: readonly string[]): string | null {
  const parsed = readRaw(TAB_KEY);
  return typeof parsed === 'string' && valid.indexOf(parsed) !== -1 ? parsed : null;
}

export const writeTab = (tab: string): void => write(TAB_KEY, tab);
