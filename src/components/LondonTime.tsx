'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/site-config';

/*
 * "Based in London", as a fact a recruiter can check rather than a claim.
 *
 * Hydration: the server has no idea what time it is where the reader is, and
 * rendering a real clock during SSR guarantees a mismatch, because the value
 * baked at build time is minutes or months old by the time anyone loads it.
 * So both the server render and the first client render show the placeholder,
 * and the real value only ever arrives from an effect. Nothing to reconcile.
 *
 * The zone label is read from Intl, never hardcoded. Europe/London is GMT for
 * half the year and BST for the other half, and it shifts on a rule that is
 * not worth reimplementing. Verified both ways against a January and an
 * August timestamp.
 */

const PLACEHOLDER = '--:--';

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: siteConfig.timeZone,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short',
});

function readLondonTime(): { time: string; zone: string } {
  const parts = formatter.formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    time: `${value('hour')}:${value('minute')}`,
    zone: value('timeZoneName'),
  };
}

/* 51.5072 N, 0.1276 W. Formatted here so the numbers stay in site-config. */
function formatCoordinate(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

export default function LondonTime() {
  const [clock, setClock] = useState<{ time: string; zone: string } | null>(
    null
  );

  useEffect(() => {
    const tick = () => setClock(readLondonTime());
    tick();

    /*
     * Align to the next minute boundary, then run on the minute. A naive
     * 60s interval started at load drifts to whatever second the page opened
     * on, so the display would change at :37 past every minute. Every offset
     * in this zone is a whole number of hours, so the epoch modulo is the
     * wall-clock boundary too.
     */
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, 60_000 - (Date.now() % 60_000));

    /*
     * Background tabs get their timers throttled, so a tab left open and
     * returned to can show a stale minute. Cheaper and more reliable to
     * re-read on the way back than to fight the throttling.
     */
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const { latitude, longitude } = siteConfig.coordinates;

  return (
    <div className="flex items-center gap-5">
      {/*
        A stylised Thames meander, not a map. A real map tile would mean a new
        remote image host in next.config.js and a request to a third party on
        every page load, to say something one line of text already says.
      */}
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className="h-14 w-14 shrink-0 overflow-visible"
        fill="none"
      >
        <path
          d="M0 30 C 9 30, 13 21, 21 21 C 29 21, 31 38, 39 38 C 45 38, 47 29, 53 29 C 59 29, 61 35, 64 35"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-white/[0.14]"
        />
        {/* Central London, on the line, in the one accent the site allows. */}
        <circle cx="32" cy="30" r="2.5" className="fill-glow/70" />
        <circle cx="32" cy="30" r="6" className="fill-glow/10" />
      </svg>

      <div>
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-faint">
          <span className="status-dot h-1.5 w-1.5 rounded-full bg-glow" />
          {siteConfig.location}
        </p>

        <p className="mt-2 font-mono text-2xl tracking-tight text-ink">
          <span className="sr-only">Local time in London: </span>
          {clock?.time ?? PLACEHOLDER}
          <span className="ml-2 text-sm text-ink-faint">
            {clock?.zone ?? ''}
          </span>
        </p>

        <p className="mt-1 font-mono text-xs text-ink-faint">
          {formatCoordinate(latitude, 'N', 'S')},{' '}
          {formatCoordinate(longitude, 'E', 'W')}
        </p>
      </div>
    </div>
  );
}
