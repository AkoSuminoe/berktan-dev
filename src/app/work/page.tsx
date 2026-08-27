import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { caseStudies } from '@/lib/case-studies';
import { buildBreadcrumbGraph } from '@/lib/jsonld';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import GlassCard from '@/components/GlassCard';
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
                  <Link
                    href={`/work/${study.slug}`}
                    className="group/link block rounded-[2rem]"
                  >
                    <GlassCard className="h-full">
                      <article className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                            Case study
                          </p>
                          <span className="shrink-0 font-mono text-xs text-ink-faint">
                            {study.period}
                          </span>
                        </div>

                        <h2 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                          {study.name}
                        </h2>
                        <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-ink-dim">
                          {study.tagline}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5">
                          {study.stack.slice(0, 4).map((item) => (
                            <span key={item} className="text-xs text-ink-faint">
                              {item}
                            </span>
                          ))}
                        </div>

                        <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-glow">
                          Read the case study
                          <ArrowUpRight
                            className="h-3.5 w-3.5 transition-transform duration-[280ms] ease-out-strong group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                            strokeWidth={1.5}
                          />
                        </span>
                      </article>
                    </GlassCard>
                  </Link>
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
