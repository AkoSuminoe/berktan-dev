/*
 * Formatting shared by the Tokyo planner tabs. Small enough to inline in one
 * component, not small enough to keep in step across three.
 */

export const yen = (value: number) =>
  `¥${Math.round(value).toLocaleString('en-GB')}`;

/*
 * The rate is a required argument, not a default.
 *
 * Which rate applies is a real decision at every call site: an old expense
 * converts at the rate it was entered at, remaining budget at today's, and a
 * shop-window sum at today's with the card's spread on top. A default would let
 * a component pick one up from the air, and it would sometimes pick the wrong
 * one silently. Making it explicit means the choice is visible in the diff.
 */
export const pounds = (jpy: number, rate: number) =>
  `£${(jpy / rate).toFixed(0)}`;

/** Two decimals, for figures small enough that pounds alone would round to zero. */
export const poundsExact = (jpy: number, rate: number) =>
  `£${(jpy / rate).toFixed(2)}`;

/** Already in pounds, so no conversion. Used for per-entry frozen totals. */
export const gbp = (value: number) => `£${value.toFixed(0)}`;

/**
 * Coordinates beat a text search when they exist: a name can land on the wrong
 * branch of a chain.
 */
export function mapsUrl(coords: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
}

/** For places the documents name and address but do not geocode. */
export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
