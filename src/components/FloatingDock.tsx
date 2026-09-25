'use client';

import { useCallback, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { Home, User, Briefcase, Code2, FolderGit2, Mail, CalendarRange } from 'lucide-react';
import MagneticDockItem, { type DockItem } from '@/components/MagneticDockItem';
import { useApexOrigin } from '@/hooks/useApexOrigin';

/* Hrefs are absolute (/#section) so navigation works from /tokyo too */
const dockItems: DockItem[] = [
  { href: '/#hero', icon: Home, label: 'Home' },
  { href: '/#about', icon: User, label: 'About' },
  { href: '/#experience', icon: Briefcase, label: 'Experience' },
  { href: '/#skills', icon: Code2, label: 'Stack' },
  { href: '/#projects', icon: FolderGit2, label: 'Work' },
  { href: '/#contact', icon: Mail, label: 'Contact' },
  { href: '/tokyo', emoji: '⛩️', label: 'Tokyo' },
  { href: '/semester', icon: CalendarRange, label: 'Semester' },
];

/*
 * Magnetic follow spring. damping / (2 * sqrt(stiffness)) = 45 / (2 * sqrt(500))
 * = 1.007, i.e. critically damped, response ~0.28s. No bounce on purpose: a
 * hover that overshoots reads as a gimmick, and bounce is only earned when the
 * user's own gesture carried momentum.
 */
const MAGNET_SPRING = { stiffness: 500, damping: 45 };

export default function FloatingDock() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const origin = useApexOrigin();
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listLeft = useRef(0);
  const centres = useRef<number[]>([]);

  // Pointer state lives entirely in motion values: no React state per frame.
  const pointerXRaw = useMotionValue(0);
  const influenceRaw = useMotionValue(0);
  const pointerX = useSpring(pointerXRaw, MAGNET_SPRING);
  const influence = useSpring(influenceRaw, MAGNET_SPRING);

  // Motion value drives visibility; setScrolled only fires on threshold crossings
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const next = latest > 300;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  // On subpages the dock is the only navigation, so it is always present
  const visible = pathname !== '/' || scrolled;

  const registerRef = useCallback(
    (index: number, el: HTMLAnchorElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  /*
   * One forced layout per hover session, before anything has moved.
   *
   * offsetLeft, not getBoundingClientRect: offsetLeft is layout space and is
   * unaffected by transforms, so a re-measure can never read a magnetised
   * position and feed that back into the pull. clientLeft keeps the two origins
   * aligned if the rail ever gains a border.
   *
   * Measuring on enter rather than on mount picks up font loading, resize and
   * zoom for free, with no listener and no ResizeObserver. Deriving centres
   * from the index would be free but would hard-code p-2.5 and gap-1 into
   * JavaScript, and would desync silently the day either changes.
   */
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return false;
    listLeft.current = list.getBoundingClientRect().left + list.clientLeft;
    centres.current = itemRefs.current.map((el) =>
      el ? el.offsetLeft + el.offsetWidth / 2 : Number.NaN
    );
    return true;
  }, []);

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Per-event check, not matchMedia: a touchscreen laptop matches
      // (hover: hover) yet still delivers touch events here.
      if (reduce || event.pointerType !== 'mouse') return;
      if (!measure()) return;
      const localX = event.clientX - listLeft.current;
      pointerXRaw.set(localX);
      // Snap the follower into place, then let `influence` fade the effect in.
      // Without this the spring would travel across the dock on every enter.
      pointerX.jump(localX);
      influenceRaw.set(1);
    },
    [reduce, measure, pointerX, pointerXRaw, influenceRaw]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduce || event.pointerType !== 'mouse') return;
      pointerXRaw.set(event.clientX - listLeft.current);
    },
    [reduce, pointerXRaw]
  );

  // Unconditional, so nothing can get stuck magnetised
  const handlePointerLeave = useCallback(() => {
    influenceRaw.set(0);
  }, [influenceRaw]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          /*
           * x lives in the variants, not in a Tailwind -translate-x-1/2.
           * Framer writes the whole inline transform string, so a Tailwind
           * translate on this element is silently dropped and the dock ends up
           * anchored at left:50% with no correction, starting from the middle
           * of the page instead of being centred on it.
           */
          initial={{ x: '-50%', y: 100, opacity: 0 }}
          animate={{ x: '-50%', y: 0, opacity: 1 }}
          exit={{ x: '-50%', y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-8 left-1/2 z-50"
        >
          <div
            ref={listRef}
            onPointerEnter={handlePointerEnter}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerLeave}
            /* `relative` makes the rail the offsetParent for the items, so
               their offsetLeft and the rail's rect share an origin. */
            className="material relative flex items-center gap-1 rounded-full p-1.5"
          >
            {dockItems.map((item, index) => (
              <MagneticDockItem
                key={item.href}
                item={item}
                origin={origin}
                index={index}
                pointerX={pointerX}
                influence={influence}
                centres={centres}
                hovered={hoveredIndex === index}
                onHoverChange={setHoveredIndex}
                registerRef={registerRef}
              />
            ))}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
