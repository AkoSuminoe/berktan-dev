import { NextResponse } from 'next/server';
import {
  toTrack,
  type NowPlayingPayload,
  type SpotifyApiTrack,
} from '@/lib/spotify';

export const dynamic = 'force-dynamic';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT =
  'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT =
  'https://api.spotify.com/v1/me/player/recently-played?limit=1';

/*
 * Every failure path returns HTTP 200 with a degraded status. The widget is
 * decorative chrome; a Spotify outage or a missing scope must never surface as
 * an error to the visitor. The access token never leaves this handler.
 */
const reply = (payload: NowPlayingPayload) =>
  NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string | null> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return reply({ status: 'unconfigured' });
  }

  try {
    const accessToken = await getAccessToken(
      clientId,
      clientSecret,
      refreshToken
    );
    if (!accessToken) return reply({ status: 'idle' });

    const headers = { Authorization: `Bearer ${accessToken}` };

    // 1. Something playing right now?
    const current = await fetch(NOW_PLAYING_ENDPOINT, {
      headers,
      cache: 'no-store',
    });

    // 204 means the player is closed; anything non-OK falls through the same way
    if (current.ok && current.status !== 204) {
      const data = (await current.json()) as {
        is_playing?: boolean;
        item?: SpotifyApiTrack | null;
      };

      if (data.item) {
        /*
         * An item is present whether or not it is playing. When it is paused,
         * THIS is the last played track, and it is the only source that knows
         * it: /me/player/recently-played deliberately excludes whatever is
         * currently loaded in the player, and only records a track once it has
         * actually finished. Falling through to that endpoint on pause is what
         * made the widget stick on one old song and never update no matter how
         * many times you skipped.
         */
        return data.is_playing
          ? reply({ status: 'playing', track: toTrack(data.item) })
          : reply({
              status: 'recent',
              track: toTrack(data.item),
              playedAt: null,
            });
      }
    }

    /*
     * 2. The player is closed entirely, so ask what was played last.
     *
     * This needs the `user-read-recently-played` scope. A refresh token minted
     * with only `user-read-currently-playing` gets a 403 here, which is
     * expected, not an error: it degrades to idle until the token is re-issued
     * with both scopes.
     */
    const recent = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers,
      cache: 'no-store',
    });

    if (recent.ok) {
      const data = (await recent.json()) as {
        items?: { track?: SpotifyApiTrack | null; played_at?: string }[];
      };
      const entry = data.items?.[0];
      if (entry?.track) {
        return reply({
          status: 'recent',
          track: toTrack(entry.track),
          playedAt: entry.played_at ?? null,
        });
      }
    }

    return reply({ status: 'idle' });
  } catch {
    return reply({ status: 'idle' });
  }
}
