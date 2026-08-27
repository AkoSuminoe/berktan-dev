/*
 * Questions a recruiter would otherwise have to email to ask. Answering them
 * on the page removes the reasons not to make contact, which is the whole
 * point of the section.
 *
 * Every answer is a claim about Berktan, so Hard Rule 3 applies: these must
 * stay true as his circumstances change. The right-to-work answer in
 * particular is his to keep current, and it is the one a recruiter checks
 * first. Its wording was supplied by him and should not be reworded or
 * "clarified" by anyone else, because a guess there is a costly guess.
 */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faq: FaqItem[] = [
  {
    id: 'availability',
    question: 'When are you available to start?',
    answer:
      'I graduate in summer 2027 and I am looking for a graduate software engineering role starting after that. I am happy to interview and accept an offer well ahead of the start date, which is how most graduate schemes run anyway.',
  },
  {
    id: 'right-to-work',
    question: 'Do you have the right to work in the UK?',
    answer:
      'I hold a valid UK Student Visa and Graduate Route eligibility. Happy to go through the specifics with your hiring or compliance team at any point in the process.',
  },
  {
    id: 'location',
    question: 'Where are you based, and are you open to hybrid or remote?',
    answer:
      'London. I am set up for hybrid or fully on-site work anywhere reachable in the city, and I am comfortable working remotely, having already done so on freelance projects.',
  },
  {
    id: 'stack',
    question: 'What are you strongest in?',
    answer:
      'TypeScript and React, and Next.js specifically, which is what this site is built with. Python for tooling and automation, and Django from coursework. Comfortable across SQL, REST APIs, Git and GitHub Actions. The case studies are the honest version of this list: they show what I have actually shipped rather than what I have read about.',
  },
  {
    id: 'role',
    question: 'What are you looking for in a first role?',
    answer:
      'Somewhere with code review and people who are better than me to learn from. I care about the details that most people scroll past, so a team that takes craft seriously matters more to me than any particular product or domain.',
  },
  {
    id: 'process',
    question: 'What is the fastest way to reach you?',
    answer:
      'The form on this page, which goes straight to my inbox, or the email address next to it. LinkedIn works too, though it is the slower of the two.',
  },
];
