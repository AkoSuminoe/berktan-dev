'use client';

import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Music } from 'lucide-react';
import { useNowPlaying } from '@/hooks/useNowPlaying';
import type { NowPlayingPayload, SpotifyTrack } from '@/lib/spotify';

const BAR_COUNT = 4;

/*
 * Spotify's brand green. This is the site's one sanctioned second accent and
 * it appears ONLY while a track is genuinely playing, where it carries
 * live-state meaning rather than decoration. The "last played" state is
 * neutral on purpose, same reasoning as /tokyo's route-scoped red-to-blue.
 */
const SPOTIFY_GREEN = '#1DB954';

/*
 * Floating glass media pill, fixed to the top-right corner on md+ screens.
 * Renders nothing until the Spotify env vars are configured server-side.
 */
export default function NowPlaying() {
  const data = useNowPlaying();
  const reduce = useReducedMotion();

  const show = data !== null && data.status !== 'unconfigured';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          /* Lands during the preloader veil's dissolve rather than after it,
             matching Hero.tsx's base delay of 1.85s. */
          transition={{ duration: 0.8, delay: 2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-6 top-6 z-40 hidden md:block"
        >
          <div className="material rounded-full p-1">
            <div className="flex items-center gap-3 rounded-full bg-surface/60 py-1.5 pl-1.5 pr-4">
              <PillBody data={data} reduce={Boolean(reduce)} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PillBody({
  data,
  reduce,
}: {
  data: NowPlayingPayload;
  reduce: boolean;
}) {
  switch (data.status) {
    case 'playing':
      return (
        <>
          <Artwork track={data.track} />
          <Meta track={data.track} />
          <Waveform animate={!reduce} color={SPOTIFY_GREEN} />
        </>
      );

    case 'recent':
      return (
        <>
          <Artwork track={data.track} dimmed />
          <Meta track={data.track} />
          <span className="shrink-0 text-[11px] font-medium text-ink-faint">
            Last played
          </span>
        </>
      );

    case 'idle':
      return (
        <>
          <FallbackArtwork />
          <span className="text-xs text-ink-dim">Not playing</span>
        </>
      );

    case 'unconfigured':
      return null;

    default: {
      // Exhaustiveness guard: a new status cannot be silently unhandled.
      const exhaustive: never = data;
      return exhaustive;
    }
  }
}

function Artwork({ track, dimmed }: { track: SpotifyTrack; dimmed?: boolean }) {
  if (!track.albumImageUrl) return <FallbackArtwork />;

  return (
    <Image
      src={track.albumImageUrl}
      alt={`${track.title} album cover`}
      width={32}
      height={32}
      className={`h-8 w-8 shrink-0 rounded-full object-cover ${
        dimmed ? 'opacity-60' : ''
      }`}
    />
  );
}

function FallbackArtwork() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
      <Music className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.5} />
    </span>
  );
}

function Meta({ track }: { track: SpotifyTrack }) {
  return (
    <span className="min-w-0 max-w-[11rem]">
      <span className="block truncate text-xs font-medium text-ink">
        {track.title}
      </span>
      <span className="block truncate text-[11px] text-ink-dim">
        {track.artist}
      </span>
    </span>
  );
}

function Waveform({ animate, color }: { animate: boolean; color: string }) {
  return (
    <span aria-hidden className="flex h-3.5 shrink-0 items-end gap-[2.5px]">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className="w-[2.5px] origin-bottom rounded-full"
          style={{
            height: '100%',
            background: color,
            // Non-harmonic durations so the four bars never resync
            transform: animate ? undefined : 'scaleY(0.35)',
            animation: animate
              ? `eq ${0.85 + i * 0.14}s ease-in-out ${i * 0.11}s infinite`
              : 'none',
          }}
        />
      ))}
    </span>
  );
}
