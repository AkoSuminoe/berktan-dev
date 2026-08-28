'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

const SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/*
 * The site key is public by design: Cloudflare expects it in the HTML of every
 * page that renders a widget, and it grants nothing on its own. The secret,
 * which is the half that actually verifies a token, is server-only and never
 * carries the NEXT_PUBLIC_ prefix. Same distinction as the analytics beacon
 * token; see AI_MEMORY.md section 5.
 *
 * Read at module scope because NEXT_PUBLIC_ values are inlined at build time
 * anyway, so there is nothing dynamic to preserve.
 */
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

/* Module-level promise cache, the same pattern DoomCard uses for js-dos: the
   script loads once per session no matter how many widgets mount. */
let loader: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SRC}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('turnstile')));
      return;
    }

    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Clear the cache so a later mount can retry rather than inheriting a
      // permanently rejected promise.
      loader = null;
      reject(new Error('turnstile'));
    };
    document.head.appendChild(script);
  });

  return loader;
}

export type TurnstileHandle = {
  /** Discards the current token and re-arms the widget. */
  reset: () => void;
};

type TurnstileProps = {
  /** Called with a token on success, and with '' whenever one stops being valid. */
  onToken: (token: string) => void;
  onError?: () => void;
  className?: string;
};

/*
 * Renders nothing at all when no site key is configured, which is the state
 * until Berktan creates one. Callers check `TURNSTILE_SITE_KEY` to decide
 * whether to gate their submit button, so an unconfigured site behaves exactly
 * as it did before the captcha existed.
 */
const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(
  { onToken, onError, className },
  ref
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);

  /*
   * turnstile.render captures its callbacks once, at render time. Keeping them
   * in refs means a parent re-render cannot invalidate the effect and draw a
   * second widget next to the first.
   */
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onTokenRef.current = onToken;
    onErrorRef.current = onError;
  });

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        // A token is single use. Without this, a second attempt after any
        // failure submits a spent token and fails for a reason the user
        // cannot see.
        onTokenRef.current('');
        if (widgetRef.current && window.turnstile) {
          window.turnstile.reset(widgetRef.current);
        }
      },
    }),
    []
  );

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        widgetRef.current = window.turnstile.render(hostRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => {
            onTokenRef.current('');
            onErrorRef.current?.();
          },
          // The site is dark only, so 'auto' would follow the visitor's OS and
          // could drop a light widget onto a near-black surface.
          theme: 'dark',
        });
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current?.();
      });

    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;

  return <div ref={hostRef} className={className} />;
});

export default Turnstile;
