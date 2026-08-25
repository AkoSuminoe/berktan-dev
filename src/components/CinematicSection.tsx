'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/*
 * Scroll-linked cinematic wrapper: content eases into focus as it enters the
 * viewport and gently scales down and dims as it hands over to the next
 * section. Transform and opacity only, driven by motion values so scrolling
 * never triggers React re-renders.
 */
export default function CinematicSection({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  /*
   * Restraint over spectacle. The old range (scale 0.96 -> 0.93, opacity 0.25
   * -> 0.15) dimmed body copy that was still on screen and still being read;
   * a section that recedes should suggest depth, not withhold the content.
   * These values are roughly a third of the previous travel, and the plateau
   * where the section sits at full strength is wider.
   */
  const scale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.8, 1],
    [0.985, 1, 1, 0.972]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.82, 1],
    [0.45, 1, 1, 0.3]
  );
  const y = useTransform(scrollYProgress, [0, 0.22], [22, 0]);

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { scale, opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
