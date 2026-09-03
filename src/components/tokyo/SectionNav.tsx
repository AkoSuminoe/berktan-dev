'use client';

import { useReducedMotion } from 'framer-motion';

/*
 * Jump links for a tab that is still several cards deep after the money block
 * moved out of it.
 *
 * Deliberately not a second row of tabs. These sections belong together and
 * reading straight down them is the normal way through; this only exists so
 * "where is the shopping list" is one tap instead of four flicks. Nothing is
 * hidden, so there is no state to get out of step with the content.
 */
export default function SectionNav({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label="Jump to a section"
      className="no-scrollbar -mx-4 mb-1 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => {
            document.getElementById(section.id)?.scrollIntoView({
              behavior: reduce ? 'auto' : 'smooth',
              block: 'start',
            });
          }}
          className="shrink-0 rounded-full bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-ink-faint shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-[color,transform] duration-200 ease-out-strong hover:text-ink-dim active:scale-[0.97] active:duration-100 motion-reduce:transform-none"
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
