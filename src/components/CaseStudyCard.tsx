import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import type { CaseStudy } from '@/lib/case-studies';

/*
 * Shared by the /work index and the home page, so the two can never drift
 * into describing the same study differently.
 *
 * Server component with no state. The whole card is one link rather than a
 * card with a link inside it: a recruiter skimming aims at the heading, not
 * at a small call to action in the corner.
 */
export default function CaseStudyCard({
  study,
  className,
}: {
  study: CaseStudy;
  className?: string;
}) {
  return (
    <Link
      href={`/work/${study.slug}`}
      className={`group/link block rounded-[2rem] ${className ?? ''}`}
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

          <h3 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            {study.name}
          </h3>
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
  );
}
