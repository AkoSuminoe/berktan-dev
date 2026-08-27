'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

/* DOOM's god-mode cheat. Ties the egg to the one already in the Experience
   bento rather than inventing a second unrelated secret. */
const CHEAT = 'iddqd';

/*
 * Client leaf on an otherwise static 404. Everything the page says is server
 * rendered; only the listener and the reward pill live here.
 */
export default function GodModeEgg() {
  const [found, setFound] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (found) return;

    let buffer = '';
    const onKey = (event: KeyboardEvent) => {
      // Single characters only, so modifiers and arrows cannot pollute the
      // buffer and break a run of correct letters.
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-CHEAT.length);
      if (buffer === CHEAT) setFound(true);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [found]);

  return (
    <AnimatePresence>
      {found && (
        <motion.div
          /*
           * Same spring as the FloatingDock entrance. It carries a little
           * bounce, which the motion grammar normally reserves for gestures
           * that had momentum. It is earned here for the same reason the dock
           * earns it: this is a discrete arrival the user deliberately
           * triggered, not a hover and not a fade-in.
           */
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={
            reduce
              ? { duration: 0.24, ease: [0.23, 1, 0.32, 1] }
              : { type: 'spring', stiffness: 260, damping: 24 }
          }
          className="mt-10"
        >
          <Link
            href="/#experience"
            className="group inline-flex items-center gap-3 rounded-full bg-glow/[0.12] py-2 pl-6 pr-2 text-sm font-medium text-glow shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.4)] transition-[transform,box-shadow] duration-[280ms] ease-out-strong hover:scale-[1.025] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(130,143,255,0.65)] active:scale-[0.975] active:duration-[120ms]"
          >
            God mode. Go play DOOM
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-glow/20 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
              <Gamepad2 className="h-4 w-4" strokeWidth={1.5} />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
