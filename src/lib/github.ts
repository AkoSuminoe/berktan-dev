import { safeHttpUrl } from '@/lib/url';

export type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  has_pages?: boolean;
  fork: boolean;
  archived?: boolean;
};

/*
 * `safeHttpUrl` now lives in `@/lib/url` because the Spotify route needs the
 * same guarantee. The reason it exists is unchanged: `homepage` is free text a
 * repo owner can set to anything, including a `javascript:` URL, and React
 * renders those into href without complaint in production.
 */

export async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    }
  );

  if (!res.ok) {
    if (res.status === 403 || res.status === 429) {
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    throw new Error(`Failed to fetch GitHub repositories: ${res.statusText}`);
  }

  const repos = (await res.json()) as GitHubRepo[];

  // Filter out forks and archived repos, then sort by stars descending.
  // URLs are sanitised here, at the trust boundary, so every consumer of a
  // GitHubRepo can render them into an href safely.
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .map((repo) => ({
      ...repo,
      html_url: safeHttpUrl(repo.html_url) ?? '',
      homepage: safeHttpUrl(repo.homepage),
      topics: Array.isArray(repo.topics) ? repo.topics : [],
    }))
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}
