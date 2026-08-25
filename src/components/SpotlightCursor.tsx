'use client';

import { useEffect, useRef } from 'react';

/* Box width; the gradient's closest-side radius is therefore SIZE / 2 = 650px,
   matching the original `radial-gradient(650px circle at ...)`. */
const SIZE = 1300;

/*
 * A soft light that follows the cursor.
 *
 * The gradient is painted once into a fixed-size box and then moved with
 * translate3d. The previous implementation rewrote the whole `background`
 * shorthand on every mousemove, which repainted a viewport-sized element per
 * pointer event; this version is compositor-only. It matters because the dock
 * runs its magnetic hover off the same pointer stream, and a repaint storm
 * underneath it would make that effect read as janky.
 *
 * Writes are coalesced to one per animation frame, since mousemove can fire
 * more often than the display refreshes.
 */
export default function SpotlightCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let x = 0;
    let y = 0;
    let frame = 0;

    const flush = () => {
      frame = 0;
      el.style.transform = `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0)`;
    };

    const handleMouseMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      <div
        ref={ref}
        className="absolute left-0 top-0"
        style={{
          width: SIZE,
          height: SIZE,
          // Parked off-screen until the first pointer move.
          transform: `translate3d(-${SIZE}px, -${SIZE}px, 0)`,
          willChange: 'transform',
          background:
            'radial-gradient(circle closest-side, rgba(190, 215, 235, 0.03), transparent 40%)',
        }}
      />
    </div>
  );
}
