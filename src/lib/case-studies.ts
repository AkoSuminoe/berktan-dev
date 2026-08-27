/*
 * Case study content.
 *
 * Deliberately import-free: scripts/generate-og.mjs imports this file directly
 * to render one social card per study, and Node's type stripping can only do
 * that while the module has no path aliases to resolve.
 *
 * Hard Rule 3 applies with full force here. Every line below traces to the CV,
 * to AI_MEMORY.md, or to code in a public repo. There are three studies and
 * not four because 5COSC021W-CWK2-Group-FENER is real but thin: a Django group
 * coursework project, with nothing verifiable to say beyond that. It stays in
 * the live GitHub feed until Berktan writes the part only he knows. A page
 * padded to look substantial is worse than no page.
 */

export type CaseStudy = {
  slug: string;
  /** Full name, used as the H1 and on cards. */
  name: string;
  /** Short form for the title tag, which the root template suffixes. */
  shortName: string;
  tagline: string;
  role: string;
  period: string;
  location?: string;
  /** Page meta description. Long tail, so it can afford to be specific. */
  description: string;
  /** GitHub repo name, so the live feed can skip what already has a page. */
  repo?: string;
  stack: string[];
  context: string[];
  approach?: string[];
  impact?: string[];
  links: { label: string; href: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'volinor',
    name: 'Volinor Defence and Technology',
    shortName: 'Volinor',
    tagline:
      'Four months on the engineering side of a defence technology firm, working on the scaffolding around the code.',
    role: 'Software Development Specialist',
    period: 'May 2024 - Sep 2024',
    location: 'Turkey',
    description:
      'Case study: Software Development Specialist at Volinor Defence and Technology, documenting and coordinating five or more concurrent projects for a ten-person engineering team.',
    stack: [
      'Technical documentation',
      'Requirement analysis',
      'Workflow tooling',
      'Jira',
    ],
    context: [
      'Volinor Defence and Technology is a defence technology firm in Turkey. I spent a summer on the engineering side, alongside a ten-person team running five or more software projects at once.',
      'The work was less about shipping features than about the scaffolding around them: what gets written down, how tasks are tracked, and how a team that size stays aligned when several projects move in parallel.',
    ],
    /*
     * Verbatim from Berktan's CV. AI_MEMORY.md section 3 is explicit that the
     * 20 / 15 / 30 figures are his and must not be softened or re-rounded, so
     * these four lines are reproduced exactly, not split or reworded into a
     * separate approach section.
     */
    impact: [
      'Prepared and compiled technical documentation for 5+ software projects, aligned to engineering standards and client requirements.',
      'Coordinated workflow tooling and task tracking for a 10-person engineering team, lifting task completion efficiency by 20%.',
      'Ran requirement analysis and initial testing for internal tools, adding a 15% productivity increase across teams.',
      'Designed standard reporting templates that cut meeting times by 30%.',
    ],
    links: [{ label: 'volinor.com', href: 'https://volinor.com' }],
  },
  {
    slug: 'berktan-dev',
    name: 'berktan.dev',
    shortName: 'berktan.dev',
    tagline:
      'This site. Built to survive a thirty second skim and to hold up when someone opens the source.',
    role: 'Design and engineering',
    period: '2026',
    description:
      'Case study: building berktan.dev with the Next.js App Router, React Server Components and Framer Motion, self-hosted behind a Cloudflare Tunnel.',
    repo: 'berktan-dev',
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'Cloudflare Tunnel',
    ],
    context: [
      'A portfolio has to do two jobs that pull in opposite directions. It has to be legible to a recruiter who gives it thirty seconds, and it has to survive an engineer opening the source and looking at how it was actually built.',
      'The constraint I set was that every visual decision had to have a reason I could write down, and every performance shortcut had to be one I could defend rather than one I got away with.',
    ],
    approach: [
      'Next.js App Router with React Server Components by default. Every animated piece is an isolated client leaf, which keeps the interactive surface small and leaves most of the page as plain server-rendered markup.',
      'Scroll and pointer input never passes through React state per frame. Motion values drive transforms directly, and the magnetic dock measures item centres with offsetLeft rather than getBoundingClientRect, so a transformed element can never feed its own displacement back into the next calculation.',
      'The preloader is CSS keyframes rather than Framer Motion. It plays while the page hydrates, which is exactly the moment the main thread cannot afford animation driven by requestAnimationFrame.',
      'External data is sanitised where it enters the app rather than where it is rendered. GitHub repository URLs and Spotify album art both pass through one URL guard in the fetch layer, because a repo homepage is free text its owner controls.',
      'The project feed is fetched on the server from the GitHub API and revalidated hourly, so the page stays static while the content stays current.',
    ],
    impact: [
      'Colour tokens, easing curves, duration bands and spring constants are written down rather than improvised, so a change six months from now has something to be consistent with.',
      'Self-hosted on a home server behind a Cloudflare Tunnel, which turned the dependency tree into a real attack surface rather than a formality and forced the security posture to be deliberate.',
    ],
    links: [
      {
        label: 'Source on GitHub',
        href: 'https://github.com/AkoSuminoe/berktan-dev',
      },
    ],
  },
  {
    slug: 'cs2-server-creator',
    name: 'CS2 Server Creator',
    shortName: 'CS2 Server Creator',
    tagline:
      'A Python command line tool that turns a Counter-Strike 2 server setup into one repeatable command.',
    role: 'Solo project',
    period: '2025',
    description:
      'Case study: a layered Python CLI for automating Counter-Strike 2 game server setup, built with httpx, tenacity, rich and pytest, with GitHub Actions running the suite.',
    repo: 'Cs2_AwpLego_Server_Creator',
    stack: ['Python', 'httpx', 'tenacity', 'rich', 'pytest', 'GitHub Actions'],
    context: [
      'Standing up a Counter-Strike 2 game server is the same sequence of steps every time, and every repetition is another chance to get one flag wrong. It is exactly the kind of task that should be code.',
    ],
    approach: [
      'Split into cli, core and models layers, so the command line interface and the logic underneath it can be tested independently of each other.',
      'Network calls go through httpx, with tenacity wrapping the retry behaviour for the steps that fail intermittently.',
      'rich handles the terminal output, so progress and failures stay readable while a long setup runs.',
      'pytest covers the core and GitHub Actions runs the suite on every push.',
    ],
    impact: [
      'The setup is a single command instead of a checklist somebody has to remember.',
      'The tests and the CI are the part that matters most. A personal project still has to prove it works before it ships, and keeping that habit on something nobody asked for is the point.',
    ],
    links: [
      {
        label: 'Source on GitHub',
        href: 'https://github.com/AkoSuminoe/Cs2_AwpLego_Server_Creator',
      },
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

/** Repo names that already have a case study page, for the live GitHub feed. */
export const caseStudyRepos: string[] = caseStudies
  .map((study) => study.repo)
  .filter((repo): repo is string => Boolean(repo));
