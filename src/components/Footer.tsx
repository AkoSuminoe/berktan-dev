import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

/*
 * Rendered on every route, so the links here are the site's floor: wherever a
 * recruiter stops reading, there is still a way to the work and a way to
 * reach him. /privacy joins this row in the commit that creates it.
 */
const NAV = [
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/#contact' },
];

export default function Footer() {
  return (
    <footer className="shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pt-12 pb-28 sm:flex-row sm:pb-12 sm:justify-between sm:px-6">
        <p className="order-3 text-sm text-ink-faint sm:order-1">
          © {new Date().getFullYear()} {siteConfig.fullName} · London
        </p>

        <nav
          aria-label="Footer"
          className="order-1 flex items-center gap-6 sm:order-2"
        >
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-ink-faint transition-colors duration-[280ms] ease-out-strong hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 flex items-center gap-5 sm:order-3">
          {siteConfig.socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faint transition-colors duration-[280ms] ease-out-strong hover:text-ink"
              aria-label={link.label}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
