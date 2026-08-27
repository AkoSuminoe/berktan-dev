import { siteConfig, skills, isProfileLink } from '@/lib/site-config';
import type { CaseStudy } from '@/lib/case-studies';
import { faq } from '@/lib/faq';
import { SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '@/lib/seo';

type JsonPrimitive = string | number | boolean | null;
type JsonLdValue = JsonPrimitive | JsonLdValue[] | { [key: string]: JsonLdValue };

export type JsonLdGraph = {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: JsonLdValue;
};

/*
 * ---------------------------------------------------------------------------
 * The one sanctioned dangerouslySetInnerHTML in this codebase
 * ---------------------------------------------------------------------------
 * AI_MEMORY.md section 5 bans dangerouslySetInnerHTML outright, and that ban
 * still holds everywhere else. JSON-LD is the single exception, because there
 * is no alternative: React HTML-escapes text children, so
 * `<script>{JSON.stringify(x)}</script>` ships `&quot;` where the parser needs
 * `"` and the block silently fails to validate.
 *
 * What keeps this safe is the input, not the escaping. `JsonLdGraph` is only
 * ever built by the functions in this file out of `site-config.ts`, which is
 * code Berktan writes. Nothing from the GitHub API, the Spotify API, browser
 * storage, a URL or a form field may reach it. If a future feature needs
 * user or API data in structured data, that is a new trust boundary and it
 * needs sanitising in the fetch layer first, exactly like `safeHttpUrl()`.
 *
 * The escaping below is defence in depth. `</script>` inside a JSON string is
 * the classic break-out, and U+2028 / U+2029 are valid in JSON but terminate a
 * line in a script context. All four become JSON unicode escapes, which the
 * JSON parser reads back as the original characters.
 */
export function jsonLdScript(data: JsonLdGraph): string {
  return JSON.stringify(data)
    .replace(/</g, '\u003c')
    .replace(/>/g, '\u003e')
    .replace(/&/g, '\u0026')
    .replace(/\u2028/g, '\u2028')
    .replace(/\u2029/g, '\u2029');
}

/*
 * ProfilePage wrapping a Person is Google's documented shape for a personal
 * site, and it is what replaces the LocalBusiness pattern a portfolio is often
 * wrongly given: Berktan is a person looking for a job, not a shop with an
 * address and opening hours.
 *
 * Deliberately absent:
 * - `image`: Person.image should be a photograph of him and there is not one
 *   in the repo yet. The social card is not a headshot. Added with the
 *   portrait, not before.
 * - `alumniOf`: he is a current student, not an alumnus. `affiliation` is the
 *   truthful property until he graduates in 2027.
 * - `Review` / `AggregateRating`: self-issued ratings on your own page are
 *   exactly what Google's spam policy targets.
 * - `worksFor`: the freelance entry in site-config is still unverified, see
 *   AI_MEMORY.md section 3.
 */
export function buildProfilePageGraph(): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/#profilepage`,
    url: SITE_URL,
    name: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en-GB',
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: siteConfig.fullName,
      givenName: 'Berktan',
      familyName: 'Solmaz',
      url: SITE_URL,
      jobTitle: siteConfig.title,
      description: siteConfig.bio,
      email: `mailto:${siteConfig.email}`,
      knowsAbout: skills.flat(),
      knowsLanguage: ['en', 'tr'],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'London',
        addressCountry: 'GB',
      },
      homeLocation: {
        '@type': 'Place',
        name: siteConfig.location,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: siteConfig.coordinates.latitude,
          longitude: siteConfig.coordinates.longitude,
        },
      },
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'University of Westminster',
        sameAs: 'https://www.westminster.ac.uk/',
      },
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Software Engineer',
        occupationLocation: {
          '@type': 'City',
          name: 'London',
        },
      },
      seeks: {
        '@type': 'Demand',
        name: `Graduate software engineer and junior full stack developer roles in London from ${siteConfig.graduationYear}`,
      },
      // Profile links only. The mailto: entry is already carried by `email`,
      // and sameAs is defined as "a URL to a reference page for the entity".
      sameAs: siteConfig.socialLinks
        .filter((link) => isProfileLink(link.href))
        .map((link) => link.href),
    },
  };
}

/*
 * BreadcrumbList. Built from the same array that renders the visible trail on
 * the page, so the markup and the structured data can never claim different
 * paths, which is the usual way this gets flagged in Search Console.
 */
export function buildBreadcrumbGraph(
  items: { name: string; path: string }[]
): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).toString(),
    })),
  };
}

/*
 * CreativeWork for a case study, with `author` pointing at the Person node the
 * home page defines rather than repeating it. The shared @id is what ties the
 * two pages into one entity for a crawler.
 */
export function buildCaseStudyGraph(study: CaseStudy): JsonLdGraph {
  const url = `${SITE_URL}/work/${study.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${url}#work`,
    url,
    name: study.name,
    headline: study.name,
    description: study.description,
    inLanguage: 'en-GB',
    temporalCoverage: study.period,
    about: study.stack,
    keywords: study.stack.join(', '),
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: siteConfig.fullName,
    },
  };
}

/*
 * FAQPage. A genuine win rather than schema for its own sake: recruiter
 * questions are exactly the long-tail phrasing people type into a search box,
 * and this is the markup that lets an answer surface directly.
 *
 * The source is the same array the accordion renders, so a question can never
 * be marked up with an answer the page does not show, which is the specific
 * thing the structured data guidelines prohibit.
 */
export function buildFaqGraph(): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
