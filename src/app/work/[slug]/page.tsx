import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { caseStudies, getCaseStudy } from '@/lib/case-studies';
import { buildBreadcrumbGraph, buildCaseStudyGraph } from '@/lib/jsonld';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import CinematicSection from '@/components/CinematicSection';
import Footer from '@/components/Footer';

/* Every study is known at build time, so all three prerender. */
export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

/*
 * Anything outside generateStaticParams 404s immediately instead of being
 * rendered on demand and then discarded. On a laptop origin that is the
 * difference between a cheap 404 and a render per bad URL a crawler tries.
 */
export const dynamicParams = false;

type PageProps = {
  // Next 15: params is a promise and has to be awaited.
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};

  return buildMetadata({
    title: `${study.shortName} case study`,
    description: study.description,
    path: `/work/${study.slug}`,
    keywords: [...study.stack, `${study.name} case study`],
    ogType: 'article',
    imagePath: `/og/${study.slug}.png`,
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Work', path: '/work' },
    { name: study.shortName, path: `/work/${study.slug}` },
  ];

  const sections = [
    { heading: 'Context', body: study.context },
    { heading: 'What I did', body: study.approach },
    { heading: 'What changed', body: study.impact },
  ].filter((section): section is { heading: string; body: string[] } =>
    Boolean(section.body?.length)
  );

  return (
    <>
      <JsonLd data={buildBreadcrumbGraph(crumbs)} />
      <JsonLd data={buildCaseStudyGraph(study)} />

      <article>
        <header className="relative overflow-hidden pt-28 sm:pt-36">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(46rem 30rem at 24% 30%, rgba(130,143,255,0.10) 0%, rgba(130,143,255,0.06) 26%, rgba(130,143,255,0.024) 48%, rgba(130,143,255,0.006) 70%, transparent 86%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Work', href: '/work' },
                { label: study.shortName },
              ]}
            />

            <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
              Case study
            </p>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.03] text-ink">
              {study.name}
            </h1>

            <p className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-ink-dim">
              {study.tagline}
            </p>

            <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-ink-faint">
                  Role
                </dt>
                <dd className="mt-2 text-sm text-ink">{study.role}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-ink-faint">
                  Period
                </dt>
                <dd className="mt-2 font-mono text-sm text-ink">
                  {study.period}
                </dd>
              </div>
              {study.location && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-ink-faint">
                    Location
                  </dt>
                  <dd className="mt-2 text-sm text-ink">{study.location}</dd>
                </div>
              )}
            </dl>
          </div>
        </header>

        <CinematicSection>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
            <div className="space-y-16 sm:space-y-20">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                    {section.heading}
                  </h2>
                  <div className="mt-6 max-w-2xl space-y-5">
                    {section.body.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-base sm:text-lg leading-relaxed text-ink-dim"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}

              <section>
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                  Built with
                </h2>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {study.stack.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-white/[0.045] px-3.5 py-1.5 text-xs text-ink-dim shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {study.links.length > 0 && (
                <section>
                  <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                    Links
                  </h2>
                  <div className="mt-6 space-y-4">
                    {study.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-max items-center gap-2 text-sm font-medium text-glow transition-colors duration-[280ms] ease-out-strong hover:text-ink"
                      >
                        {link.label}
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          strokeWidth={1.5}
                        />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* The page ends pointing somewhere, never at a dead stop. */}
            <div className="mt-20 flex flex-wrap items-center gap-4 pt-12 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <Link
                href="/#contact"
                className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms]"
              >
                Get in touch
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </Link>
              <Link
                href="/work"
                className="group inline-flex items-center gap-3 rounded-full bg-white/[0.045] py-2 pl-6 pr-2 text-sm font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-[transform,box-shadow] duration-[280ms] ease-out-strong hover:scale-[1.025] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(255,255,255,0.1)] active:scale-[0.975] active:duration-[120ms]"
              >
                All work
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] transition-transform duration-[280ms] ease-out-strong group-hover:translate-x-px group-hover:scale-105">
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </Link>
            </div>
          </div>
        </CinematicSection>
      </article>

      <Footer />
    </>
  );
}
