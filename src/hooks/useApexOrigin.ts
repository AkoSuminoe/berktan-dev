'use client';

import { useEffect, useState } from 'react';

/** The one hostname a bare "/#section" href resolves correctly against. */
const APEX_ORIGIN = 'https://berktan.dev';

const APEX_HOSTS = new Set(['berktan.dev', 'localhost', '127.0.0.1']);

/*
 * Returns '' on the main site and the apex origin anywhere else.
 *
 * Chrome elements in the root layout render on every hostname this app serves,
 * including whisper.berktan.dev. Their hrefs are "/#section" fragments, and a
 * fragment never reaches the server, so on the subdomain the request arrives
 * as "/" and gets the demo page with a hash matching nothing. Middleware
 * cannot tell the two apart; only the browser can.
 *
 * Starts empty so the first client render matches the server's markup, then
 * fills in from an effect. Prefixing an empty string is a no-op, so callers
 * can interpolate it unconditionally.
 */
export function useApexOrigin(): string {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (!APEX_HOSTS.has(window.location.hostname)) setOrigin(APEX_ORIGIN);
  }, []);

  return origin;
}
