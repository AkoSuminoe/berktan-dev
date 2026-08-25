import { getGitHubRepos, type GitHubRepo } from '@/lib/github';
import { siteConfig } from '@/lib/site-config';
import ProjectsGrid from './ProjectsGrid';

export default async function Projects() {
  const username = process.env.GITHUB_USERNAME || siteConfig.githubUsername;
  let repos: GitHubRepo[] = [];
  let error: string | null = null;

  try {
    repos = await getGitHubRepos(username);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load projects.';
  }

  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ProjectsGrid repos={repos} username={username} error={error} />
      </div>
    </section>
  );
}
