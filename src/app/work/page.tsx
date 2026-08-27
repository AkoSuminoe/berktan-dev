import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { caseStudies } from '@/lib/case-studies';
import { buildBreadcrumbGraph } from '@/lib/jsonld';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import CaseStudyCard from '@/components/CaseStudyCard';
import CinematicSection from '@/components/CinematicSection';
import Footer from '@/components/Footer';

export const metadata: Metadata = buildMetadata({
  title: 'Work',
  description:
    'Case studies from Berktan Solmaz, a graduate software engineer in London: a defence technology placement, this site, and a Python automation CLI.',
  path: '/work',
  imagePath: '/og/work.png',
});

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Work', path: '/work' },
];

export default function WorkIndex() {
  return (
    <>
      <JsonLd data={buildBreadcrumbGraph(CRUMBS)} />

      <section className="pt-28 sm:pt-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: 'Work' }]}
          />

          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.02] text-ink">
            Selected work.
          </h1>
          <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-ink-dim">
            Three pieces of work with enough behind them to be worth reading
            about: what the problem actually was, what I did, and what changed.
          </p>
        </div>
      </section>

      <CinematicSection>
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {caseStudies.map((study, index) => (
                <li
                  key={study.slug}
                  /* Leading study spans the row: it is the strongest one and
                     the asymmetry matches the rhythm of the projects grid. */
                  className={index === 0 ? 'lg:col-span-2' : ''}
                >
                  <CaseStudyCard study={study} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </CinematicSection>

      <Footer />
    </>
  );
}
