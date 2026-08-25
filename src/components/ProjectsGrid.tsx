'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { GitHubRepo } from '@/lib/github';
import ProjectCard from './ProjectCard';

type SortMode = 'featured' | 'stars' | 'recent';

const SORT_LABELS: Record<SortMode, string> = {
  featured: 'Featured',
  stars: 'Stars',
  recent: 'Recent',
};

/* Asymmetric rhythm: wide, narrow / narrow, wide */
const spanFor = (index: number) => {
  const mod = index % 4;
  return mod === 0 || mod === 3 ? 'lg:col-span-2' : 'lg:col-span-1';
};

export default function ProjectsGrid({
  repos,
  username,
  error,
}: {
  repos: GitHubRepo[];
  username: string;
  error: string | null;
}) {
  const [sortMode, setSortMode] = useState<SortMode>('featured');

  const sortedRepos = useMemo(() => {
    const arr = [...repos];
    switch (sortMode) {
      case 'stars':
        return arr.sort((a, b) => b.stargazers_count - a.stargazers_count);
      case 'recent':
        return arr.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
        );
      default:
        return arr.sort((a, b) => {
          const af = a.topics.includes('featured') ? 1 : 0;
          const bf = b.topics.includes('featured') ? 1 : 0;
          if (af !== bf) return bf - af;
          return b.stargazers_count - a.stargazers_count;
        });
    }
  }, [repos, sortMode]);

  return (
    <>
      <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl font-semibold tracking-tighter text-ink"
        >
          Selected work
        </motion.h2>
        <div className="flex gap-6" role="group" aria-label="Sort projects">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`text-sm transition-colors duration-300 ${
                sortMode === mode
                  ? 'text-ink underline underline-offset-8 decoration-glow/60'
                  : 'text-ink-faint hover:text-ink-dim'
              }`}
            >
              {SORT_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bezel">
          <div className="bezel-core p-8 text-center text-sm text-ink-dim">
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {sortedRepos.map((repo, index) => (
          <ProjectCard
            key={repo.id}
            repo={repo}
            index={index}
            username={username}
            className={spanFor(index)}
          />
        ))}
      </div>

      {!error && sortedRepos.length === 0 && (
        <div className="bezel">
          <div className="bezel-core p-14 text-center text-sm text-ink-faint">
            No repositories found yet.
          </div>
        </div>
      )}
    </>
  );
}
