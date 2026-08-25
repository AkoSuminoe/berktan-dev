'use client';

import { useEffect, useState } from 'react';
import type { NowPlayingPayload } from '@/lib/spotify';

/*
 * 10s, down from 30s, so skipping a track shows up without a page refresh.
 * That is only defensible because polling stops entirely while the tab is
 * hidden; the previous version kept hitting the route in a background tab
 * forever.
 */
const POLL_INTERVAL = 10_000;

export function useNowPlaying(): NowPlayingPayload | null {
  const [payload, setPayload] = useState<NowPlayingPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let controller: AbortController | undefined;

    const load = async () => {
      // Cancel any request still in flight rather than racing it
      controller?.abort();
      const active = new AbortController();
      controller = active;

      try {
        const res = await fetch('/api/spotify', {
          cache: 'no-store',
          signal: active.signal,
        });
        if (!res.ok) return;
        const json = (await res.json()) as NowPlayingPayload;
        if (!cancelled) setPayload(json);
      } catch {
        /*
         * Deliberately keep the last good payload. The previous version reset
         * to null on any failure, which animated the whole widget out on a
         * single dropped request.
         */
      }
    };

    const start = () => {
      if (timer) return;
      void load();
      timer = setInterval(() => void load(), POLL_INTERVAL);
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };

    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      stop();
      controller?.abort();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return payload;
}
