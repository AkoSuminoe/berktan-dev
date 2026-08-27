import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

/*
 * One source of truth for everything the site says about itself to a crawler.
 *
 * metadataBase, canonicals, robots.txt, sitemap.xml and the JSON-LD graph all
 * read SITE_URL from here rather than hardcoding the origin, so they can never
 * drift apart. That matters more than usual on this deployment: the site is
 * self-hosted behind a Cloudflare Tunnel, so the origin never sees the public
 * hostname on the request and cannot infer it.
 */
export const SITE_URL = siteConfig.url;

/*
 * Target queries, in priority order. Berktan graduates in summer 2027, so
 * "graduate" is a claim the rest of the site can back up; see AI_MEMORY.md.
 * `keywords` carries little weight with Google and some with Bing. It is here
 * because it is nearly free, not because it is load bearing.
 */
export const SITE_KEYWORDS = [
  'Graduate Software Engineer London',
  'Junior Full Stack Developer London',
  'Graduate Software Developer London',
  'Junior React Developer London',
  'Next.js Developer London',
  'University of Westminster Software Engineering',
  siteConfig.fullName,
];

/** 51 characters, so it survives a SERP snippet without truncation. */
export const DEFAULT_TITLE = `${siteConfig.fullName} | Graduate Software Engineer, London`;

/** 174 characters. Google truncates around 160, so the tail is expendable. */
export const DEFAULT_DESCRIPTION =
  'Graduate software engineer and junior full stack developer in London. Final year BEng at the University of Westminster, graduating 2027. React, Next.js, TypeScript and Python.';

type PageMetadata = {
  /**
   * Segment title. The root layout's template appends " | Berktan Solmaz",
   * so pass the short form here ("Volinor", not "Volinor | Berktan Solmaz").
   */
  title?: string;
  /** Skip the template and use `title` verbatim. */
  absoluteTitle?: boolean;
  description?: string;
  /** Root relative, e.g. "/work/volinor". Becomes the canonical URL. */
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogType?: 'website' | 'article' | 'profile';
  /**
   * Root-relative path to a pre-rendered social card, e.g.
   * "/og/volinor.png". Omit to inherit the card from the nearest parent
   * segment: Next's opengraph-image file convention cascades, so every route
   * already falls back to the one at the app root.
   */
  imagePath?: string;
};

/*
 * Only sets openGraph.images when `imagePath` is given. Next's
 * opengraph-image file convention injects and cascades the app-root card on
 * its own, and an unconditional `images` here would override that everywhere.
 */
export function buildMetadata({
  title,
  absoluteTitle = false,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  keywords = SITE_KEYWORDS,
  noIndex = false,
  ogType = 'website',
  imagePath,
}: PageMetadata = {}): Metadata {
  const fullTitle = title
    ? absoluteTitle
      ? title
      : `${title} | ${siteConfig.fullName}`
    : DEFAULT_TITLE;

  return {
    title: title
      ? absoluteTitle
        ? { absolute: title }
        : title
      : { absolute: DEFAULT_TITLE },
    description,
    keywords,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            // Large thumbnails and untruncated snippets in the SERP.
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: siteConfig.fullName,
      locale: 'en_GB',
      type: ogType,
      ...(imagePath
        ? {
            images: [
              { url: imagePath, width: 1200, height: 630, alt: fullTitle },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(imagePath ? { images: [imagePath] } : {}),
    },
  };
}
