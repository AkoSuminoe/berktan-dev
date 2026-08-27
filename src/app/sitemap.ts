import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

type IndexableRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

/*
 * Every indexable route, in one list. /tokyo is absent on purpose: it is
 * noindex and personal, see the note in robots.ts about why it is still
 * crawlable. /work, /work/[slug] and /privacy join this list in the commits
 * that create them, so the sitemap can never advertise a URL that 404s.
 */
const ROUTES: IndexableRoute[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Build time, which for a statically exported page is genuinely when the
  // content last changed.
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: new URL(route.path, SITE_URL).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
