'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

/*
 * Success state for the contact form.
 *
 * Motion values are taken verbatim from DoomCard: the two modals on this site
 * should not open differently. Enter is the iOS drawer curve over 420ms, exit
 * is the strong ease-out over 220ms, roughly half, because the user has
 * already decided by the time it leaves.
 */
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];

const TITLE_ID = 'contact-success-title';

export default function ContactSuccessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    /*
     * Only two focusable elements live in here, so a full focus trap library
     * would be overkill; cycling between the known two is enough to stop Tab
     * walking out into the page behind an aria-modal dialog.
     */
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const first = closeRef.current;
      const last = doneRef.current;
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    // Move focus in, otherwise a keyboard user is still parked on the form.
    doneRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-xl sm:p-8"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 12,
              transition: { duration: 0.22, ease: EASE_OUT },
            }}
            transition={{ duration: 0.42, ease: EASE_DRAWER }}
            className="w-full max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bezel">
              <div className="bezel-core relative p-8 sm:p-10">
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-ink-dim transition-colors duration-[280ms] ease-out-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>

                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-glow/[0.12] text-glow shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.35)]">
                  <Check className="h-5 w-5" strokeWidth={1.5} />
                </span>

                <h3
                  id={TITLE_ID}
                  className="mt-6 text-2xl font-semibold tracking-tight text-ink"
                >
                  Message sent.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                  Thanks for getting in touch. It landed in my inbox and I will
                  reply to the address you gave me.
                  {siteConfig.responseTime
                    ? ` ${siteConfig.responseTime}`
                    : ''}
                </p>

                <button
                  ref={doneRef}
                  type="button"
                  onClick={onClose}
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-6 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-abyss"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
