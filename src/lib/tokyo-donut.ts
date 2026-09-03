/*
 * Donut arc geometry.
 *
 * Pure, and in lib rather than in the component, so the maths can be checked
 * without a renderer around it. Same reasoning as tokyo-budget.ts: the parts
 * that can be wrong quietly should be readable on their own.
 *
 * Segments are drawn as circles with a dash pattern rather than as path arcs.
 * A dashed circle needs one number per segment and no large-arc-flag, no sweep
 * flag and no sin/cos, which is three fewer things to get wrong at 3% of a
 * circle. The trade is that the ring is one radius throughout, which is what a
 * donut is anyway.
 */

/** A hair of blank between segments, so two similar colours stay two. */
export const GAP_DEGREES = 1.5;

export const circumference = (radius: number) => 2 * Math.PI * radius;

export type Arc = {
  key: string;
  colour: string;
  /** `stroke-dasharray`: the drawn run, then the rest of the circle. */
  dash: string;
  /** `stroke-dashoffset`. Negative, because the pattern shifts forward. */
  offset: number;
  /** The full circumference, for offsetting an arc off the end to draw it in. */
  circumference: number;
};

/**
 * Lay fractions of one out around a circle.
 *
 * Fractions are taken as given rather than normalised here: the caller knows
 * whether it is dividing by a real total or by a planned one, and silently
 * rescaling would hide a total that had gone wrong.
 */
export function arcsFor(
  radius: number,
  segments: { key: string; fraction: number; colour: string }[]
): Arc[] {
  const c = circumference(radius);
  const gap = (GAP_DEGREES / 360) * c;
  let travelled = 0;

  return segments.map((segment) => {
    /* Clamped, so a segment smaller than the gap renders as nothing rather
       than as a negative dash. Its value is still in the legend. */
    const drawn = Math.max(segment.fraction * c - gap, 0);
    const arc: Arc = {
      key: segment.key,
      colour: segment.colour,
      dash: `${drawn} ${c - drawn}`,
      offset: -travelled,
      circumference: c,
    };
    travelled += segment.fraction * c;
    return arc;
  });
}
