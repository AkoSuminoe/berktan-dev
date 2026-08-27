import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { caseStudies } from '@/lib/case-studies';

type IndexableRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

/*
 * Every indexable route. /tokyo is absent on purpose: it is noindex and
 * personal, see the note in robots.ts about why it is still crawlable.
 */
const STATIC_ROUTES: IndexableRoute[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/work', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Build time, which for a statically prerendered page is genuinely when the
  // content last changed.
  const lastModified = new Date();

  /* Derived from the case study list rather than written out, so adding a
     study can never leave its page missing from the sitemap. */
  const studyRoutes: IndexableRoute[] = caseStudies.map((study) => ({
    path: `/work/${study.slug}`,
    priority: 0.8,
    changeFrequency: 'monthly',
  }));

  return [...STATIC_ROUTES, ...studyRoutes].map((route) => ({
    url: new URL(route.path, SITE_URL).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
