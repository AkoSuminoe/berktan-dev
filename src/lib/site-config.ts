import { Github, Linkedin, Mail } from 'lucide-react';

export const siteConfig = {
  name: 'Berktan',
  title: 'Developer',
  roles: ['Full Stack Developer', 'UI/UX Enthusiast', 'Open Source Contributor'],
  bio: "I build modern, performant web applications with a focus on clean architecture and great user experience. Passionate about open source and constantly exploring new technologies.",
  email: 'hello@berktan.dev',
  location: 'Turkey',
  githubUsername: 'AkoSuminoe',
  cvUrl: '/cv.pdf',
  available: true,
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/AkoSuminoe', icon: Github },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/berktan', icon: Linkedin },
    { label: 'Email', href: 'mailto:hello@berktan.dev', icon: Mail },
  ],
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  location?: string;
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
  {
    id: 'exp2',
    role: 'Junior Developer',
    company: 'Tech Startup',
    period: '2022 - 2023',
    achievements: [
      'Built internal tools and dashboards that improved team productivity by 30%.',
      'Collaborated with senior developers on API design and database architecture.',
      'Contributed to open-source projects and maintained technical documentation.',
    ],
  },
];

export const education: EducationItem[] = [
  {
    id: 'edu1',
    degree: 'Computer Science',
    university: 'University',
    period: '2020 - 2024',
    highlights: [
      'Focused on software engineering, data structures, and web technologies.',
      'Built multiple full-stack projects as part of coursework and personal interest.',
    ],
  },
];

export const skills = [
  ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Docker', 'GraphQL', 'Redis', 'AWS'],
  ['Python', 'Express', 'MongoDB', 'Git', 'Figma', 'Framer Motion', 'Prisma', 'Linux', 'Vercel', 'Supabase'],
  ['REST APIs', 'CI/CD', 'Firebase', 'Playwright', 'Vitest', 'Turborepo', 'Zustand', 'Zod', 'tRPC', 'Cloudflare'],
];
