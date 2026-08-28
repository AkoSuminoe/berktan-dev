'use client';

import { memo, type RefObject } from 'react';
import {
  motion,
  AnimatePresence,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type DockItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  emoji?: string;
};

/*
 * Apple-dock magnetism, sized down to "very slight".
 *
 * Item pitch is 42px (38px box plus gap-1), so RADIUS at 110px is about 2.6
 * pitches: the hovered icon and two neighbours each side respond, the outer
 * ones do not. Wider and the whole dock heaves as one block; narrower and only
 * the hovered item moves, which is just a hover state.
 *
 * Two falloff curves, both exactly zero at the radius so nothing switches on
 * or off at the boundary:
 *
 *   bell = 0.5 * (1 + cos(pi * t))   Even, 1 at the cursor. Zero slope at both
 *                                    ends and a flat top, so the scale does not
 *                                    twitch while the cursor rests on an icon.
 *                                    Drives lift and scale.
 *
 *   pull = PULL_PX * sin(pi * t)     Odd, so direction is automatic. Exactly 0
 *                                    at the centre (the icon under the cursor
 *                                    must not slide sideways) and its peak is
 *                                    exactly PULL_PX at half the radius, so the
 *                                    constant means what it says with no magic
 *                                    normalisation factor.
 *
 * SCALE_DELTA is 0.12 rather than the 1.025 used on the site's buttons because
 * this is an 18px glyph, not a 300px surface: 1.025 here would be 0.45px of
 * growth, i.e. invisible.
 *
 * The transform goes on the inner glyph, never on the <a>. Hit targets stay
 * put (a moving nav target is a Fitts's-law regression), icons cannot overlap,
 * and the parent's offsetLeft measurements stay valid because layout never
 * changes.
 */
const RADIUS = 110;
const PULL_PX = 4;
const SCALE_DELTA = 0.12;
const LIFT_PX = 3;

const clamp = (value: number, lo: number, hi: number) =>
  value < lo ? lo : value > hi ? hi : value;

type MagneticDockItemProps = {
  item: DockItem;
  /**
   * Prefixed onto the href. Empty on the main site; the apex origin on any
   * other hostname, where a bare "/#section" fragment would resolve against
   * that host instead. A memoized primitive, so it does not defeat memo().
   */
  origin: string;
  index: number;
  /** Cursor x in rail space, already smoothed by the parent's spring. */
  pointerX: MotionValue<number>;
  /** 0 when the pointer is away, 1 when it is over the dock. Springed. */
  influence: MotionValue<number>;
  /** Rest centres in rail space, refilled by the parent on pointerenter. */
  centres: RefObject<number[]>;
  hovered: boolean;
  onHoverChange: (index: number | null) => void;
  registerRef: (index: number, el: HTMLAnchorElement | null) => void;
};

const MagneticDockItem = memo(function MagneticDockItem({
  item,
  origin,
  index,
  pointerX,
  influence,
  centres,
  hovered,
  onHoverChange,
  registerRef,
}: MagneticDockItemProps) {
  /** Signed normalised distance from this item's centre, clamped to the radius. */
  const t = useTransform([pointerX, influence], ([x, inf]: number[]) => {
    if (inf === 0) return 1;
    const centre = centres.current?.[index];
    if (centre === undefined || Number.isNaN(centre)) return 1;
    return clamp((x - centre) / RADIUS, -1, 1);
  });

  const bell = useTransform(
    [t, influence],
    ([v, inf]: number[]) => 0.5 * (1 + Math.cos(Math.PI * v)) * inf
  );

  const x = useTransform(
    [t, influence],
    ([v, inf]: number[]) => PULL_PX * Math.sin(Math.PI * v) * inf
  );
  const y = useTransform(bell, (b) => -LIFT_PX * b);
  const scale = useTransform(bell, (b) => 1 + SCALE_DELTA * b);

  return (
    <a
      ref={(el) => registerRef(index, el)}
      href={`${origin}${item.href}`}
      /* pointerType, not onMouseEnter: a tap synthesises mouseenter, which is
         why the tooltip used to stick open on touch devices. */
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') onHoverChange(index);
      }}
      onPointerLeave={() => onHoverChange(null)}
      onPointerCancel={() => onHoverChange(null)}
      className="relative"
      aria-label={item.label}
    >
      {/*
       * No whileHover here. A gesture animation and a style-bound motion value
       * both writing `y` fight every frame. One source of truth, and the lift
       * is now graded by distance instead of binary, which is what a real dock
       * does.
       */}
      <motion.div
        style={{ x, y, scale }}
        className="rounded-full p-2.5 text-ink-faint transition-colors duration-200 hover:bg-white/[0.08] hover:text-ink"
      >
        {item.icon ? (
          <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        ) : (
          <span
            aria-hidden
            className="flex h-[18px] w-[18px] items-center justify-center text-[14px] leading-none grayscale-[0.4] transition-[filter] duration-200 hover:grayscale-0"
          >
            {item.emoji}
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {hovered && (
          <motion.span
            /* Tooltip: 160ms (Emil's 125-200ms band), scaling from its trigger
               rather than its own centre. x lives in the variant, not in a
               -translate-x-1/2 class, because Framer writes the whole inline
               transform and would drop a Tailwind translate on this element. */
            initial={{ opacity: 0, x: '-50%', y: 6, scale: 0.96 }}
            animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
            exit={{ opacity: 0, x: '-50%', y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="material absolute -top-10 left-1/2 origin-bottom whitespace-nowrap rounded-full px-3 py-1 text-xs text-ink"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
});

export default MagneticDockItem;
