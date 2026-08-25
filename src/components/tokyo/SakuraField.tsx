import type { CSSProperties } from 'react';

/*
 * Sakura ambience for /tokyo. Server Component, zero client JS: two blurred
 * blooms and a field of falling petals, all driven by CSS keyframes in
 * globals.css so the whole thing runs on the compositor and never touches the
 * main thread. Same argument as the preloader veil.
 *
 * Not a new accent. AI_MEMORY allows one chromatic accent plus the route-scoped
 * #ff3b30 -> #57c1ff pair confined to /tokyo, so the petal is the torii red
 * lifted toward white and the two blooms are the two ends of that same
 * progress-bar gradient at ambient strength. A generic sakura pink would have
 * been a third hue family.
 *
 * No Math.random(): /tokyo is statically prerendered, so a random draw would be
 * frozen at build time anyway, and a deterministic sequence keeps the payload
 * byte-identical between builds.
 */

const PETAL_COUNT = 16;

/*
 * Additive recurrence on the golden ratio: a low-discrepancy sequence, so
 * values spread evenly instead of clumping the way an unconstrained random
 * draw does. Different seeds give uncorrelated channels.
 */
const PHI = 0.618033988749895;
const seq = (i: number, seed: number) => (i * PHI + seed) % 1;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const n = (value: number) => value.toFixed(2);

const petals: CSSProperties[] = Array.from({ length: PETAL_COUNT }, (_, i) => {
  // One petal per 1/N column, jittered inside its own slot, so the field never
  // leaves a bare stripe or a clump.
  const x = ((i + seq(i, 0.37)) / PETAL_COUNT) * 100;

  /*
   * A single depth channel drives size, speed and brightness together. That
   * coupling is the parallax: near petals are bigger, faster and brighter.
   * Three independent randoms would put a small fast bright petal next to a
   * large slow dim one and the field would read as flat noise.
   *
   * Depth of field lives here rather than in a filter: blur() on an animating
   * node is a per-frame paint, and sixteen of them would sink the feature.
   */
  const depth = seq(i, 0.11);
  const dur = lerp(26, 15.5, depth);
  const width = lerp(6.5, 11.5, depth);
  const opacity = lerp(0.3, 0.58, depth);

  // Flutter gets its own period, 3 to 7 cycles per fall, so no two petals ever
  // trace the same path. Sway and spin share it on purpose: a falling petal
  // tilts because it swings, that is one motion and not two.
  const flutter = lerp(3.4, 6.2, seq(i, 0.63));
  const drift = lerp(12, 40, seq(i, 0.29)) * (i % 2 ? 1 : -1);

  const rotA = lerp(-46, -8, seq(i, 0.81));
  const rotB = rotA + lerp(34, 76, seq(i, 0.05));

  // Negative delay: the field is already in steady state on the first frame,
  // rather than releasing sixteen petals from the ceiling at once.
  const delay = -seq(i, 0.47) * dur;

  return {
    '--x': `${n(x)}%`,
    '--w': `${n(width)}px`,
    '--o': n(opacity),
    '--dur': `${n(dur)}s`,
    '--delay': `${n(delay)}s`,
    '--flutter': `${n(flutter)}s`,
    '--drift': `${n(drift)}px`,
    '--rot-a': `${n(rotA)}deg`,
    '--rot-b': `${n(rotB)}deg`,
  } as CSSProperties;
});

export default function SakuraField() {
  return (
    /*
     * -z-10 is load-bearing on <main className="relative z-10"> in the root
     * layout. main forms a stacking context, so a negative z-index child paints
     * above main's background and below all of main's content, while main as a
     * whole still sits above the root ambient field at z-0. If main ever loses
     * that z-10 it stops forming a stacking context, this layer escapes to the
     * root, and the petals vanish behind .ambient. Do not remove that class.
     */
    <div aria-hidden className="sakura -z-10">
      <div className="sakura-bloom sakura-bloom-warm" />
      <div className="sakura-bloom sakura-bloom-cool" />
      <div className="sakura-petals">
        {petals.map((style, i) => (
          <span key={`petal-${i}`} className="petal" style={style}>
            <span className="petal-shape" />
          </span>
        ))}
      </div>
    </div>
  );
}
