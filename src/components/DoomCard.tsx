'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const JSDOS_JS = 'https://v8.js-dos.com/latest/js-dos.js';
const JSDOS_CSS = 'https://v8.js-dos.com/latest/js-dos.css';
/* Self-hosted: cdn.dos.zone sends no CORS headers, so the bundle (DOOM
 * shareware, freely redistributable) lives in /public and is served
 * same-origin. It only downloads when the player boots. */
const DOOM_BUNDLE = '/doom.jsdos';

/* Strong ease-out: everything entering or leaving the screen uses it. */
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

type DosPlayer = { stop: () => Promise<void> };

declare global {
  interface Window {
    Dos?: (
      element: HTMLElement,
      options: Record<string, unknown>
    ) => DosPlayer;
  }
}

/* js-dos assets load once per session; the promise is cached module-level */
let jsDosLoader: Promise<void> | null = null;

function loadJsDos(): Promise<void> {
  if (jsDosLoader) return jsDosLoader;
  jsDosLoader = new Promise<void>((resolve, reject) => {
    if (window.Dos) {
      resolve();
      return;
    }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = JSDOS_CSS;
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = JSDOS_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      jsDosLoader = null;
      reject(new Error('failed to load js-dos'));
    };
    document.head.appendChild(script);
  });
  return jsDosLoader;
}

type Status = 'loading' | 'running' | 'error';

const LEGEND: { keys: string; action: string }[] = [
  { keys: '↑ ↓ ← →', action: 'Move' },
  { keys: 'SPACE', action: 'Fire' },
  { keys: 'CTRL', action: 'Use' },
  { keys: 'ALT', action: 'Strafe' },
  { keys: 'ESC', action: 'Exit' },
];

/*
 * "It runs DOOM" easter egg. Premium shell, retro core: DOOM shareware runs
 * fully client-side on a canvas via js-dos v8 (DOSBox compiled to WASM).
 * Nothing loads until boot; the emulator is disposed on close.
 */
export default function DoomCard() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<DosPlayer | null>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);

    let cancelled = false;
    const mountEl = mountRef.current;
    setStatus('loading');

    loadJsDos()
      .then(() => {
        if (cancelled || !mountEl || !window.Dos) return;
        playerRef.current = window.Dos(mountEl, {
          url: DOOM_BUNDLE,
          autoStart: true,
          kiosk: true,
          imageRendering: 'pixelated',
        });
        setStatus('running');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      playerRef.current?.stop();
      playerRef.current = null;
      if (mountEl) mountEl.innerHTML = '';
    };
  }, [open]);

  return (
    <>
      <GlassCard className="h-full">
        <div className="flex h-full flex-col">
          <Gamepad2 className="h-5 w-5 text-glow" strokeWidth={1.5} />
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
            Yes, this portfolio runs DOOM.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-dim">
            The 1993 shareware, emulated on a canvas in your browser.
          </p>
          <div className="mt-auto pt-6">
            <button
              onClick={() => setOpen(true)}
              className="group inline-flex items-center gap-3 rounded-full bg-white/[0.045] py-1.5 pl-5 pr-1.5 text-sm font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-[transform,box-shadow] duration-[280ms] ease-out-strong hover:scale-[1.025] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(130,143,255,0.4)] active:scale-[0.975] active:duration-[120ms]"
            >
              Boot DOOM
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.07] transition-transform duration-[280ms] ease-out-strong group-hover:scale-105">
                <Gamepad2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
            </button>
          </div>
        </div>
      </GlassCard>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-xl sm:p-8"
            onClick={() => setOpen(false)}
          >
            <motion.div
              /* Modals are not anchored to a trigger, so they keep a centred
                 origin. Exit is roughly half the enter: the user has already
                 decided by the time it leaves. */
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 12,
                transition: { duration: 0.22, ease: EASE_OUT },
              }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bezel">
                <div className="bezel-core overflow-hidden p-0">
                  <div className="flex items-center justify-between px-5 py-3 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
                    <p className="text-sm font-medium text-ink">
                      DOOM{' '}
                      <span className="text-ink-faint">(1993, shareware)</span>
                    </p>
                    <button
                      onClick={() => setOpen(false)}
                      aria-label="Close DOOM"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-ink-dim transition-colors duration-300 hover:text-ink"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="relative aspect-[4/3] w-full bg-black">
                    <div ref={mountRef} className="absolute inset-0" />
                    {status === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="animate-pulse text-sm text-ink-dim">
                          Booting DOOM…
                        </p>
                      </div>
                    )}
                    {status === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                        <p className="text-sm text-ink-dim">
                          The emulator could not load. Check your connection
                          and try again.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Keyboard legend */}
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                    {LEGEND.map((item, i) => (
                      <span
                        key={item.action}
                        className="flex items-center gap-3"
                      >
                        <span className="flex items-center gap-1.5">
                          <kbd className="rounded-[4px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] px-1.5 py-0.5 font-mono text-[10.5px] tracking-tight text-ink-dim shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.06),0_1px_1px_-1px_rgba(0,0,0,0.6)]">
                            {item.keys}
                          </kbd>
                          <span className="text-[11px] tracking-tight text-ink-faint">
                            {item.action}
                          </span>
                        </span>
                        {i < LEGEND.length - 1 && (
                          <span className="text-ink-faint/60">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
