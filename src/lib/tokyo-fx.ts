/*
 * The GBP to JPY rate, fetched rather than assumed.
 *
 * The plan was drafted at 215 yen to the pound and that number is still the
 * fallback, but a rate moves and the trip is eight days long.
 *
 * OFFLINE IS THE MAIN PATH, not an edge case: roaming may be off for most of
 * the week in Tokyo. Every function here either returns a usable rate or says
 * plainly which older one it is returning. Nothing may produce NaN, a blank, or
 * a promise that never settles, because a converter that shows nothing in a
 * shop is worse than one showing yesterday's number.
 */

import { EXCHANGE_RATE } from '@/lib/tokyo-personal';

/** Global, not per-profile. A rate is a fact about the world, not about a person. */
export const FX_STORAGE_KEY = 'tokyo-fx-v1';

/** What the plan was written at, and the last resort when nothing else answers. */
export const FALLBACK_RATE = EXCHANGE_RATE;

/**
 * Plausible bounds for JPY per GBP.
 *
 * This is the most important guard in the file. A provider that changes its
 * response shape hands back `undefined` or `1`, and `jpy / 1` silently turns
 * every figure on the page into nonsense that still looks like a number. A rate
 * outside this range is a failed parse, not a rate.
 */
export const MIN_PLAUSIBLE_RATE = 100;
export const MAX_PLAUSIBLE_RATE = 400;

export function isPlausibleRate(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    isFinite(value) &&
    value >= MIN_PLAUSIBLE_RATE &&
    value <= MAX_PLAUSIBLE_RATE
  );
}

/** Which feed answered, or that none did. */
export type FxSource = 'erapi' | 'frankfurter' | 'fallback';

export type FxQuote = {
  /** JPY per GBP. */
  rate: number;
  /** The date the provider says the rate is for, 'YYYY-MM-DD'. */
  asOf: string;
  source: FxSource;
  /** When this machine received it, epoch ms. */
  fetchedAt: number;
};

export const FALLBACK_QUOTE: FxQuote = {
  rate: FALLBACK_RATE,
  asOf: '2026-08-01',
  source: 'fallback',
  fetchedAt: 0,
};

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const SOURCES: FxSource[] = ['erapi', 'frankfurter', 'fallback'];

/**
 * The trust boundary. Runs on the API response and on whatever is in
 * localStorage, both of which are outside this module's control. Rebuilds the
 * object field by field rather than casting.
 */
export function parseFxQuote(value: unknown): FxQuote | null {
  if (!isRecord(value)) return null;
  if (!isPlausibleRate(value.rate)) return null;

  const asOf =
    typeof value.asOf === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.asOf)
      ? value.asOf
      : null;
  if (!asOf) return null;

  return {
    rate: value.rate,
    asOf,
    source:
      SOURCES.indexOf(value.source as FxSource) !== -1
        ? (value.source as FxSource)
        : 'fallback',
    fetchedAt:
      typeof value.fetchedAt === 'number' && isFinite(value.fetchedAt)
        ? value.fetchedAt
        : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Staleness                                                           */
/* ------------------------------------------------------------------ */

export type Staleness = 'fresh' | 'stale' | 'offline';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * `offline` means this came from the cache rather than the network on this
 * page load, so it is a fact about where the number came from, not only about
 * its age. That distinction is what the dot in the header reports.
 */
export function staleness(
  quote: FxQuote,
  fromCache: boolean,
  now: number = Date.now()
): Staleness {
  if (quote.source === 'fallback') return 'offline';
  if (fromCache) return 'offline';
  return now - quote.fetchedAt > DAY_MS ? 'stale' : 'fresh';
}

/** Short, human, and never a lie. Used beside the dot in the sticky strip. */
export function ageLabel(quote: FxQuote, now: number = Date.now()): string {
  if (quote.source === 'fallback') return 'no live rate';

  const minutes = Math.floor((now - quote.fetchedAt) / 60000);
  if (quote.fetchedAt === 0) return `as of ${quote.asOf}`;
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/* Cache                                                               */
/* ------------------------------------------------------------------ */

export function readCachedFx(): FxQuote | null {
  try {
    const raw = window.localStorage.getItem(FX_STORAGE_KEY);
    if (!raw) return null;
    return parseFxQuote(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeCachedFx(quote: FxQuote): void {
  try {
    window.localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(quote));
  } catch {
    // Private mode and a full quota both throw. A rate that fails to cache is
    // not worth surfacing: the live one still works for this session.
  }
}

/* ------------------------------------------------------------------ */
/* The ladder                                                          */
/* ------------------------------------------------------------------ */

/** Round yen amounts worth knowing by heart while standing in a shop. */
export const LADDER_STEPS = [100, 500, 1000, 5000, 10000];
