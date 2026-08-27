import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { buildBreadcrumbGraph } from '@/lib/jsonld';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy',
  description:
    'How berktan.dev handles the small amount of data it collects: the contact form, cookieless analytics, and server logs. UK GDPR.',
  path: '/privacy',
});

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Privacy', path: '/privacy' },
];

/*
 * Static, server rendered, zero client JavaScript.
 *
 * Every processor named here is one the site actually uses. Nothing is
 * described that does not exist: there is no analytics cookie, no advertising
 * network, no tracking pixel and no third-party embed, so the policy says so
 * plainly instead of reciting boilerplate that would be false.
 *
 * LAST_UPDATED is written by hand rather than derived from the build date. A
 * date that moves every time the site is rebuilt tells a reader nothing about
 * when the policy changed. Update it when the content changes.
 */
const LAST_UPDATED = '27 August 2026';

type Section = { heading: string; body: string[] };

const SECTIONS: Section[] = [
  {
    heading: 'Who is responsible',
    body: [
      `This site is a personal portfolio run by ${siteConfig.fullName}, an individual based in London. There is no company behind it and no data protection officer, because neither is required at this scale. Questions about anything on this page go to ${siteConfig.email}.`,
    ],
  },
  {
    heading: 'The contact form',
    body: [
      'If you send a message, the form collects your name, your email address and the message itself. Nothing else is requested and nothing else is stored alongside it.',
      'That message is delivered to my inbox by Resend, an email provider acting as a processor. From that point it lives in my mailbox like any other email, and it stays there for as long as the conversation is useful, which for a recruitment enquiry means somewhere between a few weeks and a couple of years.',
      'The lawful basis is legitimate interest: you contacted me in order to get a reply, and replying requires holding your message and your address. There is no marketing list, and you will never be added to one.',
    ],
  },
  {
    heading: 'Analytics',
    body: [
      'Visits are counted with Cloudflare Web Analytics. It is cookieless: it sets nothing on your device, does not fingerprint your browser, and cannot follow you to another site. What it reports back to me is aggregate, along the lines of how many people opened a page and roughly where in the world they were.',
      'Because none of that identifies you, this site shows no cookie banner. There is nothing to consent to.',
    ],
  },
  {
    heading: 'Hosting and server logs',
    body: [
      'The site runs on a machine I own, reached through a Cloudflare Tunnel, with Cloudflare sitting in front of it as a proxy and CDN. Cloudflare handles the connection and keeps its own request logs, which is inherent to how a proxied domain works.',
      'The server keeps ordinary web server logs. They are used to see whether the site is up and to spot abuse, and they are not combined with anything else or used to profile anyone.',
    ],
  },
  {
    heading: 'Third-party content',
    body: [
      'The project list is fetched from the GitHub API and the now-playing widget from the Spotify API. Both calls are made by the server using my own credentials, not by your browser, so neither service sees your visit or receives anything about you.',
      'Fonts are served from this domain rather than from a font CDN, so loading the page does not announce you to a third party.',
      'The DOOM easter egg is the one exception, and only if you choose to start it: it loads an emulator script from js-dos.com, which means that request comes from your browser. Nothing loads unless you click.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'Under UK GDPR you can ask what I hold about you, ask for a copy, ask for it to be corrected, or ask for it to be deleted. In practice that means whatever is in an email thread between us, and a deletion request is honoured by deleting the thread.',
      `Email ${siteConfig.email} and I will deal with it. If you are not satisfied with how I handle it, you can complain to the Information Commissioner's Office at ico.org.uk.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbGraph(CRUMBS)} />

      <article className="pt-28 sm:pt-36">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: 'Privacy' }]}
          />

          <h1 className="mt-8 text-4xl sm:text-5xl font-semibold tracking-tighter leading-[1.05] text-ink">
            Privacy
          </h1>
          <p className="mt-6 font-mono text-xs text-ink-faint">
            Last updated {LAST_UPDATED}
          </p>

          <p className="mt-10 text-lg leading-relaxed text-ink-dim">
            This site collects very little, and this page is the whole of it in
            plain language rather than the usual template.
          </p>

          <div className="mt-16 space-y-14 pb-24">
            {SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                  {section.heading}
                </h2>
                <div className="mt-6 space-y-5">
                  {section.body.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-base leading-relaxed text-ink-dim"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <div className="pt-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <Link
                href="/"
                className="text-sm text-ink-dim transition-colors duration-[280ms] ease-out-strong hover:text-ink"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}
