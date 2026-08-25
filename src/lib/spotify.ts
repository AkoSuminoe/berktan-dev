import { safeHttpUrl } from '@/lib/url';

/*
 * Shared contract between the /api/spotify route handler and the client
 * widget. It lives here rather than in the route file because a client
 * component importing from a route handler only stays safe while the import is
 * type-only; the moment anyone adds a value import, server code and Buffer land
 * in the client bundle.
 */

export type SpotifyTrack = {
  title: string;
  artist: string;
  albumImageUrl: string | null;
};

/*
 * A discriminated union rather than the previous `configured` / `isPlaying`
 * boolean pair. Those two booleans allowed states that cannot exist, notably a
 * non-null album image alongside a null title, which rendered the literal alt
 * text "null album cover". Here a track is either present and complete, or the
 * status says there isn't one.
 */
export type NowPlayingPayload =
  | { status: 'unconfigured' }
  | { status: 'idle' }
  | { status: 'playing'; track: SpotifyTrack }
  | { status: 'recent'; track: SpotifyTrack; playedAt: string | null };

/** The subset of Spotify's track object this app reads. */
export type SpotifyApiTrack = {
  name?: string;
  artists?: { name?: string }[];
  album?: { images?: { url?: string; width?: number }[] };
};

export function toTrack(item: SpotifyApiTrack): SpotifyTrack {
  const images = item.album?.images ?? [];

  // The widget renders at 32px, so take the smallest image by declared width
  // rather than trusting Spotify's array ordering.
  const smallest = images.reduce<{ url?: string; width?: number } | null>(
    (best, image) => {
      if (!image?.url) return best;
      if (!best) return image;
      return (image.width ?? Infinity) < (best.width ?? Infinity)
        ? image
        : best;
    },
    null
  );

  const artist = (item.artists ?? [])
    .map((entry) => entry.name)
    .filter((name): name is string => Boolean(name))
    .join(', ');

  return {
    title: item.name?.trim() || 'Unknown track',
    artist: artist || 'Unknown artist',
    albumImageUrl: safeHttpUrl(smallest?.url),
  };
}
