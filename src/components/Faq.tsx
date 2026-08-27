'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { faq } from '@/lib/faq';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

/*
 * Recruiter FAQ.
 *
 * Motion note, because this is a documented exception rather than an
 * oversight. The ban list in the design system rejects animating layout
 * properties, and `grid-template-rows: 0fr -> 1fr` is exactly that. It is used
 * here anyway for three reasons: a disclosure fundamentally has to change
 * size, the alternatives are worse (a fixed max-height guesses at the content
 * and eases wrongly, and JS-measured height forces a layout read on every
 * open), and the cost is bounded. This animates one subtree, only on an
 * explicit press, never on scroll or hover, so there is no per-frame layout
 * thrash on anything the user is reading. 220ms sits in the dropdown band.
 * `motion-reduce` collapses it to an instant open.
 *
 * Markup is a button plus a region rather than details/summary. The native
 * element is tempting for the free semantics, but it cannot be animated open
 * without fighting it, and the manual pattern matches how the rest of this
 * codebase handles accessibility.
 */
export default function Faq() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.8, ease }}
          className="text-4xl sm:text-5xl font-semibold tracking-tighter text-ink"
        >
          Before you ask
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim"
        >
          The things a hiring team usually has to email to find out.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.8, delay: 0.16, ease }}
          className="mt-14"
        >
          <ul>
            {faq.map((item) => {
              const isOpen = openId === item.id;

              return (
                <li
                  key={item.id}
                  className="shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${item.id}`}
                      id={`faq-trigger-${item.id}`}
                      className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-[280ms] ease-out-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-abyss"
                    >
                      <span
                        className={`text-base sm:text-lg font-medium tracking-tight transition-colors duration-[280ms] ease-out-strong ${
                          isOpen ? 'text-ink' : 'text-ink-dim'
                        }`}
                      >
                        {item.question}
                      </span>
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-ink-dim transition-transform duration-[280ms] ease-out-strong motion-reduce:transition-none ${
                          isOpen ? 'rotate-45' : ''
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    className={`grid transition-[grid-template-rows] duration-[220ms] ease-out-strong motion-reduce:transition-none ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`max-w-2xl pb-7 pr-10 text-sm sm:text-base leading-relaxed text-ink-dim transition-opacity duration-[220ms] ease-out-strong motion-reduce:transition-none ${
                          isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
