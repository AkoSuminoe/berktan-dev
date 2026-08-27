import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getGitHubRepos, type GitHubRepo } from '@/lib/github';
import { siteConfig } from '@/lib/site-config';
import { caseStudies, caseStudyRepos } from '@/lib/case-studies';
import CaseStudyCard from './CaseStudyCard';
import ProjectsGrid from './ProjectsGrid';

/*
 * Two tiers, and the order is the point. Curated case studies first, because
 * they are the ones with a problem, an approach and an outcome attached and
 * they are what a recruiter should read. The live GitHub feed sits underneath
 * as evidence rather than as the headline.
 *
 * The case study cards stay in this server component instead of moving into
 * ProjectsGrid, which is a client component for its sort state. Keeping them
 * here means their markup never reaches the client bundle.
 */
export default async function Projects() {
  const username = process.env.GITHUB_USERNAME || siteConfig.githubUsername;
  let repos: GitHubRepo[] = [];
  let error: string | null = null;

  try {
    repos = await getGitHubRepos(username);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load projects.';
  }

  /* A repo that already has a full case study should not also appear as a
     card in the feed below it saying less. */
  const feedRepos = repos.filter((repo) => !caseStudyRepos.includes(repo.name));

  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-ink">
            Selected work
          </h2>
          <Link
            href="/work"
            className="group inline-flex w-max items-center gap-2 text-sm font-medium text-glow transition-colors duration-[280ms] ease-out-strong hover:text-ink"
          >
            All case studies
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {caseStudies.map((study, index) => (
            <CaseStudyCard
              key={study.slug}
              study={study}
              /* Same asymmetric rhythm the repo grid uses: the leading card
                 spans the row rather than sitting in a uniform matrix. */
              className={index === 0 ? 'lg:col-span-2' : ''}
            />
          ))}
        </div>

        <ProjectsGrid repos={feedRepos} username={username} error={error} />

        <p className="mt-16 max-w-xl text-base leading-relaxed text-ink-dim">
          If any of this looks like the kind of work your team does,{' '}
          <Link
            href="#contact"
            className="text-glow underline underline-offset-4 decoration-glow/40 transition-colors duration-[280ms] ease-out-strong hover:text-ink hover:decoration-ink/40"
          >
            get in touch
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
