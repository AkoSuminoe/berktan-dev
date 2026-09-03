'use client';

import { useEffect, useState } from 'react';
import {
  parseFxQuote,
  readCachedFx,
  writeCachedFx,
  staleness,
  FALLBACK_QUOTE,
  type FxQuote,
  type Staleness,
} from '@/lib/tokyo-fx';

/**
 * The live rate, with an answer available at every moment.
 *
 * `quote` is never null, so no call site has to branch on "no rate yet". The
 * order of preference is network, then this browser's last good rate, then the
 * constant the plan was written at. `state` says which of those it is, and the
 * header reports that honestly rather than implying the number is current.
 *
 * The cached rate is read first and synchronously in the mount effect, so a
 * phone with no signal in Tokyo renders a real number immediately instead of
 * waiting for a fetch that will time out.
 */
export function useTokyoFx() {
  const [quote, setQuote] = useState<FxQuote>(FALLBACK_QUOTE);
  const [fromCache, setFromCache] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const cached = readCachedFx();
    if (cached) {
      setQuote(cached);
      setFromCache(true);
      setReady(true);
    }

    (async () => {
      try {
        const res = await fetch('/api/fx');
        if (!res.ok) throw new Error('fx unavailable');

        const fresh = parseFxQuote((await res.json()) as unknown);
        if (!alive || !fresh) return;

        /*
         * The route falls back to the constant when both providers are down.
         * A cached real rate beats that, so only take this if it is either a
         * live quote or the only thing available.
         */
        if (fresh.source === 'fallback' && cached) return;

        setQuote(fresh);
        setFromCache(false);
        if (fresh.source !== 'fallback') writeCachedFx(fresh);
      } catch {
        // Offline. The cached rate, or the constant, already stands.
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const state: Staleness = staleness(quote, fromCache);

  return { quote, rate: quote.rate, state, ready };
}
