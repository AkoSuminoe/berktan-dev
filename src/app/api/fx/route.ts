import { NextResponse } from 'next/server';
import {
  isPlausibleRate,
  FALLBACK_QUOTE,
  type FxQuote,
} from '@/lib/tokyo-fx';

/*
 * GBP to JPY, fetched server-side.
 *
 * Server-side for three reasons: no CORS to negotiate, no provider URL in the
 * client bundle, and one cached entry serves every visitor rather than every
 * phone hitting a free endpoint on its own.
 *
 * Two providers, because the failure this guards against is being rate-less in
 * Tokyo on roaming. Every path returns HTTP 200 with a `source` saying how good
 * the answer is, which is the convention `api/spotify/route.ts` already sets: a
 * third-party feed being down is not the visitor's error to handle.
 */

export const revalidate = 3600;

/**
 * Primary. Daily, and unlike the ECB it publishes at weekends, which is why it
 * leads: the trip spans two of them.
 */
const ERAPI = 'https://open.er-api.com/v6/latest/GBP';

/**
 * ECB reference rates. Weekdays only, so second by design rather than by rank.
 *
 * The canonical host, not `api.frankfurter.app`, which now answers 301 to this.
 * Following a redirect on every rate fetch is a hop that can fail on its own.
 *
 * THE TWO FEEDS DO NOT AGREE. Measured on 3 Sept 2026: er-api 214.59, ECB
 * 210.57, a gap of 1.9%. The ECB figure is internally consistent (EUR->JPY
 * 181.21 over EUR->GBP 0.86055 gives 210.575), so neither is broken; they are
 * snapshots taken at different moments by different methods.
 *
 * 1.9% is the same order as the card spread the calibration measures, so a
 * silent failover from one to the other would quietly corrupt a calibration.
 * That is why `source` travels on the quote and gets stored with a calibration:
 * so a mismatch can be reported rather than absorbed.
 */
const FRANKFURTER = 'https://api.frankfurter.dev/v1/latest?base=GBP&symbols=JPY';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Trims a provider's timestamp to a plain date, or falls back to today's. */
function asDate(value: unknown): string {
  if (typeof value !== 'string') return today();
  if (ISO_DATE.test(value)) return value;
  const parsed = Date.parse(value);
  return isNaN(parsed) ? today() : new Date(parsed).toISOString().slice(0, 10);
}

async function fromErApi(): Promise<FxQuote | null> {
  const res = await fetch(ERAPI, { next: { revalidate } });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    result?: string;
    rates?: Record<string, unknown>;
    time_last_update_utc?: string;
  };
  if (json.result !== 'success') return null;

  const rate = json.rates?.JPY;
  if (!isPlausibleRate(rate)) return null;

  return {
    rate,
    asOf: asDate(json.time_last_update_utc),
    source: 'erapi',
    fetchedAt: Date.now(),
  };
}

async function fromFrankfurter(): Promise<FxQuote | null> {
  const res = await fetch(FRANKFURTER, { next: { revalidate } });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    rates?: Record<string, unknown>;
    date?: string;
  };

  const rate = json.rates?.JPY;
  if (!isPlausibleRate(rate)) return null;

  return {
    rate,
    asOf: asDate(json.date),
    source: 'frankfurter',
    fetchedAt: Date.now(),
  };
}

export async function GET() {
  for (const provider of [fromErApi, fromFrankfurter]) {
    try {
      const quote = await provider();
      if (quote) {
        return NextResponse.json(quote, {
          headers: {
            'Cache-Control': `public, max-age=0, s-maxage=${revalidate}, stale-while-revalidate=86400`,
          },
        });
      }
    } catch {
      // Try the next one. A thrown fetch and a malformed body are the same
      // problem from here: this provider did not answer.
    }
  }

  /*
   * Both feeds are unreachable or unrecognisable. The client prefers its own
   * cached rate over this, so this is the answer only on a first visit with no
   * network, where a labelled 215 beats an error.
   */
  return NextResponse.json(
    { ...FALLBACK_QUOTE, asOf: today() },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
