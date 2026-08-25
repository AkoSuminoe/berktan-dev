/**
 * Trust boundary for external URLs.
 *
 * React renders a `javascript:` URL into an href without erroring in
 * production, so anything arriving from a third-party API and heading for an
 * href, a src, or window.location is sanitised here, in the fetch layer, rather
 * than at the point of render. Used by the GitHub mapper and the Spotify route.
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
