/*
 * Formatting shared by the Tokyo planner tabs. Small enough to inline in one
 * component, not small enough to keep in step across three.
 */

import { toGbp } from '@/lib/tokyo-personal';

export const yen = (value: number) =>
  `¥${Math.round(value).toLocaleString('en-GB')}`;

export const pounds = (value: number) => `£${toGbp(value).toFixed(0)}`;

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
