/*
 * The CV, as data.
 *
 * Transcribed from `Desktop/IS BASVURU SEYSI/Yasin_Berktan_Solmaz_CV.docx`
 * (re-exported 2026-09-01), which is the authority for everything here. The
 * PDF served from `public/cv/` is exported from that same file, so the page
 * and the download cannot say different things. If the DOCX changes, re-export
 * the PDF and update this file in the same pass.
 *
 * Deliberately NOT derived from `site-config.ts`. That file is downstream of
 * the CV, not the other way round, and the two currently disagree on one
 * point: the CV carries the Jun 2026 backend internship that the home page's
 * experience section does not, and the home page carries a freelance entry the
 * CV does not. Pointing this file at site-config would silently pick a winner.
 *
 * The mobile number on the DOCX is deliberately absent. It is in the PDF, which
 * someone chooses to download; rendering it into a public, crawlable page hands
 * it to every scraper that passes, and that cannot be undone. The business card
 * the QR code is printed on already carries it.
 */

export type CvLink = {
  label: string;
  href: string;
  /** Shown instead of the href. Keeps "github.com/AkoSuminoe" out of the UI. */
  display?: string;
};

export type CvSkillGroup = { label: string; items: string[] };

export type CvRole = {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  /** Renders the live dot, the same signal the availability pill uses. */
  current?: boolean;
  bullets: string[];
};

export type CvProject = {
  id: string;
  name: string;
  stack: string;
  blurb: string;
  repo?: string;
};

export const cv = {
  name: 'Yasin Berktan Solmaz',
  /** One line under the name. Not a summary, a label. */
  headline: 'Final year BEng Software Engineering, University of Westminster',
  location: 'London, UK',
  /*
   * The address printed on the CV itself, so the page and the downloaded PDF
   * agree. The site's own funnel is hi@berktan.dev; if that becomes the one
   * address, change it in the DOCX first and then here.
   */
  email: 'yasinberktansolmaz@outlook.com',
  links: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/yasinberktansolmaz/',
      display: 'in/yasinberktansolmaz',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/AkoSuminoe',
      display: 'AkoSuminoe',
    },
  ] satisfies CvLink[],

  /** Root-relative. The file is committed, so this can never 404. */
  pdfPath: '/cv/yasin-berktan-solmaz-cv.pdf',
  pdfMeta: 'PDF, one page, 150 KB',
  /** Shown as the "as of" line, so an old print is obvious. */
  updated: 'September 2026',

  summary:
    'Final year BEng Software Engineering student at the University of Westminster, currently interning at Volinor Defence and Technology in a backend role. Experience building and deploying full-stack web applications, backend systems and self-hosted projects. Final year project will use both Java and Python.',

  skills: [
    { label: 'Languages', items: ['Python', 'Java', 'JavaScript', 'SQL'] },
    {
      label: 'Tools and platforms',
      items: ['Docker', 'Git and GitHub', 'Linux (Ubuntu, WSL2)', 'Cloudflare Tunnel'],
    },
    {
      label: 'Technologies',
      items: [
        'REST APIs',
        'OAuth',
        'Authentication',
        'Backend development',
        'Full-stack development',
      ],
    },
  ] satisfies CvSkillGroup[],

  experience: [
    {
      id: 'volinor-backend',
      role: 'Full-Stack and Backend Developer Intern',
      company: 'Volinor Defence and Technology Inc.',
      location: 'Turkey',
      period: 'Jun 2026 to present',
      current: true,
      bullets: [
        'Started on-site as a full-stack intern, then moved into a backend-focused role in July and continued remotely through December.',
        'Built the backend of the company website (volinor.com) using Django, writing around 90% of the backend code.',
        'Structured the code with separate model, view and service classes, keeping logic such as admin approval checks encapsulated in their own classes rather than in the views.',
        'Added Google OAuth login and email verification, with an admin-approved whitelist step before new users are given access.',
        'Built the admin panel, including product management and a pending-member queue, with an automatic email to the admin for each new sign-up.',
      ],
    },
    {
      id: 'volinor-spec',
      role: 'Software Development Specialist',
      company: 'Volinor Defence and Technology Inc.',
      location: 'Turkey',
      period: 'May 2024 to Sep 2024',
      bullets: [
        'Wrote technical documentation for 5+ software projects and coordinated workflow tools for a 10-person team.',
        'Supported requirements analysis and testing, and set up reporting templates that made cross-team updates easier.',
      ],
    },
    {
      id: 'waitrose',
      role: 'Customer Assistant',
      company: 'Waitrose and Partners',
      location: 'London',
      period: 'Mar 2025 to Jun 2025',
      bullets: [
        'Handled till operations and day-to-day customer service in a busy retail environment.',
      ],
    },
    {
      id: 'losev',
      role: 'Volunteer Sales Assistant',
      company: 'LOSEV',
      location: 'Turkey',
      period: 'Jun 2022 to Jul 2022',
      bullets: [
        'Supported charity sales and fundraising, contributing to over £2,000 in donations.',
      ],
    },
  ] satisfies CvRole[],

  projects: [
    {
      id: 'berktan-dev',
      name: 'berktan.dev, personal portfolio and home server',
      stack: 'Docker, Ubuntu, Cloudflare Tunnel',
      blurb:
        'Self-hosted portfolio site running on a home laptop, hosting live demos of personal projects.',
      repo: 'https://github.com/AkoSuminoe/berktan-dev',
    },
    {
      id: 'whisper',
      name: 'Whisper Subtitle Generator',
      stack: 'Python, OpenAI Whisper',
      blurb:
        'Tool that generates subtitles from audio and video, deployed as a live demo on berktan.dev.',
      repo: 'https://github.com/AkoSuminoe/whisper-subtitle-generator',
    },
    {
      id: 'cs2',
      name: 'CS2 AWP Lego Server Creator',
      stack: 'C#, CounterStrikeSharp',
      blurb:
        'Setup tool for a dedicated Counter-Strike 2 server with automated configuration and 86% test coverage.',
      repo: 'https://github.com/AkoSuminoe/Cs2_AwpLego_Server_Creator',
    },
    {
      id: 'aim-trace',
      name: 'aim_trace, shooting practice app (team project)',
      stack: 'Flutter and Dart, BLE, IMU',
      blurb:
        'Flutter app that pairs with a wearable IMU sensor band to track hand and gun movement. Built the Bluetooth connection and the data pipeline as one of two developers.',
    },
  ] satisfies CvProject[],

  education: {
    degree: 'BEng Software Engineering',
    university: 'University of Westminster',
    period: '2024 to 2027',
    lines: [
      'Final year project (2026 to 2027): building a software solution using Java and Python, applying system design, testing, version control and deployment.',
      'Relevant modules: object-oriented programming, database systems, machine learning and data mining, algorithms.',
      'Achievements: selected for the WWC Tokyo Programme; WBL Live Project (CSE) Certificate, Aug 2026.',
    ],
  },

  interests: 'Guitar, live music, basketball, karting, fitness and technology projects.',
};
