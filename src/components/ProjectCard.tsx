'use client';

import { motion } from 'framer-motion';
import { Star, GitFork, ExternalLink, Github } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import type { GitHubRepo } from '@/lib/github';

export default function ProjectCard({
  repo,
  index,
  username,
  className,
}: {
  repo: GitHubRepo;
  index: number;
  username: string;
  className?: string;
}) {
  const demoUrl =
    repo.homepage ||
    (repo.has_pages ? `https://${username}.github.io/${repo.name}/` : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.8,
        delay: (index % 3) * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      <GlassCard className="h-full">
        <article className="group relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight text-ink transition-colors duration-200 group-hover:text-glow">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="before:absolute before:inset-0"
              >
                {repo.name}
              </a>
            </h3>
            <span className="relative z-10 flex shrink-0 items-center gap-2 text-ink-faint">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${repo.name} on GitHub`}
                className="p-1 -m-1 transition-colors duration-300 hover:text-ink"
              >
                <Github className="h-4 w-4" strokeWidth={1.5} />
              </a>
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${repo.name} live demo`}
                  className="p-1 -m-1 transition-colors duration-300 hover:text-ink"
                >
                  <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                </a>
              )}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink-dim line-clamp-2">
            {repo.description || 'No description provided.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
            {repo.language && (
              <span className="text-xs text-glow">{repo.language}</span>
            )}
            {repo.topics.slice(0, 3).map((topic) => (
              <span key={topic} className="text-xs text-ink-faint">
                {topic}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-5 pt-6 font-mono text-xs text-ink-faint">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
              {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5" strokeWidth={1.5} />
              {repo.forks_count}
            </span>
          </div>
        </article>
      </GlassCard>
    </motion.div>
  );
}
