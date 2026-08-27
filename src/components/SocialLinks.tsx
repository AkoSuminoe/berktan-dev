import { ArrowUpRight } from 'lucide-react';
import { siteConfig, isProfileLink } from '@/lib/site-config';

/*
 * One implementation for both places the social links appear, so the footer
 * and the contact section cannot drift apart in behaviour again.
 *
 * The mailto: entry is treated differently from the profile links, which it
 * previously was not:
 * - no target="_blank", which on a mailto: leaves an orphan blank tab behind
 *   while the mail client opens
 * - no rel="noopener noreferrer", which protects against a window that a
 *   mailto: never opens
 * - no rel="me", which only carries meaning pointing at a profile page
 *
 * rel="me" on the two profile links is not decoration: it is the visible-HTML
 * half of the sameAs claim the Person schema makes, and search engines treat
 * a reciprocal me link as corroboration that the profile is really his.
 */

/* 280ms is the site-wide hover band. Colour and transform only. */
const SHARED =
  'transition-[color,transform] duration-[280ms] ease-out-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-abyss motion-reduce:transform-none motion-reduce:transition-colors';

function linkProps(href: string) {
  return isProfileLink(href)
    ? { target: '_blank', rel: 'me noopener noreferrer' }
    : {};
}

/** Icon row. Used in the footer, where the labels would be noise. */
export function SocialIconRow({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-5 ${className ?? ''}`}>
      {siteConfig.socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...linkProps(link.href)}
          aria-label={
            isProfileLink(link.href)
              ? `${link.label} profile, opens in a new tab`
              : `Email ${siteConfig.email}`
          }
          className={`rounded-full text-ink-faint hover:-translate-y-0.5 hover:text-ink ${SHARED}`}
        >
          <link.icon className="h-4 w-4" strokeWidth={1.5} />
        </a>
      ))}
    </div>
  );
}

/** Labelled list. Used in the contact section, where the label is the point. */
export function SocialLinkList({ className }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {siteConfig.socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...linkProps(link.href)}
          className={`group flex w-max items-center gap-3 rounded-full text-sm text-ink-dim hover:text-ink ${SHARED}`}
        >
          <link.icon className="h-4 w-4" strokeWidth={1.5} />
          {link.label}
          {isProfileLink(link.href) && (
            <span className="sr-only">, opens in a new tab</span>
          )}
          <ArrowUpRight
            aria-hidden
            className="h-3.5 w-3.5 opacity-0 transition-[opacity,transform] duration-[280ms] ease-out-strong group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-opacity motion-reduce:group-hover:translate-x-0"
            strokeWidth={1.5}
          />
        </a>
      ))}
    </div>
  );
}
