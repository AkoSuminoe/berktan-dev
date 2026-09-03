'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import { Mail } from 'lucide-react';
import { useApexOrigin } from '@/hooks/useApexOrigin';

/*
 * Mobile-only contact action.
 *
 * Position is dictated by the FloatingDock, which sits at `bottom-8 left-1/2`
 * and whose seven items span roughly 300px, most of a 390px viewport. Anything
 * at bottom-8 on the right would land on top of it, so this sits a row above
 * at bottom-24, and below the dock in z order as a second line of defence.
 *
 * Visibility follows the dock exactly: after 300px of scroll on the home page,
 * immediately on every other route, so the two chrome elements always arrive
 * together rather than one appearing to lag.
 *
 * It hides once the contact section is reached and stays hidden past it. A
 * button saying "get in touch" while the form is on screen is noise, and
 * without the second condition it would reappear over the footer.
 */
export default function MobileContactFab() {
  const [scrolled, setScrolled] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const origin = useApexOrigin();

  // Motion value drives it; setState only fires on threshold crossings.
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const next = latest > 300;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    const target = document.getElementById('contact');
    if (!target) {
      // No contact section on this route, so nothing can suppress the button.
      setAtContact(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        /*
         * isIntersecting alone only covers "contact is on screen". Once the
         * user scrolls past it to the footer the section stops intersecting
         * and the button would come back, landing on the footer links. A
         * negative top means it is above the viewport, i.e. already passed.
         */
        const reached =
          entry.isIntersecting || entry.boundingClientRect.top < 0;
        setAtContact((prev) => (prev === reached ? prev : reached));
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  const visible = (pathname !== '/' || scrolled) && !atContact;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
          /* Same spring as the FloatingDock entrance, so the two read as one
             system rather than as two separate widgets. */
          transition={
            reduce
              ? { duration: 0.24, ease: [0.23, 1, 0.32, 1] }
              : { type: 'spring', stiffness: 260, damping: 24 }
          }
          className="fixed bottom-24 right-4 z-20 sm:hidden"
        >
          <Link
            href={`${origin}/#contact`}
            className="material flex items-center gap-2.5 rounded-full py-3 pl-5 pr-5 text-sm font-medium text-ink transition-transform duration-[280ms] ease-out-strong active:scale-[0.96] active:duration-[120ms]"
          >
            <Mail className="h-4 w-4 text-glow" strokeWidth={1.5} />
            Get in touch
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
