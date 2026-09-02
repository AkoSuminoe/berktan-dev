'use client';

import { memo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

/* Strong ease-out. Anything entering, leaving, or answering a press uses it. */
const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

/*
 * Shared by both planner tabs. Lifted out of TokyoPlanner unchanged when the
 * personal plan needed the same control; the motion values below are the
 * originals and are deliberate, see the comment on the tick.
 *
 * Memoized with primitive props and a stable onToggle, so ticking one item
 * re-renders that item rather than the whole list.
 */
const ChecklistItem = memo(function ChecklistItem({
  id,
  label,
  detail,
  checked,
  onToggle,
  trailing,
}: {
  id: string;
  label: string;
  detail?: string;
  checked: boolean;
  onToggle: (id: string) => void;
  /** Optional right-hand slot, used for prices on the personal list. */
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onToggle(id)}
      className="group/item flex w-full items-start gap-3.5 rounded-xl px-3 py-2.5 text-left transition-[background-color,transform] duration-200 ease-out-strong hover:bg-white/[0.03] active:scale-[0.99] active:duration-100 motion-reduce:transform-none"
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[7px] transition-[background-color,box-shadow] duration-200 ease-out-strong ${
          checked
            ? 'bg-glow/15 shadow-[inset_0_0_0_1px_rgba(130,143,255,0.55),0_0_12px_-2px_rgba(130,143,255,0.5)]'
            : 'bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.07)] group-hover/item:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.14)]'
        }`}
      >
        <AnimatePresence initial={false}>
          {checked && (
            <motion.span
              initial={{ scale: 0.62, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              /*
               * Bounce is earned here: the user physically committed to a tap,
               * so the mark lands with a little momentum. 0.28 is the top of
               * the useful range; past that it reads as a toy. Never scale
               * from 0 either, nothing arrives out of nothing.
               *
               * Exit is half the length and flat: removing a tick is the
               * system responding, not the user deciding.
               */
              transition={{ type: 'spring', duration: 0.3, bounce: 0.28 }}
              exit={{
                scale: 0.72,
                opacity: 0,
                transition: { duration: 0.14, ease: easeOut },
              }}
            >
              <Check className="h-3 w-3 text-glow" strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-medium transition-colors duration-200 ease-out-strong ${
            checked ? 'text-ink-faint line-through' : 'text-ink'
          }`}
        >
          {label}
        </span>
        {detail && (
          <span
            className={`mt-0.5 block text-xs leading-relaxed transition-colors duration-200 ${
              checked ? 'text-ink-faint/60' : 'text-ink-dim'
            }`}
          >
            {detail}
          </span>
        )}
      </span>

      {trailing && (
        <span
          className={`shrink-0 pt-0.5 font-mono text-xs transition-colors duration-200 ${
            checked ? 'text-ink-faint/60 line-through' : 'text-ink-dim'
          }`}
        >
          {trailing}
        </span>
      )}
    </button>
  );
});

export default ChecklistItem;
