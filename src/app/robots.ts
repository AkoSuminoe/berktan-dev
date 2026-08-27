import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/*
 * /tokyo is deliberately NOT disallowed here even though it must stay out of
 * the index. Disallow blocks crawling, and a crawler that never fetches the
 * page never sees the `noindex` it carries in its metadata, which means an
 * inbound link can still put a bare URL in the results with no way to remove
 * it. Allowing the crawl is what lets the noindex actually work. The route is
 * simply left out of the sitemap.
 *
 * /api/ is disallowed because it serves JSON that has nothing to rank and no
 * noindex header of its own.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
