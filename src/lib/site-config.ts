import { Github, Linkedin, Mail } from 'lucide-react';

export const siteConfig = {
  name: 'Berktan',
  fullName: 'Berktan Solmaz',
  title: 'Graduate Software Engineer',
  /** Canonical origin. Everything that builds an absolute URL reads this. */
  url: 'https://berktan.dev',
  bio: "I'm a final year BEng Software Engineering student at the University of Westminster in London, graduating in 2027. I build full-stack web apps with React and Next.js, automate game servers, and tinker with ESP32/ESP8266 hardware. Alongside my studies I take on freelance work.",
  email: 'hello@berktan.dev',
  location: 'London, UK',
  /** Central London, for the location widget and the Person schema. */
  coordinates: { latitude: 51.5072, longitude: -0.1276 },
  timeZone: 'Europe/London',
  /**
   * The placement year was cancelled on 2026-08-27, shortening the degree from
   * four years to three. Final year starts September 2026, graduation is
   * summer 2027. Every "graduate role" claim on the site rests on this date.
   */
  graduationYear: 2027,
  /**
   * Shown beside the contact form. A promise, not a fact, so it stays null
   * until Berktan commits to a number himself. The UI renders nothing when it
   * is null, the same way NowPlaying renders nothing when unconfigured.
   */
  responseTime: null as string | null,
  githubUsername: 'AkoSuminoe',
  available: true,
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/AkoSuminoe', icon: Github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yasinberktansolmaz', icon: Linkedin },
    { label: 'Email', href: 'mailto:hello@berktan.dev', icon: Mail },
  ],
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  location?: string;
  /** Renders as the full-width case-study slab in Experience.tsx. Exactly one. */
  featured?: boolean;
  achievements: string[];
};

export type EducationItem = {
  id: string;
  degree: string;
  university: string;
  period: string;
  highlights: string[];
};

export const experience: ExperienceItem[] = [
  {
    id: 'exp0',
    role: 'Software Development Specialist',
    company: 'Volinor Defence and Technology',
    period: 'May 2024 - Sep 2024',
    location: 'Turkey',
    featured: true,
    achievements: [
      'Prepared and compiled technical documentation for 5+ software projects, aligned to engineering standards and client requirements.',
      'Coordinated workflow tooling and task tracking for a 10-person engineering team, lifting task completion efficiency by 20%.',
      'Ran requirement analysis and initial testing for internal tools, adding a 15% productivity increase across teams.',
      'Designed standard reporting templates that cut meeting times by 30%.',
    ],
  },
  {
    id: 'exp1',
    role: 'Full Stack Developer',
    company: 'Freelance',
    period: '2023 - Present',
    location: 'Remote',
    achievements: [
      'Designed and developed modern web applications for various clients using React, Next.js and Node.js.',
      'Implemented responsive, accessible UI components with Tailwind CSS and Framer Motion.',
      'Set up CI/CD pipelines and managed cloud deployments on personal infrastructure.',
    ],
  },
];

export const education: EducationItem[] = [
  {
    id: 'edu1',
    degree: 'BEng Software Engineering',
    university: 'University of Westminster, London',
    /* Three years, not four: the placement year was cancelled 2026-08-27. */
    period: '2024 - 2027',
    highlights: [
      'Coursework across object-oriented programming, database systems, algorithms, and machine learning and data mining.',
      'Building full-stack applications as part of coursework and personal work.',
    ],
  },
];

/*
 * Every entry here must be something Berktan has actually shipped or studied.
 * Derived from the public repos (berktan-dev, Cs2_AwpLego_Server_Creator,
 * 5COSC021W-CWK2-Group-FENER) and his own GitHub profile README, 2026-08-25.
 * The previous list named GraphQL, tRPC, Prisma, Zustand, Playwright, AWS,
 * MongoDB and Figma, none of which appear anywhere in his work. Do not add a
 * technology here to pad the row; a recruiter reads this as a claim.
 */
export const skills = [
  ['TypeScript', 'JavaScript', 'Python', 'Java', 'React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'HTML', 'CSS'],
  ['Django', 'SQL', 'Node.js', 'REST APIs', 'pytest', 'Git', 'GitHub Actions', 'CI/CD', 'Cloud Deployment', 'Jira'],
];
