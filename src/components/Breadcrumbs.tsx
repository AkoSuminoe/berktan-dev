import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type Crumb = {
  label: string;
  /** Omitted on the current page, which is never a link. */
  href?: string;
};

/*
 * Minimal breadcrumb rail. Mono, because it is metadata rather than prose,
 * which is the same reason periods and counters across the site are mono.
 *
 * Server component: it is a list of links and nothing here moves. The visible
 * trail and the BreadcrumbList structured data are emitted from the same
 * array on each page, so they cannot describe different paths.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-ink-faint">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-[280ms] ease-out-strong hover:text-ink-dim"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'text-ink-dim' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  aria-hidden
                  className="h-3 w-3 text-ink-faint/60"
                  strokeWidth={1.5}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
