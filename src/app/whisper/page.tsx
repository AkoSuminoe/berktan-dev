import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { buildBreadcrumbGraph, type JsonLdGraph } from '@/lib/jsonld';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import SubtitleDemo from '@/components/whisper/SubtitleDemo';
import { WHISPER_URL } from '@/lib/whisper';
import CinematicSection from '@/components/CinematicSection';
import Footer from '@/components/Footer';

/*
 * The canonical is the subdomain, not this path. Middleware serves this same
 * page on whisper.berktan.dev and 308s berktan.dev/whisper across to it, so
 * exactly one URL is ever presented to a crawler.
 */
export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Subtitle generator',
    description:
      'Live demo: drop in a video or audio file and get a cleaned SRT back, transcribed with Whisper large-v3 on a self-hosted GPU.',
    path: '/whisper',
    keywords: [
      'Whisper subtitle generator',
      'automatic SRT generator',
      'speech to text demo',
      siteConfig.fullName,
    ],
  }),
  alternates: { canonical: WHISPER_URL },
};

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Work', path: '/work' },
  { name: 'Subtitle generator', path: '/whisper' },
];

const APP_GRAPH: JsonLdGraph = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${WHISPER_URL}/#app`,
  name: 'Whisper Subtitle Generator',
  url: WHISPER_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  description:
    'Transcribes video and audio into cleaned SRT subtitles using Whisper large-v3, running on a self-hosted GPU.',
  author: {
    '@type': 'Person',
    '@id': 'https://berktan.dev/#person',
    name: siteConfig.fullName,
  },
  offers: {
    '@type': 'Offer',
    price: 0,
    priceCurrency: 'GBP',
  },
};

export default function WhisperPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbGraph(CRUMBS)} />
      <JsonLd data={APP_GRAPH} />

      <section className="relative overflow-hidden pt-28 sm:pt-36">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(46rem 30rem at 24% 28%, rgba(130,143,255,0.10) 0%, rgba(130,143,255,0.06) 26%, rgba(130,143,255,0.024) 48%, rgba(130,143,255,0.006) 70%, transparent 86%)',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <Breadcrumbs
            /* Absolute, because this page is served from another hostname
               where "/" is the demo itself rather than the site root. */
            items={[
              { label: 'Home', href: 'https://berktan.dev' },
              { label: 'Work', href: 'https://berktan.dev/work' },
              { label: 'Subtitle generator' },
            ]}
          />

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Live demo
          </p>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.03] text-ink">
            Subtitle generator
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-dim">
            Drop in a video or an audio file and get a cleaned SRT back.
            Transcription runs on Whisper large-v3 on a GPU in my flat in
            London, which is also the honest reason for the limits below.
          </p>
        </div>
      </section>

      <CinematicSection>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
          <SubtitleDemo />

          <div className="mt-16 space-y-5 text-sm leading-relaxed text-ink-dim">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
              How it works
            </h2>
            <p>
              The file is uploaded to a FastAPI service, queued, and
              transcribed with Whisper. The raw output is then cleaned up:
              cues are merged and split so they read at a sensible pace, and a
              terms file corrects the proper nouns Whisper reliably gets wrong.
            </p>
            <p>
              Nothing is kept. Uploads and generated subtitles are deleted once
              the job expires, and the file never leaves the machine it was
              transcribed on.
            </p>
            <p>
              The queue, the per-visitor limits and the daily ceiling exist
              because this is one GPU on a domestic connection rather than a
              cluster. If it is busy, you will be told your position rather
              than left watching a spinner.
            </p>
          </div>
        </div>
      </CinematicSection>

      {/* Served from whisper.berktan.dev, where a bare "/#contact" would
          resolve against this hostname rather than the main site. */}
      <Footer origin="https://berktan.dev" />
    </>
  );
}
